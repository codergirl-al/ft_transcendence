FROM node:20-alpine

# Install curl and jq
RUN apk add --no-cache curl jq

# Copy the script
COPY fetch-secrets.sh /fetch-secrets.sh
RUN chmod +x /fetch-secrets.sh

# Set the working directory
WORKDIR /app

# Copy application files
COPY . .

# Set the entrypoint
CMD ["sh", "-c", "source /fetch-secrets.sh && npm install -g npm@11.2.0 && npm install && npm run dev"]