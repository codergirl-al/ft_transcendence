#!/bin/sh

export VAULT_TOKEN=$(cat /elk-token.txt)

# Fetch secrets from Vault
export KIBANA_PASSWORD=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/elk/KIBANA_PASSWORD | jq -r '.data.data.KIBANA_PASSWORD')
export ELASTIC_PASSWORD=$(curl -s -H "X-Vault-Token: $VAULT_TOKEN" http://vault:8200/v1/secret/data/elk/ELASTIC_PASSWORD | jq -r '.data.data.ELASTIC_PASSWORD')
