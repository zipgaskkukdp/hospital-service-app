# Backend/Frontend Runbook

## Local Ports

| Component | Port |
| --- | ---: |
| auth-user-service | 8081 |
| questionnaire-service | 8082 |
| board-service | 8083 |
| ai-triage-service | 8084 |
| hospital-recommendation-service | 8085 |
| onprem-sensitive-api | 9000 |
| frontend | 5173 |
| aws-rds-local PostgreSQL | 5432 |
| onprem-postgres | 5433 |

## Database Split

AWS RDS tables:

- `users`: auth account data, hashed password, nickname, on-prem profile reference.
- `refresh_tokens`: refresh token hashes and revocation metadata.
- `consultations`: non-identifying consultation metadata and summarized `content_data`.
- `ai_results`: AI processing status, summary, risk level, recommendation, model metadata.
- `consultation_assets`: report JSON/image/PDF object references.
- `board_posts`: board title/content and soft-delete metadata.
- `board_images`: board image S3 keys and optional URLs.
- `hospital_recommendation_logs`: minimized request/result logs and map provider.

On-prem PostgreSQL tables:

- `sensitive_user_profiles`: encrypted name, phone, optional address.
- `sensitive_children`: encrypted child name, optional birth date, optional gender, encrypted details.
- `sensitive_consultation_payloads`: encrypted raw consultation payload.

## API Summary

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/password`

Questionnaire:

- `POST /api/consultations`
- `GET /api/consultations`
- `GET /api/consultations/:id`
- `POST /api/consultations/:id/complete`
- `GET /api/consultations/:id/result`

Board:

- `POST /api/board/posts`
- `GET /api/board/posts`
- `GET /api/board/posts/:id`
- `PATCH /api/board/posts/:id`
- `DELETE /api/board/posts/:id`
- `POST /api/board/posts/:id/images`

AI triage:

- `GET /api/ai/results/:consultationId`
- `POST /api/ai/mock-process`

Hospital recommendation:

- `GET /api/hospitals/recommend?lat=&lng=`
- `POST /api/hospitals/recommend`

On-prem sensitive API:

- `POST /internal/sensitive/user-profile`
- `POST /internal/sensitive/child`
- `POST /internal/sensitive/consultation`
- `GET /health`
- `GET /db-health`

## Frontend Routes

- `/login`
- `/signup`
- `/mypage`
- `/consultations/new`
- `/consultations/:id`
- `/consultations/:id/result`
- `/board`
- `/board/:id`
- `/hospitals/recommend`

## Environment Rules

- `.env` files are intentionally ignored.
- `.env.example` files contain only blank values or placeholders.
- `JWT_SECRET`, `RDS_PASSWORD`, `MAP_API_KEY`, and `FIELD_ENCRYPTION_KEY` must be injected by local developer setup, CI secret store, or runtime secret management.
- `S3_POST_IMAGE_PREFIX` is the board image prefix. The legacy board-image prefix name is no longer used.
- `VITE_API_BASE_URL` is optional for local development because Vite proxy handles API routing.

## Verification

Recommended checks:

```bash
npm install
npm run build
python -m compileall apps/onprem-sensitive-api/app
docker compose config
docker compose up --build
```

Health checks after compose is up:

```bash
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health
curl http://localhost:8084/health
curl http://localhost:8085/health
curl http://localhost:9000/health
```

## Manual Follow-Up

- Replace placeholders with secrets only through local `.env`, CI secrets, or deployment secret managers.
- Decide whether production migrations will use Prisma migrations, SQL migrations, or a separate migration job.
- Add real S3 upload/presigned URL flow when board images and report artifacts move beyond metadata MVP.
- Add real Bedrock and Kakao/Naver integrations after mock mode is validated.
