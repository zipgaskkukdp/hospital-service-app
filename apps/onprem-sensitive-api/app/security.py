import base64
import hashlib
import json
import os
from typing import Any

from cryptography.fernet import Fernet
from fastapi import HTTPException


def get_fernet() -> Fernet:
    raw_key = os.getenv("FIELD_ENCRYPTION_KEY", "")
    if not raw_key:
        raise HTTPException(status_code=500, detail="FIELD_ENCRYPTION_KEY is not configured")
    derived_key = base64.urlsafe_b64encode(hashlib.sha256(raw_key.encode("utf-8")).digest())
    return Fernet(derived_key)


def encrypt_text(value: str | None) -> str | None:
    if value is None:
        return None
    return get_fernet().encrypt(value.encode("utf-8")).decode("utf-8")


def encrypt_json(value: dict[str, Any]) -> str:
    payload = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    encrypted = encrypt_text(payload)
    if encrypted is None:
        raise HTTPException(status_code=500, detail="Failed to encrypt payload")
    return encrypted
