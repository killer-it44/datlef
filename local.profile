export VCAP_SERVICES='{
    "postgresql-db": [{
        "credentials": { "uri": "postgres://postgres@localhost/postgres" },
        "name": "postgres-usage-tracker"
    }],
    "azure-openai-service-demo": [{
        "credentials":{
            "uaa": {
                "url": "https://cc-refapp.authentication.sap.hana.ondemand.com",
                "clientid":"sb-d994a982-c3d1-48de-8238-dd651802e078!b895|azure-openai-service-i057149-xs!b16730",
                "clientsecret":"4443783a-1ae7-4334-a10d-9fd314b52aeb$nhCXV_IBE0B1doJSy3EiYgwzKhDDtVBhnY2uuxN_VE0="
            }
        },
        "url": "https://azure-openai-serv-i057149.cfapps.sap.hana.ondemand.com",
        "name": "test-llm"
    }]
}'
export READONLY_DB_USER=test:test
export PORT=3000
