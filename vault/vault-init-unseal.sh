#!/bin/bash

# Initialize Vault with 1 key share and 1 threshold
echo "Initializing Vault..."
INIT_RESPONSE=$(vault operator init -key-shares=1 -key-threshold=1 -format=json)

# Extract the unseal key and root token from the response
UNSEAL_KEY=$(echo "$INIT_RESPONSE" | jq -r '.unseal_keys_b64[0]')
ROOT_TOKEN=$(echo "$INIT_RESPONSE" | jq -r '.root_token')

# Check if unseal key and root token were extracted successfully
if [[ -z "$UNSEAL_KEY" || -z "$ROOT_TOKEN" ]]; then
  echo "Failed to initialize Vault or extract keys."
  exit 1
fi

echo "Vault initialized successfully."
echo "Unseal Key: $UNSEAL_KEY"
echo "Root Token: $ROOT_TOKEN"

# Unseal Vault using the unseal key
echo "Unsealing Vault..."
vault operator unseal "$UNSEAL_KEY"

# Check if Vault is unsealed
VAULT_STATUS=$(vault status -format=json | jq -r '.sealed')
if [[ "$VAULT_STATUS" == "false" ]]; then
  echo "Vault unsealed successfully."
else
  echo "Failed to unseal Vault."
  exit 1
fi

# Authenticate using the root token
echo "Authenticating with the root token..."
vault login "$ROOT_TOKEN"

# Verify authentication
if vault token lookup > /dev/null 2>&1; then
  echo "Authentication successful. Vault is ready to use."
else
  echo "Failed to authenticate with the root token."
  exit 1
fi

# Output the unseal key and root token for reference
echo "USEAL_KEY: $UNSEAL_KEY" >> .env
echo "ROOT_TOKEN: $ROOT_TOKEN" >> .env