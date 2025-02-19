# ----------------------------------------FASTIFY----------------------

FROM node:20-alpine
RUN npm install -g npm@latest

WORKDIR /app
RUN mkdir src
COPY package*.json ./
RUN npm install

EXPOSE 3000
ENV ADDRESS=0.0.0.0 PORT=3000

CMD ["npm", "run", "dev"]

# BUILD:		docker build -t fast_af .
# RUN:			docker run --rm -v "$(pwd)/src:/app/src" -p 3000:3000 fast_af

# ----------------------------------------PHP--------------------------

# FROM ubuntu:latest

# # Install required packages
# RUN apt update -y && apt install -y \
# 	php php-cli php-sqlite3 sqlite3 \
# 	&& rm -rf /var/lib/apt/lists/*

# # Set working directory
# WORKDIR /var/www/html

# # Copy project files
# COPY ./php-page .

# # Expose port
# EXPOSE 3000

# # Start PHP built-in server
# CMD ["php", "-S", "0.0.0.0:3000", "-t", "public"]

# BUILD:		docker build -t transcend .
# RUN:			docker run -p 3000:3000 -v "$(pwd)/php-page:/var/www/html" -it transcend
