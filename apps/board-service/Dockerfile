FROM node:22-alpine

WORKDIR /repo

COPY package.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/board-service ./apps/board-service

RUN npm install --workspace @aicloud/board-service --include-workspace-root
RUN npm run build -w @aicloud/shared-types \
  && npm run build -w @aicloud/shared-config \
  && npm run build -w @aicloud/shared-utils \
  && npm run build -w @aicloud/board-service

CMD ["npm", "run", "start", "-w", "@aicloud/board-service"]
