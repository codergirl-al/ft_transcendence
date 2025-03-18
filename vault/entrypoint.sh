#!/bin/sh
set -e

# Start Vault server in the background
vault server -config=/vault/config/config.hcl > /tmp/vault.log 2>&1 &

# # Wait for the server to start
# echo "Waiting for Vault server to start..."
# while ! nc -z localhost 8200; do
#   sleep 1
# done

sleep 10

# Run the initialization and unsealing script
echo "Running vault-init-unseal.sh..."
sh /vault-init-unseal.sh

# Keep the container running
tail -f /dev/null