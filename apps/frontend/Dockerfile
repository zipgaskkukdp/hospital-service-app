FROM node:22-alpine

WORKDIR /repo

COPY package.json tsconfig.base.json ./
COPY apps/frontend ./apps/frontend

RUN npm install --workspace @aicloud/frontend --include-workspace-root

CMD ["npm", "run", "dev", "-w", "@aicloud/frontend"]
