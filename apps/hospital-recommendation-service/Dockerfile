FROM node:22-alpine

WORKDIR /repo

COPY package.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/hospital-recommendation-service ./apps/hospital-recommendation-service

RUN npm install --workspace @aicloud/hospital-recommendation-service --include-workspace-root
RUN npm run build -w @aicloud/shared-types \
  && npm run build -w @aicloud/shared-config \
  && npm run build -w @aicloud/shared-utils \
  && npm run build -w @aicloud/hospital-recommendation-service

CMD ["npm", "run", "start", "-w", "@aicloud/hospital-recommendation-service"]
