FROM node:22-alpine

WORKDIR /repo

COPY package.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/auth-user-service ./apps/auth-user-service

RUN npm install --workspace @aicloud/auth-user-service --include-workspace-root
RUN npm run build -w @aicloud/shared-types \
  && npm run build -w @aicloud/shared-config \
  && npm run build -w @aicloud/shared-utils \
  && npm run build -w @aicloud/auth-user-service

CMD ["npm", "run", "start", "-w", "@aicloud/auth-user-service"]
