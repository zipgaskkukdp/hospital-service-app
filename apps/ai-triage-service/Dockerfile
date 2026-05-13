FROM node:22-alpine

WORKDIR /repo

COPY package.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/ai-triage-service ./apps/ai-triage-service

RUN npm install --workspace @aicloud/ai-triage-service --include-workspace-root
RUN npm run build -w @aicloud/shared-types \
  && npm run build -w @aicloud/shared-config \
  && npm run build -w @aicloud/shared-utils \
  && npm run build -w @aicloud/ai-triage-service

CMD ["npm", "run", "start", "-w", "@aicloud/ai-triage-service"]
