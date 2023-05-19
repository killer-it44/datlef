#!/bin/sh -e
cf push datlef-new --no-start
cf map-route datlef-new internal.cfapps.sap.hana.ondemand.com --hostname cloud-native-dev-usage-tracker-analytics
cf set-env datlef-new READONLY_DB_URL "$READONLY_DB_URL"
cf bind-service datlef-new postgres-usage-tracker
cf start datlef-new
cf delete -f datlef
cf rename datlef-new datlef
