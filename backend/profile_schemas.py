from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .auth_schemas import UserResponse


class ProfileStats(BaseModel):
    tasksDone: int = 0
    tasksActive: int = 0
    tasksReview: int = 0
    balanceAmount: int = 0
    balanceLabel: str = "0 ₽"
    rating: float | None = None
    reviews: int = 0
    followers: int = 0
    following: int = 0


class ProfileResponse(UserResponse):
    model_config = ConfigDict(populate_by_name=True)

    bio: str = ""
    skills: list[str] = Field(default_factory=list)
    location: str = ""
    website: str = ""
    company: str = ""
    stats: ProfileStats = Field(default_factory=ProfileStats)
    tasks: list[dict] = Field(default_factory=list)
    reviews: list[dict] = Field(default_factory=list)
    activity: list[dict] = Field(default_factory=list)
    teams: list[dict] = Field(default_factory=list)


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    username: str | None = Field(default=None, min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_-]+$")
    role: str | None = Field(default=None, min_length=1, max_length=64)
    direction: str | None = Field(default=None, max_length=64)
    bio: str | None = Field(default=None, max_length=2000)
    skills: list[str] | None = Field(default=None, max_length=40)
    location: str | None = Field(default=None, max_length=160)
    website: str | None = Field(default=None, max_length=255)
    company: str | None = Field(default=None, max_length=160)

    @field_validator("username", mode="before")
    @classmethod
    def normalize_username(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip().lower()
        return value or None

    @field_validator("name", "role", "direction", "bio", "location", "website", "company")
    @classmethod
    def trim_text(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None

    @field_validator("skills")
    @classmethod
    def normalize_skills(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        return list(dict.fromkeys(skill.strip() for skill in value if skill.strip()))
