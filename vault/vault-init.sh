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
  echo "$ROOT_TOKEN" > /home/curl_user/tokens/root-token.txt
  echo "$UNSEAL_KEY" > /home/curl_user/tokens/unseal-key.txt

  # Enable the KV secrets engine at the 'secret/' path
  echo "Enabling KV secrets engine at 'secret/' path..."
  curl -s -X POST -H "X-Vault-Token: $ROOT_TOKEN" -d '{"type": "kv-v2"}' http://vault:8200/v1/sys/mounts/secret

  # Process all .env.* files
  for env_file in /home/curl_user/.env.*; do
    if [ -f "$env_file" ]; then
      # Extract the path from the filename (e.g., .env.backend -> backend)
      path=$(basename "$env_file" | cut -d '.' -f 3)

      echo "Adding KV secrets from $env_file to path 'secret/data/$path'..."
      while IFS= read -r line; do
        # Skip empty lines and comments
        if [ -z "$line" ] || [ "${line#\#}" != "$line" ]; then
          continue
        fi

        # Extract key and value
        key=$(echo "$line" | cut -d '=' -f 1)
        value=$(echo "$line" | cut -d '=' -f 2-)

        # Write the secret to Vault
        echo "Adding secret to $path: $key"
        curl -s -X POST -H "X-Vault-Token: $ROOT_TOKEN" -d "{\"data\": {\"$key\": \"$value\"}}" http://vault:8200/v1/secret/data/$path/$key
      done < "$env_file"
      echo "All secrets from $env_file have been added to Vault."
    else
      echo "No .env.* files found. Skipping KV secrets addition."
    fi
  done

  # Create policies for each path
  echo "Creating policies for each path..."
  for env_file in /home/curl_user/.env.*; do
    if [ -f "$env_file" ]; then
      path=$(basename "$env_file" | cut -d '.' -f 3)
      policy_name="${path}-policy"

      echo "Creating policy for path 'secret/data/$path'..."
      curl -s -X POST -H "X-Vault-Token: $ROOT_TOKEN" -d "{\"policy\": \"path \\\"secret/data/$path/*\\\" { capabilities = [\\\"read\\\"] }\"}" http://vault:8200/v1/sys/policies/acl/$policy_name

      # Create a token for the path
      echo "Creating token for path 'secret/data/$path'..."
      token=$(curl -s -X POST -H "X-Vault-Token: $ROOT_TOKEN" -d "{\"policies\": [\"$policy_name\"]}" http://vault:8200/v1/auth/token/create | jq -r '.auth.client_token')
      echo "Token for $path: $token"
      echo "$token" > "/home/curl_user/token/${path}-token.txt"
    fi
  done

else
  # Vault is already initialized
  echo "Vault is already initialized. Skipping initialization and KV secrets addition."
  UNSEAL_KEY=$(cat /home/curl_user/unseal-key.txt)
  echo "Unsealing Vault..."
  curl -s -X PUT -d "{\"key\": \"$UNSEAL_KEY\"}" http://vault:8200/v1/sys/unseal
fi
