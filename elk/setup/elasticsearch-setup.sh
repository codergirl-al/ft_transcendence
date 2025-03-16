#!/bin/bash

# Check if required environment variables are set
if [ -z "${ELASTIC_PASSWORD}" ]; then
  echo "Set the ELASTIC_PASSWORD environment variable in the .env file"
  exit 1
elif [ -z "${KIBANA_PASSWORD}" ]; then
  echo "Set the KIBANA_PASSWORD environment variable in the .env file"
  exit 1
fi

# Create CA if it doesn't exist
if [ ! -f config/certs/ca.zip ]; then
  echo "Creating CA"
  bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip
  unzip config/certs/ca.zip -d config/certs
fi

# Create certificates if they don't exist
if [ ! -f config/certs/certs.zip ]; then
  echo "Creating certs"
  echo -ne \
  "instances:\n"\
  "  - name: elasticsearch\n"\
  "    dns:\n"\
  "      - elasticsearch\n"\
  "      - localhost\n"\
  "    ip:\n"\
  "      - 127.0.0.1\n"\
  "  - name: kibana\n"\
  "    dns:\n"\
  "      - kibana\n"\
  "      - localhost\n"\
  "    ip:\n"\
  "      - 127.0.0.1\n"\
  > config/certs/instances.yml
  bin/elasticsearch-certutil cert --silent --pem -out config/certs/certs.zip --in config/certs/instances.yml --ca-cert config/certs/ca/ca.crt --ca-key config/certs/ca/ca.key
  unzip config/certs/certs.zip -d config/certs
fi

# Set file permissions
echo "Setting file permissions"
chown -R root:root config/certs
find . -type d -exec chmod 750 {} \;
find . -type f -exec chmod 640 {} \;

# Wait for Elasticsearch to become available
echo "Waiting for Elasticsearch availability"
until curl -s --cacert config/certs/ca/ca.crt https://elasticsearch:9200 | grep -q "missing authentication credentials"; do sleep 30; done

# Set kibana_system password
echo "Setting kibana_system password"
until curl -s -X POST --cacert config/certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://elasticsearch:9200/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 10; done

# Function to make authenticated API calls to Elasticsearch
call_elasticsearch() {
  local METHOD=$1
  local ENDPOINT=$2
  local BODY=$3

  curl -s -X "$METHOD" \
       -u "elastic:${ELASTIC_PASSWORD}" \
       --cacert config/certs/ca/ca.crt \
       -H "Content-Type: application/json" \
       -d "$BODY" \
       "https://elasticsearch:9200$ENDPOINT"
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

echo "All done!"

# Copy certificates to a local directory
cp -r /usr/share/elasticsearch/config/certs /usr/share/elasticsearch/config/certs_local