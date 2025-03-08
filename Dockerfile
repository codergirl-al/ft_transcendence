
FROM node:20-alpine
RUN npm install -g npm@latest

WORKDIR /app
COPY src /app/src
# COPY node_modules /app/node_modules

COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./
RUN npm install

# RUN npx tsc

CMD ["npm", "run", "dev"]
