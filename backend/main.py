from contextlib import asynccontextmanager
import asyncio
from datetime import date, datetime, timedelta, timezone
import hashlib
import json
import os
import re
import secrets
import unicodedata
from typing import Annotated, Any, Literal

from fastapi import Depends, FastAPI, HTTPException, Response, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from pydantic import BaseModel, ConfigDict, Field
from redis import Redis
from redis.exceptions import RedisError
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .auth_schemas import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from .database import Base, SessionLocal, engine, get_db
from .models import CompanyTask, CompanyWorkspace, TaskApplication, User, UserProfile, UserSession, UserWallet
from .profile_schemas import ProfileResponse, ProfileStats, ProfileUpdate

SESSION_LIFETIME_DAYS = 14
redis_client = Redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    decode_responses=True,
    socket_connect_timeout=1,
    socket_timeout=1,
)
password_hash = PasswordHash.recommended()
dummy_password_hash = password_hash.hash("not-a-real-user-password")
bearer_scheme = HTTPBearer(auto_error=False)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="SKILLGIT API", lifespan=lifespan)
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)


class CompanyTaskCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(min_length=3, max_length=180)
    desc: str = Field(min_length=1, max_length=5000)
    full_desc: str = Field(default="", alias="fullDesc", max_length=20000)
    direction: str = Field(default="dev", max_length=64)
    price: int = Field(ge=0, le=100000000)
    days: int = Field(ge=1, le=3650)
    level: str = Field(default="junior", max_length=32)
    tags: list[str] = Field(default_factory=list, max_length=20)
    status: Literal["draft", "published"] = "published"


class TaskStatusUpdate(BaseModel):
    status: Literal["draft", "published", "paused", "closed"]


class ApplicationCreate(BaseModel):
    cover: str = Field(default="", max_length=3000)


class ApplicationStatusUpdate(BaseModel):
    status: Literal["new", "review", "interview", "offer", "hired", "rejected"] | None = None
    assignee_id: int | None = Field(default=None, alias="assigneeId")

    model_config = ConfigDict(populate_by_name=True)


class CompanyWorkspacePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    company: dict[str, Any] | None = None
    applicantNotes: dict[str, list[dict[str, Any]]] | None = None
    activities: list[dict[str, Any]] | None = None
    team: list[dict[str, Any]] | None = None


class DealMilestoneCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(min_length=3, max_length=120)
    due_date: date = Field(alias="dueDate")


class DealCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    applicant_id: int = Field(alias="applicantId")
    amount: int = Field(ge=1, le=100000000)
    milestones: list[DealMilestoneCreate] = Field(default_factory=list, max_length=12)


class MilestoneSubmissionCreate(BaseModel):
    message: str = Field(min_length=5, max_length=5000)
    url: str | None = Field(default=None, max_length=1000)


class MilestoneReviewCreate(BaseModel):
    decision: Literal["approve", "revision"]
    feedback: str = Field(default="", max_length=3000)


class DealReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str = Field(min_length=3, max_length=2000)


class BalanceChange(BaseModel):
    amount: int = Field(ge=1, le=100000000)


class ThreadPinUpdate(BaseModel):
    pinned: bool


class ChatMessageCreate(BaseModel):
    text: str = Field(min_length=1, max_length=5000)


def empty_workspace(user: User) -> dict[str, Any]:
    profile = user.profile
    return {
        "company": {
            "id": user.id,
            "name": profile.company if profile and profile.company else user.name,
            "color": "#3b82f6",
            "industry": "",
            "verified": False,
            "plan": "Free",
            "balance": 0,
            "email": user.email,
            "website": profile.website if profile else "",
            "description": profile.bio if profile else "",
            "managers": 1,
        },
        "applicantNotes": {},
        "applicantAssignees": {},
        "deals": [],
        "activities": [],
        "team": [],
        "messages": [],
        "threads": {},
        "billing": [],
    }


def cache_get(key: str) -> Any | None:
    try:
        raw = redis_client.get(key)
        return json.loads(raw) if raw else None
    except (RedisError, json.JSONDecodeError):
        return None


def cache_set(key: str, value: Any, ttl: int = 30) -> None:
    try:
        redis_client.setex(key, ttl, json.dumps(value, ensure_ascii=False))
    except (RedisError, TypeError):
        return


def notify_crm(owner_id: int, event: str, payload: dict[str, Any] | None = None) -> None:
    try:
        redis_client.delete(
            f"crm:workspace:{owner_id}",
            f"crm:tasks:{owner_id}",
            f"crm:applicants:{owner_id}",
            "crm:public-tasks",
        )
        redis_client.publish(f"crm:events:{owner_id}", json.dumps({"event": event, "payload": payload or {}}, ensure_ascii=False))
    except RedisError:
        return


def get_workspace_row(db: Session, user: User) -> CompanyWorkspace:
    workspace = db.scalar(select(CompanyWorkspace).where(CompanyWorkspace.owner_id == user.id).with_for_update())
    if workspace is None:
        workspace = CompanyWorkspace(owner_id=user.id, data=empty_workspace(user))
        db.add(workspace)
        db.flush()
    return workspace


def append_activity(data: dict[str, Any], event_type: str, text: str, actor: str) -> None:
    activities = list(data.get("activities") or [])
    activities.insert(0, {
        "id": int(datetime.now().timestamp() * 1000) + secrets.randbelow(1000),
        "type": event_type,
        "text": text,
        "time": datetime.now().astimezone().strftime("%d %b, %H:%M"),
        "actor": actor,
    })
    data["activities"] = activities[:100]


def write_workspace(db: Session, user: User, updates: dict[str, Any], event: str | None = None) -> dict[str, Any]:
    workspace = get_workspace_row(db, user)
    data = {**empty_workspace(user), **(workspace.data or {})}
    if "company" in updates:
        limits = {"name": 160, "industry": 120, "email": 320, "website": 255, "description": 2000}
        editable = {
            key: str(updates["company"][key]).strip()[:limit]
            for key, limit in limits.items()
            if key in updates["company"]
        }
        if "name" in editable and not editable["name"]:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Название компании не может быть пустым")
        updates = {**updates, "company": {**data["company"], **editable}}
    data.update(updates)
    company = updates.get("company")
    if company and "name" in company:
        profile = user.profile
        if profile is None:
            profile = UserProfile(user_id=user.id)
            db.add(profile)
        profile.company = str(company["name"]).strip()[:160]
        if "website" in company:
            profile.website = str(company["website"])[:255]
        if "description" in company:
            profile.bio = str(company["description"])[:2000]
    workspace.data = data
    db.commit()
    if event:
        notify_crm(user.id, event)
    else:
        notify_crm(user.id, "workspace.updated")
    return data


def serialize_chat_messages(raw_messages: list[dict[str, Any]], account_type: str) -> list[dict[str, Any]]:
    current_type = "customer" if account_type == "customer" else "performer"
    return [
        {
            **message,
            "from": "me" if message.get("senderType") == current_type else "them",
            "read": bool(message.get("read", False)),
        }
        for message in raw_messages
    ]


def require_customer(user: User) -> None:
    if user.account_type != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CRM доступна только заказчикам")


def require_performer(user: User) -> None:
    if user.account_type != "performer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Откликаться могут только исполнители")


def parse_task_id(task_id: str) -> int:
    try:
        return int(task_id.removeprefix("crm-"))
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задание не найдено") from None


def format_task(task: CompanyTask, applicant_count: int = 0) -> dict:
    posted = task.created_at
    status_labels = {"draft": "Черновик", "published": "Опубликовано", "paused": "На паузе", "closed": "Закрыто"}
    return {
        "id": f"crm-{task.id}",
        "company": task.owner.profile.company if task.owner.profile and task.owner.profile.company else task.owner.name,
        "companySlug": task.owner.username,
        "companyColor": "#3b82f6",
        "direction": task.direction,
        "badge": {"text": "Новое", "kind": "new"},
        "verified": False,
        "highPay": task.price >= 15000,
        "title": task.title,
        "desc": task.description,
        "fullDesc": task.full_description,
        "tags": task.tags or [],
        "price": task.price,
        "priceLabel": f"{task.price:,}".replace(",", " ") + " ₽",
        "days": task.days,
        "daysLabel": f"{task.days} дн.",
        "applicants": applicant_count,
        "level": task.level,
        "postedAt": posted.strftime("%d.%m.%Y") if posted else "только что",
        "status": task.status,
        "statusLabel": status_labels[task.status],
        "views": 0,
        "conversions": 0,
        "source": "custom",
        "assigneeId": None,
    }


_CYRILLIC_SLUG_MAP = str.maketrans({
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
})


def company_slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value.strip().lower()).translate(_CYRILLIC_SLUG_MAP)
    ascii_text = "".join(char for char in normalized if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")


def format_application(application: TaskApplication) -> dict:
    performer = application.performer
    profile = performer.profile
    return {
        "id": application.id,
        "taskId": f"crm-{application.task_id}",
        "taskTitle": application.task.title,
        "userName": performer.name,
        "username": performer.username,
        "avatar": performer.name[:1].upper(),
        "rating": None,
        "skills": profile.skills if profile else [],
        "status": application.status,
        "appliedAt": application.created_at.strftime("%d.%m.%Y") if application.created_at else "сейчас",
        "createdAt": application.created_at.isoformat() if application.created_at else None,
        "cover": application.cover,
        "assigneeId": None,
        "tags": [],
        "source": "SKILLGIT",
    }


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def is_session_expired(expires_at: datetime, now: datetime | None = None) -> bool:
    """Compare session expiry consistently across timezone-aware and SQLite datetimes."""
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        current = current.replace(tzinfo=timezone.utc)
    return expires_at <= current


def make_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        username=user.username,
        role=("Исполнитель" if user.account_type == "performer" and user.role == "Студент" else user.role),
        account_type=user.account_type,
        direction=user.direction,
    )


def get_performer_deal_records(db: Session, user: User) -> list[dict[str, Any]]:
    applications = db.scalars(
        select(TaskApplication)
        .where(TaskApplication.performer_id == user.id)
        .order_by(TaskApplication.created_at.desc())
    ).all()
    records = []
    for application in applications:
        owner = application.task.owner
        workspace = db.get(CompanyWorkspace, owner.id)
        if workspace is None:
            continue
        deals = (workspace.data or {}).get("deals") or []
        deal = next((item for item in deals if item.get("applicantId") == application.id), None)
        if deal is None:
            continue
        company_name = owner.profile.company if owner.profile and owner.profile.company else owner.name
        records.append({
            **deal,
            "companyId": owner.id,
            "companyName": company_name,
            "companyUsername": owner.username,
            "taskId": f"crm-{application.task_id}",
            "taskTitle": application.task.title,
            "taskDescription": application.task.description,
            "taskTags": application.task.tags or [],
            "taskPrice": application.task.price,
            "taskDays": application.task.days,
            "taskStatus": application.task.status,
        })
    return records


def make_profile_response(user: User, profile: UserProfile | None, db: Session) -> ProfileResponse:
    stats = ProfileStats()
    tasks: list[dict[str, Any]] = []
    reviews: list[dict[str, Any]] = []
    if user.account_type == "performer":
        deals = get_performer_deal_records(db, user)
        wallet = db.get(UserWallet, user.id)
        completed_count = sum(1 for deal in deals if deal.get("status") == "completed")
        active_count = sum(1 for deal in deals if deal.get("status") in {"planning", "active", "revision"})
        review_count = sum(1 for deal in deals if deal.get("review"))
        ratings = [deal["review"]["rating"] for deal in deals if deal.get("review")]
        stats = ProfileStats(
            tasksDone=completed_count,
            tasksActive=active_count,
            tasksReview=sum(1 for deal in deals if deal.get("status") == "in_review"),
            balanceAmount=wallet.balance if wallet else 0,
            balanceLabel=f"{(wallet.balance if wallet else 0):,} ₽".replace(",", " "),
            rating=round(sum(ratings) / len(ratings), 1) if ratings else None,
            reviews=review_count,
        )
        for deal in deals:
            last_milestone = (deal.get("milestones") or [])[-1:]
            deadline = last_milestone[0].get("dueDate", "—") if last_milestone else "—"
            tasks.append({
                "id": f"{deal['companyId']}-{deal['id']}",
                "dealId": deal["id"],
                "companyId": deal["companyId"],
                "taskId": deal["taskId"],
                "company": deal["companyName"],
                "companyColor": "#3b82f6",
                "title": deal["taskTitle"],
                "desc": deal.get("taskDescription", ""),
                "tags": deal.get("taskTags", []),
                "priceLabel": f"{int(deal.get('amount', 0)):,} ₽".replace(",", " "),
                "deadline": deadline,
                "status": "completed" if deal.get("status") == "completed" else "review" if deal.get("status") == "in_review" else "in_progress",
                "statusLabel": "Выполнена" if deal.get("status") == "completed" else "На проверке" if deal.get("status") == "in_review" else "В работе",
            })
            review = deal.get("review")
            if review:
                reviews.append({
                    "id": f"{deal['companyId']}-{deal['id']}",
                    "author": review.get("author", deal["companyName"]),
                    "company": deal["companyName"],
                    "task": deal["taskTitle"],
                    "rating": review["rating"],
                    "text": review["text"],
                    "date": review.get("createdAt", ""),
                })

    return ProfileResponse(
        **make_user_response(user).model_dump(),
        bio=profile.bio if profile else "",
        skills=profile.skills if profile else [],
        location=profile.location if profile else "",
        website=profile.website if profile else "",
        company=profile.company if profile else "",
        stats=stats,
        tasks=tasks,
        reviews=reviews,
        activity=[],
        teams=[],
    )


def create_session(db: Session, user: User) -> str:
    token = secrets.token_urlsafe(32)
    db.add(UserSession(
        user_id=user.id,
        token_hash=token_digest(token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=SESSION_LIFETIME_DAYS),
    ))
    return token


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Требуется вход")

    auth_session = db.scalar(
        select(UserSession).where(UserSession.token_hash == token_digest(credentials.credentials))
    )
    if auth_session is None or is_session_expired(auth_session.expires_at):
        if auth_session is not None:
            db.delete(auth_session)
            db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Сессия истекла или отозвана")

    return auth_session.user


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}


@app.get("/health")
def health_check():
    try:
        redis_client.ping()
    except RedisError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Redis недоступен") from None
    return {"status": "ok", "redis": "ok"}


@app.websocket("/ws/company")
async def company_event_socket(websocket: WebSocket):
    await websocket.accept()
    try:
        auth = await asyncio.wait_for(websocket.receive_json(), timeout=10)
        token = auth.get("token") if isinstance(auth, dict) else None
        if not token:
            await websocket.close(code=4401)
            return
        with SessionLocal() as db:
            auth_session = db.scalar(
                select(UserSession).where(UserSession.token_hash == token_digest(token))
            )
            if (auth_session is None or is_session_expired(auth_session.expires_at)
                    or auth_session.user.account_type != "customer"):
                await websocket.close(code=4401)
                return
            owner_id = auth_session.user_id
        subscriber = redis_client.pubsub()
        subscriber.subscribe(f"crm:events:{owner_id}")
        try:
            while True:
                event = await asyncio.to_thread(
                    subscriber.get_message,
                    ignore_subscribe_messages=True,
                    timeout=1,
                )
                if event and event.get("data"):
                    await websocket.send_text(event["data"])
        finally:
            subscriber.close()
    except (WebSocketDisconnect, asyncio.TimeoutError):
        return
    except RedisError:
        await websocket.close(code=1013)


@app.post("/api/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Annotated[Session, Depends(get_db)]):
    email = str(data.email).strip().lower()
    if db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Аккаунт с таким email уже существует")

    username = data.username
    if username and db.scalar(select(User.id).where(User.username == username)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Это имя пользователя уже занято")
    if not username:
        username = f"user-{secrets.token_hex(5)}"

    user = User(
        email=email,
        password_hash=password_hash.hash(data.password),
        name=data.name,
        username=username,
        account_type=data.account_type,
        role="Исполнитель" if data.account_type == "performer" else "Заказчик",
        direction=data.direction if data.account_type == "performer" else None,
    )
    db.add(user)
    try:
        db.flush()
        db.add(UserProfile(user_id=user.id))
        token = create_session(db, user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email или имя пользователя уже занято") from None

    return AuthResponse(access_token=token, user=make_user_response(user))


@app.post("/api/auth/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    email = str(data.email).strip().lower()
    user = db.scalar(
        select(User).where(User.email == email, User.account_type == data.account_type)
    )
    stored_hash = user.password_hash if user else dummy_password_hash
    password_matches = password_hash.verify(data.password, stored_hash)
    if user is None or not password_matches:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email, пароль или тип аккаунта",
        )

    token = create_session(db, user)
    db.commit()
    return AuthResponse(access_token=token, user=make_user_response(user))


@app.get("/api/auth/me", response_model=UserResponse)
def current_user(user: Annotated[User, Depends(get_current_user)]):
    return make_user_response(user)


@app.get("/api/company/workspace")
def company_workspace(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    key = f"crm:workspace:{user.id}"
    cached = cache_get(key)
    if cached is not None:
        return cached
    workspace = get_workspace_row(db, user)
    db.commit()
    data = {**empty_workspace(user), **(workspace.data or {})}
    data["threads"] = {
        thread_id: serialize_chat_messages(thread, "customer")
        for thread_id, thread in (data.get("threads") or {}).items()
    }
    cache_set(key, data, 60)
    return data


@app.patch("/api/company/workspace")
def update_company_workspace(
    patch: CompanyWorkspacePatch,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    updates = patch.model_dump(exclude_unset=True, exclude_none=True)
    data = write_workspace(db, user, updates)
    return data


@app.post("/api/company/billing/top-up")
def top_up_company_balance(
    change: BalanceChange,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    if change.amount < 1000:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Минимальное пополнение — 1 000 ₽")
    workspace = get_workspace_row(db, user)
    data = {**empty_workspace(user), **(workspace.data or {})}
    company = dict(data["company"])
    company["balance"] = int(company.get("balance", 0)) + change.amount
    data["company"] = company
    billing = list(data.get("billing") or [])
    billing.insert(0, {
        "id": max((int(item.get("id", 0)) for item in billing), default=0) + 1,
        "date": datetime.now().astimezone().strftime("%d %b %Y"),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "title": "Пополнение внутреннего баланса",
        "amount": change.amount,
        "type": "topup",
    })
    data["billing"] = billing
    append_activity(data, "billing", f"Баланс пополнен на {change.amount:,} ₽".replace(",", " "), user.name)
    workspace.data = data
    db.commit()
    notify_crm(user.id, "billing.updated")
    return {"company": company, "billing": billing}


@app.post("/api/company/deals", status_code=status.HTTP_201_CREATED)
def create_company_deal(
    deal_data: DealCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    response: Response,
):
    require_customer(user)
    application = db.scalar(
        select(TaskApplication)
        .join(CompanyTask)
        .where(TaskApplication.id == deal_data.applicant_id, CompanyTask.owner_id == user.id)
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Отклик не найден")
    workspace = get_workspace_row(db, user)
    data = {**empty_workspace(user), **(workspace.data or {})}
    deals = list(data.get("deals") or [])
    previous = next((deal for deal in deals if deal.get("applicantId") == application.id), None)
    if previous:
        response.status_code = status.HTTP_200_OK
        return previous
    if application.status not in {"offer", "hired"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Перед созданием сделки переведите кандидата на этап «Оффер» или «В работе»",
        )
    scheduled_milestones = deal_data.milestones
    if scheduled_milestones:
        if deal_data.amount < len(scheduled_milestones) or any(not milestone.title.strip() for milestone in scheduled_milestones):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Проверьте названия этапов и сумму сделки")
        if any(milestone.due_date < date.today() for milestone in scheduled_milestones):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Сроки этапов должны быть сегодня или позже")
        if [item.due_date for item in scheduled_milestones] != sorted(item.due_date for item in scheduled_milestones):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Укажите этапы в порядке сроков выполнения")
        base_amount, remainder = divmod(deal_data.amount, len(scheduled_milestones))
        milestones = [
            {
                "id": index,
                "title": item.title.strip(),
                "amount": base_amount + (1 if index <= remainder else 0),
                "dueDate": item.due_date.isoformat(),
                "status": "active" if index == 1 else "pending",
                "submission": None,
                "feedback": "",
            }
            for index, item in enumerate(scheduled_milestones, start=1)
        ]
    else:
        milestones = []
    deal = {
        "id": max((int(item.get("id", 0)) for item in deals), default=0) + 1,
        "applicantId": application.id,
        "taskId": f"crm-{application.task_id}",
        "taskTitle": application.task.title,
        "candidateName": application.performer.name,
        "username": application.performer.username,
        "amount": deal_data.amount,
        "paid": 0,
        "status": "active" if milestones else "planning",
        "progress": 0,
        "deadline": milestones[-1]["dueDate"] if milestones else "—",
        "milestone": milestones[0]["title"] if milestones else "Этапы не заданы",
        "milestones": milestones,
        "currentMilestoneId": milestones[0]["id"] if milestones else None,
        "review": None,
        "createdAt": datetime.now().astimezone().strftime("%d %b %Y"),
    }
    deals.insert(0, deal)
    data["deals"] = deals
    application.status = "hired"
    append_activity(data, "deal", f"Создана сделка с {application.performer.name} на {deal_data.amount:,} ₽".replace(",", " "), user.name)
    workspace.data = data
    db.commit()
    notify_crm(user.id, "deal.created", {"dealId": deal["id"]})
    return deal


@app.post("/api/company/deals/{deal_id}/pay")
def pay_company_deal(
    deal_id: int,
    change: BalanceChange,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    if change.amount < 1:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Сумма выплаты должна быть положительной")
    workspace = get_workspace_row(db, user)
    data = {**empty_workspace(user), **(workspace.data or {})}
    deals = list(data.get("deals") or [])
    deal = next((item for item in deals if item.get("id") == deal_id), None)
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сделка не найдена")
    if deal.get("milestones"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Выплата по этапу проводится после его принятия заказчиком")
    remaining = int(deal["amount"]) - int(deal.get("paid", 0))
    if deal.get("status") != "active" or change.amount > remaining:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Сумма превышает остаток по сделке")
    company = dict(data["company"])
    if int(company.get("balance", 0)) < change.amount:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Недостаточно средств на балансе")
    deal["paid"] = int(deal.get("paid", 0)) + change.amount
    deal["progress"] = min(100, round(deal["paid"] / deal["amount"] * 100))
    if deal["paid"] >= deal["amount"]:
        deal["status"] = "completed"
    data["deals"] = deals
    company["balance"] = int(company.get("balance", 0)) - change.amount
    data["company"] = company
    billing = list(data.get("billing") or [])
    billing.insert(0, {
        "id": max((int(item.get("id", 0)) for item in billing), default=0) + 1,
        "date": datetime.now().astimezone().strftime("%d %b %Y"),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "title": f"Выплата по сделке #{deal_id}",
        "amount": -change.amount,
        "type": "payout",
        "dealId": deal_id,
    })
    data["billing"] = billing
    append_activity(data, "deal", f"Выплата {change.amount:,} ₽ по сделке с {deal['candidateName']}".replace(",", " "), user.name)
    workspace.data = data
    db.commit()
    notify_crm(user.id, "deal.paid", {"dealId": deal_id})
    return {"deal": deal, "company": company, "billing": billing}


@app.get("/api/my/deals")
def performer_deals(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_performer(user)
    return get_performer_deal_records(db, user)


@app.post("/api/my/deals/{company_id}/{deal_id}/milestones/{milestone_id}/submit")
def submit_deal_milestone(
    company_id: int,
    deal_id: int,
    milestone_id: int,
    submission: MilestoneSubmissionCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_performer(user)
    workspace = db.get(CompanyWorkspace, company_id)
    if workspace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сделка не найдена")
    data = {**empty_workspace(user), **(workspace.data or {})}
    deal = next((item for item in data.get("deals", []) if item.get("id") == deal_id), None)
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сделка не найдена")
    application = db.scalar(
        select(TaskApplication)
        .join(CompanyTask)
        .where(
            TaskApplication.id == deal.get("applicantId"),
            TaskApplication.performer_id == user.id,
            CompanyTask.owner_id == company_id,
        )
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сделка не найдена")
    milestone = next((item for item in deal.get("milestones", []) if item.get("id") == milestone_id), None)
    if milestone is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Этап не найден")
    if deal.get("status") not in {"active", "revision"} or deal.get("currentMilestoneId") != milestone_id or milestone.get("status") not in {"active", "revision"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Сейчас нельзя сдать этот этап")
    url = submission.url.strip() if submission.url else ""
    if url and not url.startswith(("https://", "http://")):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Ссылка должна начинаться с http:// или https://")

    history = list(milestone.get("submissionHistory") or [])
    submitted = {
        "id": len(history) + 1,
        "message": submission.message.strip(),
        "url": url,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    history.append(submitted)
    milestone["submissionHistory"] = history
    milestone["submission"] = submitted
    milestone["feedback"] = ""
    milestone["status"] = "submitted"
    deal["status"] = "in_review"
    data["deals"] = [deal if item.get("id") == deal_id else item for item in data.get("deals", [])]
    append_activity(data, "deal", f"{user.name} сдал этап «{milestone['title']}» по сделке #{deal_id}", user.name)
    workspace.data = data
    db.commit()
    notify_crm(company_id, "deal.milestone.submitted", {"dealId": deal_id, "milestoneId": milestone_id})
    return deal


@app.post("/api/company/deals/{deal_id}/milestones/{milestone_id}/review")
def review_deal_milestone(
    deal_id: int,
    milestone_id: int,
    review: MilestoneReviewCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    workspace = get_workspace_row(db, user)
    data = {**empty_workspace(user), **(workspace.data or {})}
    deal = next((item for item in data.get("deals", []) if item.get("id") == deal_id), None)
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сделка не найдена")
    milestone = next((item for item in deal.get("milestones", []) if item.get("id") == milestone_id), None)
    if milestone is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Этап не найден")
    if deal.get("status") != "in_review" or milestone.get("status") != "submitted":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Этап ещё не отправлен на проверку")

    if review.decision == "revision":
        if len(review.feedback.strip()) < 3:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Опишите, что нужно исправить")
        milestone["status"] = "revision"
        milestone["feedback"] = review.feedback.strip()
        deal["status"] = "revision"
        activity_text = f"Запрошена доработка этапа «{milestone['title']}» по сделке #{deal_id}"
    else:
        application = db.scalar(
            select(TaskApplication)
            .join(CompanyTask)
            .where(TaskApplication.id == deal.get("applicantId"), CompanyTask.owner_id == user.id)
        )
        if application is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Исполнитель по сделке не найден")
        amount = int(milestone.get("amount", 0))
        company = dict(data["company"])
        balance = int(company.get("balance", 0))
        if balance < amount:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Недостаточно средств на балансе компании. Пополните баланс и повторите проверку.")
        wallet = db.get(UserWallet, application.performer_id)
        if wallet is None:
            wallet = UserWallet(user_id=application.performer_id, balance=0)
            db.add(wallet)
        wallet.balance += amount
        company["balance"] = balance - amount
        data["company"] = company

        milestone["status"] = "approved"
        milestone["approvedAt"] = datetime.now(timezone.utc).isoformat()
        milestone["feedback"] = review.feedback.strip()
        deal["paid"] = int(deal.get("paid", 0)) + amount
        deal["progress"] = min(100, round(deal["paid"] / max(int(deal.get("amount", 1)), 1) * 100))
        next_milestone = next((item for item in deal.get("milestones", []) if item.get("status") == "pending"), None)
        if next_milestone:
            next_milestone["status"] = "active"
            deal["currentMilestoneId"] = next_milestone["id"]
            deal["status"] = "active"
        else:
            deal["currentMilestoneId"] = None
            deal["status"] = "completed"

        billing = list(data.get("billing") or [])
        billing.insert(0, {
            "id": max((int(item.get("id", 0)) for item in billing), default=0) + 1,
            "date": datetime.now().astimezone().strftime("%d %b %Y"),
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "title": f"Выплата за этап «{milestone['title']}» · {deal['candidateName']}",
            "amount": -amount,
            "type": "payout",
            "dealId": deal_id,
        })
        data["billing"] = billing
        activity_text = f"Принят этап «{milestone['title']}», выплачено {amount:,} ₽ · {deal['candidateName']}".replace(",", " ")

    data["deals"] = [deal if item.get("id") == deal_id else item for item in data.get("deals", [])]
    append_activity(data, "deal", activity_text, user.name)
    workspace.data = data
    db.commit()
    notify_crm(user.id, "deal.milestone.reviewed", {"dealId": deal_id, "milestoneId": milestone_id})
    return {"deal": deal, "company": data["company"], "billing": data.get("billing", [])}


@app.post("/api/company/deals/{deal_id}/review")
def review_completed_deal(
    deal_id: int,
    review: DealReviewCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    workspace = get_workspace_row(db, user)
    data = {**empty_workspace(user), **(workspace.data or {})}
    deal = next((item for item in data.get("deals", []) if item.get("id") == deal_id), None)
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сделка не найдена")
    if deal.get("status") != "completed":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Оставить отзыв можно после завершения сделки")
    if deal.get("review"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Отзыв по этой сделке уже оставлен")
    deal["review"] = {
        "rating": review.rating,
        "text": review.text.strip(),
        "author": user.name,
        "createdAt": datetime.now().astimezone().strftime("%d.%m.%Y"),
    }
    data["deals"] = [deal if item.get("id") == deal_id else item for item in data.get("deals", [])]
    append_activity(data, "deal", f"Оставлен отзыв о {deal['candidateName']} · {deal['taskTitle']}", user.name)
    workspace.data = data
    db.commit()
    notify_crm(user.id, "deal.review.created", {"dealId": deal_id})
    return deal


@app.patch("/api/company/messages/{application_id}")
def update_company_message_thread(
    application_id: int,
    update: ThreadPinUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    application = db.scalar(
        select(TaskApplication)
        .join(CompanyTask)
        .where(TaskApplication.id == application_id, CompanyTask.owner_id == user.id)
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Диалог не найден")
    workspace = get_workspace_row(db, user)
    data = {**empty_workspace(user), **(workspace.data or {})}
    data["messages"] = [
        {**item, "pinned": update.pinned} if item.get("id") == application_id else item
        for item in data.get("messages", [])
    ]
    workspace.data = data
    db.commit()
    notify_crm(user.id, "message.updated", {"applicationId": application_id})
    return {"id": application_id, "pinned": update.pinned}


@app.get("/api/company/tasks")
def company_tasks(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    key = f"crm:tasks:{user.id}"
    cached = cache_get(key)
    if cached is not None:
        return cached
    tasks = db.scalars(select(CompanyTask).where(CompanyTask.owner_id == user.id).order_by(CompanyTask.created_at.desc())).all()
    result = [
        format_task(task, db.scalar(select(func.count(TaskApplication.id)).where(TaskApplication.task_id == task.id)) or 0)
        for task in tasks
    ]
    cache_set(key, result)
    return result


@app.post("/api/company/tasks", status_code=status.HTTP_201_CREATED)
def create_company_task(
    data: CompanyTaskCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    task = CompanyTask(
        owner_id=user.id,
        title=data.title.strip(),
        description=data.desc.strip(),
        full_description=data.full_desc.strip(),
        direction=data.direction,
        price=data.price,
        days=data.days,
        level=data.level,
        tags=[tag.strip()[:40] for tag in data.tags if tag.strip()],
        status=data.status,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    notify_crm(user.id, "task.created", {"taskId": f"crm-{task.id}"})
    return format_task(task)


@app.patch("/api/company/tasks/{task_id}")
def update_company_task(
    task_id: str,
    data: TaskStatusUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    task = db.scalar(select(CompanyTask).where(CompanyTask.id == parse_task_id(task_id), CompanyTask.owner_id == user.id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задание не найдено")
    task.status = data.status
    workspace = get_workspace_row(db, user)
    workspace_data = {**empty_workspace(user), **(workspace.data or {})}
    append_activity(workspace_data, "task", f"Статус задания «{task.title}»: {data.status}", user.name)
    workspace.data = workspace_data
    db.commit()
    db.refresh(task)
    count = db.scalar(select(func.count(TaskApplication.id)).where(TaskApplication.task_id == task.id)) or 0
    notify_crm(user.id, "task.updated", {"taskId": f"crm-{task.id}"})
    return format_task(task, count)


@app.get("/api/company/applicants")
def company_applicants(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    key = f"crm:applicants:{user.id}"
    cached = cache_get(key)
    if cached is not None:
        return cached
    applications = db.scalars(
        select(TaskApplication)
        .join(CompanyTask)
        .where(CompanyTask.owner_id == user.id)
        .order_by(TaskApplication.created_at.desc())
    ).all()
    workspace = db.get(CompanyWorkspace, user.id)
    assignees = (workspace.data or {}).get("applicantAssignees", {}) if workspace else {}
    result = [format_application(application) for application in applications]
    for applicant in result:
        applicant["assigneeId"] = assignees.get(str(applicant["id"]))
    cache_set(key, result)
    return result


@app.patch("/api/company/applicants/{application_id}")
def update_company_applicant(
    application_id: int,
    data: ApplicationStatusUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_customer(user)
    application = db.scalar(
        select(TaskApplication)
        .join(CompanyTask)
        .where(TaskApplication.id == application_id, CompanyTask.owner_id == user.id)
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Отклик не найден")
    if data.status is not None:
        application.status = data.status
    workspace = get_workspace_row(db, user)
    workspace_data = {**empty_workspace(user), **(workspace.data or {})}
    if data.assignee_id is not None or "assignee_id" in data.model_fields_set:
        assignees = dict(workspace_data.get("applicantAssignees") or {})
        assignees[str(application.id)] = data.assignee_id
        workspace_data["applicantAssignees"] = assignees
        workspace.data = workspace_data
    if data.status is not None:
        status_labels = {"new": "Новые", "review": "Скрининг", "interview": "Интервью", "offer": "Оффер", "hired": "В работе", "rejected": "Отказ"}
        append_activity(workspace_data, "status", f"{application.performer.name} → «{status_labels[data.status]}»", user.name)
        workspace.data = workspace_data
    db.commit()
    db.refresh(application)
    notify_crm(user.id, "applicant.updated", {"applicantId": application.id})
    result = format_application(application)
    result["assigneeId"] = workspace_data.get("applicantAssignees", {}).get(str(application.id))
    return result


@app.get("/api/tasks")
def public_company_tasks(db: Annotated[Session, Depends(get_db)]):
    cached = cache_get("crm:public-tasks")
    if cached is not None:
        return cached
    tasks = db.scalars(select(CompanyTask).where(CompanyTask.status == "published").order_by(CompanyTask.created_at.desc())).all()
    result = [
        format_task(task, db.scalar(select(func.count(TaskApplication.id)).where(TaskApplication.task_id == task.id)) or 0)
        for task in tasks
    ]
    cache_set("crm:public-tasks", result, 20)
    return result


@app.get("/api/companies/{slug}")
def public_company(slug: str, db: Annotated[Session, Depends(get_db)]):
    normalized_slug = company_slug(slug)
    owners = db.scalars(
        select(User)
        .join(CompanyTask, CompanyTask.owner_id == User.id)
        .where(User.account_type == "customer", CompanyTask.status == "published")
        .distinct()
    ).all()
    owner = next((
        candidate for candidate in owners
        if normalized_slug in {
            company_slug(candidate.username),
            company_slug(candidate.name),
            company_slug(candidate.profile.company) if candidate.profile and candidate.profile.company else "",
        }
    ), None)
    if owner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Компания не найдена")

    workspace = db.get(CompanyWorkspace, owner.id)
    stored_company = ((workspace.data or {}).get("company") or {}) if workspace else {}
    profile = owner.profile
    company = {
        "id": owner.id,
        "slug": owner.username,
        "name": (profile.company if profile and profile.company else stored_company.get("name") or owner.name),
        "color": stored_company.get("color") or "#3b82f6",
        "industry": stored_company.get("industry") or "",
        "verified": bool(stored_company.get("verified", False)),
        "description": profile.bio if profile and profile.bio else stored_company.get("description") or "",
        "website": profile.website if profile and profile.website else stored_company.get("website") or "",
    }
    tasks = db.scalars(
        select(CompanyTask)
        .where(CompanyTask.owner_id == owner.id, CompanyTask.status == "published")
        .order_by(CompanyTask.created_at.desc())
    ).all()
    company["tasks"] = [
        format_task(
            task,
            db.scalar(select(func.count(TaskApplication.id)).where(TaskApplication.task_id == task.id)) or 0,
        )
        for task in tasks
    ]
    return company


@app.get("/api/tasks/{task_id}")
def public_company_task(task_id: str, db: Annotated[Session, Depends(get_db)]):
    task = db.scalar(select(CompanyTask).where(CompanyTask.id == parse_task_id(task_id), CompanyTask.status == "published"))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задание не найдено")
    count = db.scalar(select(func.count(TaskApplication.id)).where(TaskApplication.task_id == task.id)) or 0
    return format_task(task, count)


@app.post("/api/tasks/{task_id}/apply", status_code=status.HTTP_201_CREATED)
def apply_to_company_task(
    task_id: str,
    data: ApplicationCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_performer(user)
    task = db.scalar(select(CompanyTask).where(CompanyTask.id == parse_task_id(task_id), CompanyTask.status == "published"))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задание не найдено или уже закрыто")
    existing = db.scalar(select(TaskApplication.id).where(
        TaskApplication.task_id == task.id,
        TaskApplication.performer_id == user.id,
    ))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Вы уже откликнулись на это задание")
    application = TaskApplication(task_id=task.id, performer_id=user.id, cover=data.cover.strip())
    db.add(application)
    try:
        db.flush()
        owner_workspace = get_workspace_row(db, task.owner)
        workspace_data = {**empty_workspace(task.owner), **(owner_workspace.data or {})}
        thread_id = str(application.id)
        first_message = {
            "id": secrets.randbelow(2**31),
            "senderType": "performer",
            "senderName": user.name,
            "text": data.cover.strip() or "Отклик на задание",
            "time": datetime.now().astimezone().strftime("%H:%M"),
            "read": False,
        }
        threads = dict(workspace_data.get("threads") or {})
        threads[thread_id] = [*threads.get(thread_id, []), first_message]
        workspace_data["threads"] = threads
        summaries = list(workspace_data.get("messages") or [])
        summaries.insert(0, {
            "id": application.id,
            "applicantId": application.id,
            "userName": user.name,
            "username": user.username,
            "taskTitle": task.title,
            "lastMessage": first_message["text"],
            "time": first_message["time"],
            "unread": 1,
            "pinned": False,
        })
        workspace_data["messages"] = summaries
        append_activity(workspace_data, "applicant", f"{user.name} откликнулся на «{task.title}»", "Система")
        owner_workspace.data = workspace_data
        db.commit()
        db.refresh(application)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Вы уже откликнулись на это задание") from None
    notify_crm(task.owner_id, "applicant.created", {"applicantId": application.id})
    return {"id": application.id, "status": application.status}


@app.get("/api/chat/conversations")
def chat_conversations(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if user.account_type == "customer":
        data = company_workspace(user, db)
        return data.get("messages", [])
    applications = db.scalars(
        select(TaskApplication)
        .where(TaskApplication.performer_id == user.id)
        .order_by(TaskApplication.created_at.desc())
    ).all()
    result = []
    for application in applications:
        owner = application.task.owner
        workspace = db.get(CompanyWorkspace, owner.id)
        data = {**empty_workspace(owner), **(workspace.data or {})} if workspace else empty_workspace(owner)
        thread = data.get("threads", {}).get(str(application.id), [])
        last = thread[-1] if thread else None
        result.append({
            "id": application.id,
            "applicantId": application.id,
            "name": owner.profile.company if owner.profile and owner.profile.company else owner.name,
            "userName": owner.profile.company if owner.profile and owner.profile.company else owner.name,
            "username": owner.username,
            "taskTitle": application.task.title,
            "lastMessage": last.get("text", "Отклик отправлен") if last else "Отклик отправлен",
            "time": last.get("time", "") if last else "",
            "unread": sum(1 for message in thread if message.get("senderType") == "customer" and not message.get("read")),
            "pinned": False,
            "type": "personal",
        })
    return result


def get_chat_party(application_id: int, user: User, db: Session) -> tuple[TaskApplication, str, User]:
    application = db.get(TaskApplication, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Диалог не найден")
    owner = application.task.owner
    if user.id == owner.id and user.account_type == "customer":
        return application, "customer", owner
    if user.id == application.performer_id and user.account_type == "performer":
        return application, "performer", owner
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Диалог не найден")


@app.get("/api/chat/{application_id}/messages")
def chat_messages(
    application_id: int,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    application, account_type, owner = get_chat_party(application_id, user, db)
    workspace = get_workspace_row(db, owner)
    data = {**empty_workspace(owner), **(workspace.data or {})}
    threads = dict(data.get("threads") or {})
    thread_id = str(application.id)
    thread = list(threads.get(thread_id, []))
    changed = False
    for message in thread:
        if message.get("senderType") != account_type and not message.get("read"):
            message["read"] = True
            changed = True
    threads[thread_id] = thread
    data["threads"] = threads
    if account_type == "customer":
        data["messages"] = [
            {**summary, "unread": 0} if summary.get("id") == application.id else summary
            for summary in data.get("messages", [])
        ]
        changed = True
    if changed:
        workspace.data = data
        db.commit()
        notify_crm(owner.id, "message.read", {"applicationId": application.id})
    return serialize_chat_messages(thread, account_type)


@app.post("/api/chat/{application_id}/messages", status_code=status.HTTP_201_CREATED)
def create_chat_message(
    application_id: int,
    message_data: ChatMessageCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    application, account_type, owner = get_chat_party(application_id, user, db)
    workspace = get_workspace_row(db, owner)
    data = {**empty_workspace(owner), **(workspace.data or {})}
    threads = dict(data.get("threads") or {})
    thread_id = str(application.id)
    message = {
        "id": max((int(item.get("id", 0)) for item in threads.get(thread_id, [])), default=0) + 1,
        "senderType": account_type,
        "senderName": user.name,
        "text": message_data.text.strip(),
        "time": datetime.now().astimezone().strftime("%H:%M"),
        "read": False,
    }
    thread = [*threads.get(thread_id, []), message]
    threads[thread_id] = thread
    data["threads"] = threads
    summaries = list(data.get("messages") or [])
    found = False
    for index, summary in enumerate(summaries):
        if summary.get("id") == application.id:
            unread = int(summary.get("unread", 0)) + (1 if account_type == "performer" else 0)
            summaries[index] = {**summary, "lastMessage": message["text"], "time": message["time"], "unread": unread}
            found = True
            break
    if not found:
        summaries.insert(0, {
            "id": application.id,
            "applicantId": application.id,
            "userName": application.performer.name,
            "username": application.performer.username,
            "taskTitle": application.task.title,
            "lastMessage": message["text"],
            "time": message["time"],
            "unread": 1 if account_type == "performer" else 0,
            "pinned": False,
        })
    data["messages"] = summaries
    activity_text = (
        f"Новое сообщение от {user.name}"
        if account_type == "performer"
        else f"Отправлено сообщение кандидату {application.performer.name}"
    )
    append_activity(data, "message", activity_text, user.name)
    workspace.data = data
    db.commit()
    notify_crm(owner.id, "message.created", {"applicationId": application.id})
    return serialize_chat_messages([message], account_type)[0]


@app.get("/api/profile", response_model=ProfileResponse)
def get_profile(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    profile = db.get(UserProfile, user.id)
    return make_profile_response(user, profile, db)


@app.get("/api/users/{username}")
def public_user_profile(username: str, db: Annotated[Session, Depends(get_db)]):
    user = db.scalar(select(User).where(User.username == username.lower()))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    profile = db.get(UserProfile, user.id)
    result = make_profile_response(user, profile, db).model_dump(by_alias=True)
    result.pop("email", None)
    return result


@app.patch("/api/profile", response_model=ProfileResponse)
def update_profile(
    data: ProfileUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    changes = data.model_dump(exclude_unset=True)
    profile = db.get(UserProfile, user.id)
    if profile is None:
        profile = UserProfile(user_id=user.id)
        db.add(profile)

    if "username" in changes:
        username = changes.pop("username")
        if not username:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Username не может быть пустым")
        duplicate = db.scalar(select(User.id).where(User.username == username, User.id != user.id))
        if duplicate:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Это имя пользователя уже занято")
        user.username = username

    for field in ("name", "role", "direction"):
        if field in changes:
            value = changes.pop(field)
            if value is not None:
                setattr(user, field, value)

    for field, value in changes.items():
        if value is not None:
            setattr(profile, field, value)

    try:
        db.commit()
        db.refresh(user)
        db.refresh(profile)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Имя пользователя уже занято") from None

    return make_profile_response(user, profile, db)


@app.post("/api/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
):
    if credentials is not None:
        auth_session = db.scalar(
            select(UserSession).where(UserSession.token_hash == token_digest(credentials.credentials))
        )
        if auth_session is not None:
            db.delete(auth_session)
            db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
