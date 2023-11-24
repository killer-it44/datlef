export VCAP_SERVICES='{
    "postgresql-db": [{
        "credentials": { "uri": "postgres://postgres@localhost/postgres" },
        "name": "postgres-usage-tracker"
    }],
    "azure-openai-service-demo": [{
        "credentials":{
            "uaa": {
                "url": "https://cc-refapp.authentication.sap.hana.ondemand.com",
                "clientid":"<clientid>",
                "clientsecret":"<clientsecret>"
            },
            "url": "https://azure-openai-serv-i057149.cfapps.sap.hana.ondemand.com"
        },
        "name": "test-llm"
    }]
}'
export READONLY_DB_USER=test:test
export PORT=3000
