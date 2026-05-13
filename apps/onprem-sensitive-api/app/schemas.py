from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class UserProfileCreate(BaseModel):
    cloud_user_id: UUID
    name: str
    phone: str
    address: str | None = None


class ChildCreate(BaseModel):
    cloud_user_id: UUID
    name: str
    birth_date: str | None = None
    gender: str | None = None
    detail_json: dict[str, Any] = Field(default_factory=dict)


class ConsultationPayloadCreate(BaseModel):
    consultation_id: UUID
    cloud_user_id: UUID
    raw_payload: dict[str, Any]


class CreatedResponse(BaseModel):
    id: UUID
