import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend import main


class MemoryRedis:
    def __init__(self):
        self.values = {}
        self.published = []

    def get(self, key):
        return self.values.get(key)

    def setex(self, key, _ttl, value):
        self.values[key] = value

    def delete(self, *keys):
        for key in keys:
            self.values.pop(key, None)

    def publish(self, channel, message):
        self.published.append((channel, message))
        return 1

    def ping(self):
        return True


@pytest.fixture
def client(monkeypatch):
    test_engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    test_session = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)
    redis = MemoryRedis()
    monkeypatch.setattr(main, "engine", test_engine)
    monkeypatch.setattr(main, "redis_client", redis)

    def override_get_db():
        with test_session() as db:
            yield db

    main.app.dependency_overrides[main.get_db] = override_get_db
    try:
        with TestClient(main.app) as test_client:
            yield test_client
    finally:
        main.app.dependency_overrides.clear()
        test_engine.dispose()


def register(client, *, account_type, email, username, name):
    response = client.post(
        "/api/auth/register",
        json={
            "accountType": account_type,
            "email": email,
            "username": username,
            "name": name,
            "password": "correct-horse-2026",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["access_token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_customer_to_hire_and_chat_flow(client):
    customer_token = register(
        client,
        account_type="customer",
        email="customer@example.com",
        username="customer-one",
        name="Первая компания",
    )
    performer_token = register(
        client,
        account_type="performer",
        email="performer@example.com",
        username="performer-one",
        name="Иван Исполнитель",
    )

    empty_workspace = client.get("/api/company/workspace", headers=auth(customer_token))
    assert empty_workspace.status_code == 200
    assert empty_workspace.json()["deals"] == []
    assert empty_workspace.json()["activities"] == []

    created = client.post(
        "/api/company/tasks",
        headers=auth(customer_token),
        json={
            "title": "Сверстать страницу профиля",
            "desc": "Нужна адаптивная страница профиля на React.",
            "fullDesc": "## Требования\n- React\n- Адаптивная вёрстка",
            "direction": "dev",
            "price": 25000,
            "days": 10,
            "level": "junior",
            "tags": ["React", "CSS"],
            "status": "published",
        },
    )
    assert created.status_code == 201, created.text
    task_id = created.json()["id"]

    public_feed = client.get("/api/tasks")
    assert public_feed.status_code == 200
    assert [task["id"] for task in public_feed.json()] == [task_id]
    detail = client.get(f"/api/tasks/{task_id}")
    assert detail.status_code == 200
    assert detail.json()["title"] == "Сверстать страницу профиля"
    assert "React" in detail.json()["fullDesc"]

    applied = client.post(
        f"/api/tasks/{task_id}/apply",
        headers=auth(performer_token),
        json={"cover": "Сделаю адаптивно, покажу промежуточный вариант."},
    )
    assert applied.status_code == 201, applied.text
    application_id = applied.json()["id"]

    duplicate = client.post(
        f"/api/tasks/{task_id}/apply",
        headers=auth(performer_token),
        json={"cover": "Повторный отклик"},
    )
    assert duplicate.status_code == 409

    applicants = client.get("/api/company/applicants", headers=auth(customer_token))
    assert applicants.status_code == 200
    candidate = applicants.json()[0]
    assert candidate["id"] == application_id
    assert candidate["status"] == "new"
    assert candidate["cover"] == "Сделаю адаптивно, покажу промежуточный вариант."

    assigned = client.patch(
        f"/api/company/applicants/{application_id}",
        headers=auth(customer_token),
        json={"assigneeId": 42},
    )
    assert assigned.status_code == 200, assigned.text
    assert assigned.json()["assigneeId"] == 42

    customer_thread = client.get(
        f"/api/chat/{application_id}/messages", headers=auth(customer_token)
    )
    assert customer_thread.status_code == 200
    assert customer_thread.json()[0]["from"] == "them"
    assert customer_thread.json()[0]["text"] == candidate["cover"]

    sent_by_customer = client.post(
        f"/api/chat/{application_id}/messages",
        headers=auth(customer_token),
        json={"text": "Пришлите, пожалуйста, ссылку на портфолио."},
    )
    assert sent_by_customer.status_code == 201, sent_by_customer.text
    assert sent_by_customer.json()["from"] == "me"

    performer_conversations = client.get(
        "/api/chat/conversations", headers=auth(performer_token)
    )
    assert performer_conversations.status_code == 200
    assert performer_conversations.json()[0]["unread"] == 1
    assert performer_conversations.json()[0]["lastMessage"] == "Пришлите, пожалуйста, ссылку на портфолио."

    performer_thread = client.get(
        f"/api/chat/{application_id}/messages", headers=auth(performer_token)
    )
    assert performer_thread.status_code == 200
    assert performer_thread.json()[-1]["from"] == "them"
    sent_by_performer = client.post(
        f"/api/chat/{application_id}/messages",
        headers=auth(performer_token),
        json={"text": "Вот портфолио: https://example.test/portfolio"},
    )
    assert sent_by_performer.status_code == 201, sent_by_performer.text
    assert sent_by_performer.json()["from"] == "me"

    customer_conversations = client.get(
        "/api/chat/conversations", headers=auth(customer_token)
    )
    assert customer_conversations.status_code == 200
    assert customer_conversations.json()[0]["unread"] == 1

    for stage in ("review", "interview", "offer"):
        changed = client.patch(
            f"/api/company/applicants/{application_id}",
            headers=auth(customer_token),
            json={"status": stage},
        )
        assert changed.status_code == 200, changed.text
        assert changed.json()["status"] == stage

    deal = client.post(
        "/api/company/deals",
        headers=auth(customer_token),
        json={"applicantId": application_id, "amount": 25000},
    )
    assert deal.status_code == 201, deal.text
    deal_data = deal.json()
    assert deal_data["candidateName"] == "Иван Исполнитель"
    assert deal_data["amount"] == 25000
    assert deal_data["status"] == "active"
    assert deal_data["paid"] == 0

    hired_candidate = client.get(
        "/api/company/applicants", headers=auth(customer_token)
    ).json()[0]
    assert hired_candidate["status"] == "hired"
    workspace = client.get("/api/company/workspace", headers=auth(customer_token)).json()
    assert workspace["deals"][0]["id"] == deal_data["id"]
    assert workspace["activities"]
    assert any("Создана сделка" in item["text"] for item in workspace["activities"])

    closed = client.patch(
        f"/api/company/tasks/{task_id}",
        headers=auth(customer_token),
        json={"status": "closed"},
    )
    assert closed.status_code == 200
    assert client.get(f"/api/tasks/{task_id}").status_code == 404


def test_deal_requires_offer_and_is_idempotent(client):
    customer_token = register(
        client,
        account_type="customer",
        email="offer-customer@example.com",
        username="offer-customer",
        name="Заказчик",
    )
    performer_token = register(
        client,
        account_type="performer",
        email="offer-performer@example.com",
        username="offer-performer",
        name="Исполнитель",
    )
    task = client.post(
        "/api/company/tasks",
        headers=auth(customer_token),
        json={
            "title": "Подготовить макет",
            "desc": "Создать макет страницы.",
            "price": 10000,
            "days": 5,
            "status": "published",
        },
    ).json()
    application = client.post(
        f"/api/tasks/{task['id']}/apply",
        headers=auth(performer_token),
        json={"cover": "Готов выполнить задачу."},
    ).json()

    premature_deal = client.post(
        "/api/company/deals",
        headers=auth(customer_token),
        json={"applicantId": application["id"], "amount": 10000},
    )
    assert premature_deal.status_code == 409

    offered = client.patch(
        f"/api/company/applicants/{application['id']}",
        headers=auth(customer_token),
        json={"status": "offer"},
    )
    assert offered.status_code == 200
    first = client.post(
        "/api/company/deals",
        headers=auth(customer_token),
        json={"applicantId": application["id"], "amount": 10000},
    )
    second = client.post(
        "/api/company/deals",
        headers=auth(customer_token),
        json={"applicantId": application["id"], "amount": 20000},
    )
    assert first.status_code == 201
    assert second.status_code == 200
    assert second.json()["id"] == first.json()["id"]
    assert second.json()["amount"] == 10000


def test_hired_candidate_without_deal_can_be_reconciled(client):
    customer_token = register(
        client,
        account_type="customer",
        email="hired-customer@example.com",
        username="hired-customer",
        name="Заказчик",
    )
    performer_token = register(
        client,
        account_type="performer",
        email="hired-performer@example.com",
        username="hired-performer",
        name="Нанятый исполнитель",
    )
    task = client.post(
        "/api/company/tasks",
        headers=auth(customer_token),
        json={
            "title": "Исправить форму",
            "desc": "Исправить отправку формы на странице.",
            "price": 15000,
            "days": 4,
            "status": "published",
        },
    ).json()
    application = client.post(
        f"/api/tasks/{task['id']}/apply",
        headers=auth(performer_token),
        json={"cover": "Есть опыт с формами."},
    ).json()

    hired = client.patch(
        f"/api/company/applicants/{application['id']}",
        headers=auth(customer_token),
        json={"status": "hired"},
    )
    assert hired.status_code == 200

    deal = client.post(
        "/api/company/deals",
        headers=auth(customer_token),
        json={"applicantId": application["id"], "amount": 15000},
    )
    assert deal.status_code == 201, deal.text
    assert deal.json()["status"] == "active"
    assert deal.json()["candidateName"] == "Нанятый исполнитель"


def test_customer_data_and_actions_are_isolated_by_owner(client):
    owner_token = register(
        client,
        account_type="customer",
        email="owner@example.com",
        username="owner-company",
        name="Владелец задания",
    )
    other_customer_token = register(
        client,
        account_type="customer",
        email="other@example.com",
        username="other-company",
        name="Другой заказчик",
    )
    performer_token = register(
        client,
        account_type="performer",
        email="isolation-performer@example.com",
        username="isolation-performer",
        name="Кандидат",
    )
    task = client.post(
        "/api/company/tasks",
        headers=auth(owner_token),
        json={
            "title": "Задание владельца",
            "desc": "Не должно быть видно другому заказчику.",
            "price": 12000,
            "days": 3,
            "status": "published",
        },
    ).json()
    application = client.post(
        f"/api/tasks/{task['id']}/apply",
        headers=auth(performer_token),
        json={"cover": "Отклик кандидата."},
    ).json()

    assert client.get("/api/company/tasks", headers=auth(other_customer_token)).json() == []
    assert client.get("/api/company/applicants", headers=auth(other_customer_token)).json() == []
    assert client.get(
        f"/api/chat/{application['id']}/messages", headers=auth(other_customer_token)
    ).status_code == 404
    assert client.patch(
        f"/api/company/applicants/{application['id']}",
        headers=auth(other_customer_token),
        json={"status": "offer"},
    ).status_code == 404
    assert client.post(
        "/api/company/deals",
        headers=auth(other_customer_token),
        json={"applicantId": application["id"], "amount": 12000},
    ).status_code == 404
    assert client.post(
        "/api/company/tasks",
        headers=auth(performer_token),
        json={
            "title": "Запрещённое задание",
            "desc": "Исполнитель не может создавать CRM-задания.",
            "price": 100,
            "days": 1,
        },
    ).status_code == 403

