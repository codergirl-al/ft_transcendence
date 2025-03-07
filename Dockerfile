
FROM node:20-alpine
RUN npm install -g npm@latest

WORKDIR /app
COPY src /app/src
RUN mkdir -p src

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Build TailwindCSS
RUN npx tailwindcss -i ./src/public/tailwind.css -o ./src/public/output.css --minify
RUN npx tsc

CMD ["npm", "run", "dev"]

