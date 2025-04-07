FROM docker.elastic.co/elasticsearch/elasticsearch:8.7.1

USER root

RUN apt-get update && apt-get install -y jq

COPY elasticsearch-setup.sh /usr/share/elasticsearch/setup-elasticsearch.sh

RUN chmod +x /usr/share/elasticsearch/setup-elasticsearch.sh

COPY fetch-secrets.sh /usr/share/elasticsearch/fetch-secrets.sh

RUN chmod +x /usr/share/elasticsearch/fetch-secrets.sh

CMD sh -c "source /usr/share/elasticsearch/fetch-secrets.sh && /usr/share/elasticsearch/setup-elasticsearch.sh"
