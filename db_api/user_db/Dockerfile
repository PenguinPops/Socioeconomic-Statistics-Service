FROM postgres:latest

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=secret
ENV POSTGRES_DB=userdb
ENV POSTGRES_PORT=5432

# Copy the initialization script
COPY init.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432

# This Dockerfile sets up a PostgreSQL database with a user and password.
# The init.sql script is executed when the container is first run, creating the database and tables.
# The PostgreSQL server is started with the specified configuration file.
# The container exposes port 5432 for database connections.
# The default user is 'postgres' with the password 'secret'.
# The database name is 'userdb'.