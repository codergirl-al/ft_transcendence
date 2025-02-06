FROM ubuntu:latest

RUN apt update -y && apt install -y \
	php php-cgi sqlite3 libsqlite3-dev pdo_sqlite \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /data

COPY ./data .
VOLUME /data

EXPOSE 3000

CMD ["php", "-S", "0.0.0.0:3000", "-t", "/data"]

# docker build -t transcend .
# docker run -v "$(pwd)/data:/data" -it transcend