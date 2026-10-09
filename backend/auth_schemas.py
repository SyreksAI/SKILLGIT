from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    username: str | None = Field(default=None, min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_-]+$")
    account_type: Literal["performer", "customer"] = Field(default="performer", alias="accountType")
    direction: str | None = Field(default=None, max_length=64)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Укажите имя")
        return value

    @field_validator("username", mode="before")
    @classmethod
    def clean_username(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip().lower()
        return value or None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    account_type: Literal["performer", "customer"] = Field(default="performer", alias="accountType")


class UserResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    email: EmailStr
    name: str
    username: str
    role: str
    account_type: Literal["performer", "customer"] = Field(alias="accountType")
    direction: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: UserResponse
