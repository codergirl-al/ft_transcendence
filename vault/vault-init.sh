#!/bin/sh
set -e

# Wait for the Vault server to start
echo "Waiting for Vault server to start..."
while ! curl -s http://vault:8200/v1/sys/health > /dev/null; do
  sleep 1
done

# Check if Vault is already initialized
echo "Checking if Vault is already initialized..."
VAULT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://vault:8200/v1/sys/health)

if [ "$VAULT_STATUS" = "501" ]; then
  # Vault is not initialized, so initialize it
  echo "Vault is not initialized. Initializing Vault..."
  INIT_RESPONSE=$(curl -s -X PUT -H "Accept: application/json" -d '{"secret_shares": 1, "secret_threshold": 1}' http://vault:8200/v1/sys/init)
  UNSEAL_KEY=$(echo "$INIT_RESPONSE" | jq -r '.keys[0]')
  ROOT_TOKEN=$(echo "$INIT_RESPONSE" | jq -r '.root_token')

  # Unseal Vault
  echo "Unsealing Vault..."
  curl -s -X PUT -d "{\"key\": \"$UNSEAL_KEY\"}" http://vault:8200/v1/sys/unseal

  echo "Vault initialized and unsealed."
  echo "UNSEAL_KEY: $UNSEAL_KEY"
  echo "ROOT_TOKEN: $ROOT_TOKEN"
  echo "$ROOT_TOKEN" > /home/curl_user/root-token.txt
  echo "$UNSEAL_KEY" > /home/curl_user/unseal-key.txt

  # Enable the KV secrets engine at the 'secret/' path
  echo "Enabling KV secrets engine at 'secret/' path..."
  curl -s -X POST -H "X-Vault-Token: $ROOT_TOKEN" -d '{"type": "kv-v2"}' http://vault:8200/v1/sys/mounts/secret

  # Add KV secrets from .env file (only during initialization)
  echo "Adding KV secrets from .env file..."
  if [ -f "/home/curl_user/.env" ]; then
    # Read the .env file line by line
    while IFS= read -r line; do
      # Skip empty lines and comments
      if [ -z "$line" ] || [ "${line#\#}" != "$line" ]; then
        continue
      fi

      # Extract key and value
      key=$(echo "$line" | cut -d '=' -f 1)
      value=$(echo "$line" | cut -d '=' -f 2-)

      # Write the secret to Vault
      echo "Adding secret: $key"
      curl -s -X POST -H "X-Vault-Token: $ROOT_TOKEN" -d "{\"data\": {\"$key\": \"$value\"}}" http://vault:8200/v1/secret/data/$key
    done < "/home/curl_user/.env"
    echo "All secrets from .env file have been added to Vault."
  else
    echo "No .env file found. Skipping KV secrets addition."
  fi
else
  # Vault is already initialized
  echo "Vault is already initialized. Skipping initialization and KV secrets addition."
  UNSEAL_KEY=$(cat /home/curl_user/unseal-key.txt)
  echo "Unsealing Vault..."
  curl -s -X PUT -d "{\"key\": \"$UNSEAL_KEY\"}" http://vault:8200/v1/sys/unseal

fi