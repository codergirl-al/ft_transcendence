# Use the official Vault image as the base
FROM hashicorp/vault:latest

# Set the Vault configuration as an environment variable
ENV VAULT_LOCAL_CONFIG='{ "storage": { "file": { "path": "/vault/file" } }, "listener": [ { "tcp": { "address": "0.0.0.0:8200", "tls_disable": true } } ], "default_lease_ttl": "168h", "max_lease_ttl": "720h", "ui": true }'

# Expose the Vault port
EXPOSE 8200

# Start Vault server
CMD ["server"]