FROM mongo:latest

COPY db.dump /tmp/db.dump

COPY init-mongo.sh /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/init-mongo.sh

ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=secret
ENV MONGO_INITDB_DATABASE=statsdb_backup

EXPOSE 27017