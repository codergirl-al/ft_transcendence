#!/bin/sh

export VAULT_TOKEN=$(cat /backend-token.txt)

# Fetch secrets from Vault
export FASTIFY_ADDRESS=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/FASTIFY_ADDRESS | jq -r '.data.data.FASTIFY_ADDRESS')
export CALLBACK_URL=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/CALLBACK_URL | jq -r '.data.data.CALLBACK_URL')
export FASTIFY_PORT=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/FASTIFY_PORT | jq -r '.data.data.FASTIFY_PORT')
export FASTIFY_NODE_ENV=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/FASTIFY_NODE_ENV | jq -r '.data.data.FASTIFY_NODE_ENV')
export FASTIFY_DB_FILE=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/FASTIFY_DB_FILE | jq -r '.data.data.FASTIFY_DB_FILE')
export GOOGLE_CLIENT_ID=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/GOOGLE_CLIENT_ID | jq -r '.data.data.GOOGLE_CLIENT_ID')
export GOOGLE_CLIENT_SECRET=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/backend/GOOGLE_CLIENT_SECRET | jq -r '.data.data.GOOGLE_CLIENT_SECRET')

