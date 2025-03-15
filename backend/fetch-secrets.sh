#!/bin/sh

echo Vault Token: $VAULT_TOKEN

# Fetch secrets from Vault
export ADDRESS=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/ADDRESS | jq -r '.data.data.ADDRESS')
export BASE_URL=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/BASE_URL | jq -r '.data.data.BASE_URL')
export PORT=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/PORT | jq -r '.data.data.PORT')
export NODE_ENV=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/NODE_ENV | jq -r '.data.data.NODE_ENV')
export DB_FILE=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/DB_FILE | jq -r '.data.data.DB_FILE')
export GOOGLE_CLIENT_ID=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/GOOGLE_CLIENT_ID | jq -r '.data.data.GOOGLE_CLIENT_ID')
export GOOGLE_CLIENT_SECRET=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/GOOGLE_CLIENT_SECRET | jq -r '.data.data.GOOGLE_CLIENT_SECRET')

