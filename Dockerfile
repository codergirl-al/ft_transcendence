# ----------------------------------------PHP--------------------------

# FROM ubuntu:latest

# RUN apt update -y && apt install -y \
# 	php php-cgi sqlite3 libsqlite3-dev pdo_sqlite \
# 	&& rm -rf /var/lib/apt/lists/*

# WORKDIR /data

# COPY ./data .
# VOLUME /data

# EXPOSE 3000

# CMD ["php", "-S", "0.0.0.0:3000", "-t", "/data"]

# BUILD:		docker build -t transcend .
# RUN:			docker run -v "$(pwd)/data:/data" -it transcend

# ----------------------------------------FASTIFY----------------------

FROM node:20-alpine

WORKDIR /app
RUN mkdir src
COPY package*.json ./
RUN npm install

EXPOSE 3000
ENV ADDRESS=0.0.0.0 PORT=3000

CMD ["npm", "run", "dev"]

# BUILD:		docker build -t fast_af .
# RUN:			docker run --rm -v "$(pwd)/src:/app/src" -p 3000:3000 fast_af