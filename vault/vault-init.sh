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
else
  # Vault is already initialized
  echo "Vault is already initialized. Skipping initialization."
fi