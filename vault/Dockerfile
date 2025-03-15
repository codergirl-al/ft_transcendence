# Use the official Vault image as the base
FROM hashicorp/vault:latest

RUN apk add --no-cache curl


# Set the Vault configuration as an environment variable
ENV VAULT_LOCAL_CONFIG='{ "storage": { "file": { "path": "/vault/file" } }, "listener": [ { "tcp": { "address": "0.0.0.0:8200", "tls_disable": true } } ], "default_lease_ttl": "168h", "max_lease_ttl": "720h", "ui": true }'

ENV VAULT_ADDR='http://0.0.0.0:8200'

COPY vault-init-unseal.sh .

# Expose the Vault port
EXPOSE 8200

# Start Vault server
CMD ["server"]