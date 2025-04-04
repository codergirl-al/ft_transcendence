#!/bin/bash

# Source the .env file to load environment variables
if [[ -f ./.env ]]; then
  source ./.env
else
  echo "Error: .env file not found."
  exit 1
fi

# Variables
ELASTICSEARCH_URL="https://es01:9200"  # Elasticsearch URL
CERT_DIR="/usr/share/elasticsearch/config/certs/ca"  # Updated certificate directory
USERNAME="elastic"                     # Elasticsearch username
PASSWORD=$ELASTIC_PASSWORD           # Elasticsearch password

# Check if required files exist
if [[ ! -f "$CERT_DIR/ca.crt" ]]; then
  echo "CA certificate not found in $CERT_DIR."
  exit 1
fi

# Function to make authenticated API calls to Elasticsearch
call_elasticsearch() {
  local METHOD=$1
  local ENDPOINT=$2
  local BODY=$3

  curl -s -X "$METHOD" \
       -u "$USERNAME:$PASSWORD" \
       --cacert "$CERT_DIR/ca.crt" \
       -H "Content-Type: application/json" \
       -d "$BODY" \
       "$ELASTICSEARCH_URL$ENDPOINT"
}

# Create the ILM Policy
echo "Creating ILM policy..."
ILM_POLICY=$(cat <<EOF
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "10GB",
            "max_age": "1d"
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
EOF
)

call_elasticsearch "PUT" "/_ilm/policy/logs_policy" "$ILM_POLICY"
echo "ILM policy created."

# Create the Index Template
echo "Creating index template..."
INDEX_TEMPLATE=$(cat <<EOF
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs_policy",
      "index.lifecycle.rollover_alias": "logs"
    },
    "mappings": {
      "properties": {
        "timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "message": { "type": "text" }
      }
    }
  }
}
EOF
)

call_elasticsearch "PUT" "/_index_template/logs_template" "$INDEX_TEMPLATE"
echo "Index template created."

# Create the Initial Index
echo "Creating initial index..."
INITIAL_INDEX=$(cat <<EOF
{
  "aliases": {
    "logs": {
      "is_write_index": true
    }
  }
}
EOF
)

call_elasticsearch "PUT" "/logs-000001" "$INITIAL_INDEX"
echo "Initial index created."

echo "Setup complete!"