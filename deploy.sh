#!/bin/sh
cf push datlef --no-start
cf map-route datlef internal.cfapps.sap.hana.ondemand.com --hostname cloud-native-dev-usage-tracker-analytics
cf set-env datlef READONLY_DB_URL "$READONLY_DB_URL"
cf bind-service datlef postgres-usage-tracker
cf start datlef
