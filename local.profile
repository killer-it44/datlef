export VCAP_SERVICES='{
    "postgresql-db": [{
        "credentials": { "uri": "postgres://postgres@localhost/postgres" },
        "name": "postgres-usage-tracker"
    }]
}'
export READONLY_DB_USER=test:test
export PORT=3000
