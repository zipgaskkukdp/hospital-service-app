# Aicloud Monorepo

6개 백엔드 서비스와 React frontend를 함께 개발하는 monorepo입니다. 이번 단계는 애플리케이션 백엔드/프론트엔드 뼈대이며, `infra/` Terraform 코드는 변경하지 않습니다.

## Structure

```text
aicloud/
├── apps/
│   ├── auth-user-service/
│   ├── questionnaire-service/
│   ├── board-service/
│   ├── ai-triage-service/
│   ├── hospital-recommendation-service/
│   ├── onprem-sensitive-api/
│   └── frontend/
├── packages/
│   ├── shared-types/
│   ├── shared-config/
│   └── shared-utils/
├── manifests/
├── docs/
└── docker-compose.yml
```

## Services

| Service | Stack | Port | Role |
| --- | --- | ---: | --- |
| auth-user-service | Express, TypeScript, Prisma | 8081 | Signup, login, JWT, user profile |
| questionnaire-service | Express, TypeScript, Prisma | 8082 | Consultation metadata, SQS triage event |
| board-service | Express, TypeScript, Prisma | 8083 | Board CRUD and image metadata |
| ai-triage-service | Express, TypeScript, Prisma | 8084 | Mock/Bedrock triage result storage |
| hospital-recommendation-service | Express, TypeScript, Prisma | 8085 | Mock hospital recommendations |
| onprem-sensitive-api | FastAPI, SQLAlchemy | 9000 | Encrypted sensitive payload storage |
| frontend | React, Vite, TypeScript, Tailwind CSS | 5173 | Web UI |

## Security Boundary

- Do not create or commit `.env`.
- Keep real secret values out of code, docs, and examples.
- Use only blank values or `<CHANGE_ME>` in examples.
- Frontend `VITE_*` values are browser-visible and must not contain secrets.
- AWS RDS stores general application data only.
- On-prem PostgreSQL stores encrypted sensitive fields only.
- `content_data` must not contain real names, phone numbers, addresses, child names, or full raw consultation text.

## Local Development

Install dependencies:

```bash
npm install
```

Build everything:

```bash
npm run build
```

Run with Docker Compose:

```bash
docker compose up --build
```

Frontend runs at `http://localhost:5173`. Vite proxy routes API calls to the service ports.

## Environment Examples

Each app has its own `.env.example`. Copy values into a local, uncommitted `.env` only when needed. Real values for `JWT_SECRET`, database passwords, map API keys, field encryption keys, and AWS credentials must stay outside the repository.

See [docs/backend-frontend-runbook.md](docs/backend-frontend-runbook.md) for API, DB, and verification details.
