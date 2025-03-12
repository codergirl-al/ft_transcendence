
FROM node:20-alpine
RUN npm install -g npm@latest

WORKDIR /app
COPY src /app/src
RUN mkdir -p src

COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.cjs ./
COPY postcss.config.cjs ./

RUN npm install

RUN npx tsc

CMD ["npm", "run", "dev"]