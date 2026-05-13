import os

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from . import models
from .database import check_db, get_session, init_db
from .schemas import ChildCreate, ConsultationPayloadCreate, CreatedResponse, UserProfileCreate
from .security import encrypt_json, encrypt_text


app = FastAPI(title="onprem-sensitive-api", version="0.1.0")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get(os.getenv("HEALTH_CHECK_PATH", "/health"))
def health() -> dict[str, str]:
    return {"status": "ok", "service": "onprem-sensitive-api"}


@app.get(os.getenv("DB_HEALTH_CHECK_PATH", "/db-health"))
def db_health() -> dict[str, str]:
    check_db()
    return {"status": "ok"}


@app.post("/internal/sensitive/user-profile", response_model=CreatedResponse, status_code=201)
def create_user_profile(payload: UserProfileCreate, session: Session = Depends(get_session)) -> CreatedResponse:
    profile = models.SensitiveUserProfile(
        cloud_user_id=payload.cloud_user_id,
        name_enc=encrypt_text(payload.name),
        phone_enc=encrypt_text(payload.phone),
        address_enc=encrypt_text(payload.address),
    )
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return CreatedResponse(id=profile.id)


@app.post("/internal/sensitive/child", response_model=CreatedResponse, status_code=201)
def create_child(payload: ChildCreate, session: Session = Depends(get_session)) -> CreatedResponse:
    child = models.SensitiveChild(
        cloud_user_id=payload.cloud_user_id,
        name_enc=encrypt_text(payload.name),
        birth_date_enc=encrypt_text(payload.birth_date),
        gender_enc=encrypt_text(payload.gender),
        detail_json_enc=encrypt_json(payload.detail_json),
    )
    session.add(child)
    session.commit()
    session.refresh(child)
    return CreatedResponse(id=child.id)


@app.post("/internal/sensitive/consultation", response_model=CreatedResponse, status_code=201)
def create_consultation_payload(
    payload: ConsultationPayloadCreate,
    session: Session = Depends(get_session),
) -> CreatedResponse:
    consultation_payload = models.SensitiveConsultationPayload(
        consultation_id=payload.consultation_id,
        cloud_user_id=payload.cloud_user_id,
        raw_payload_enc=encrypt_json(payload.raw_payload),
    )
    session.add(consultation_payload)
    session.commit()
    session.refresh(consultation_payload)
    return CreatedResponse(id=consultation_payload.id)
