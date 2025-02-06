FROM ubuntu:latest

# Install required packages
RUN apt update -y && apt install -y \
	php php-cli php-sqlite3 sqlite3 \
	&& rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY ./php-page .

# Expose port
EXPOSE 3000

# Start PHP built-in server
CMD ["php", "-S", "0.0.0.0:3000", "-t", "public"]

# docker build -t transcend .
# docker run -p 3000:3000 -v "$(pwd)/php-page:/var/www/html" -it transcend