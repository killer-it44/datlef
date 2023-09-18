#!/bin/sh -e
cf target -o UsageTrackerAndFeedbackApps -s usage-tracker-production
cf delete -f datlef-old
cf push datlef-new --no-start
cf map-route datlef-new internal.cfapps.sap.hana.ondemand.com --hostname cloud-native-dev-usage-tracker-analytics
cf set-env datlef-new READONLY_DB_URL "$READONLY_DB_URL"
cf bind-service datlef-new postgres-usage-tracker
cf start datlef-new
cf rename datlef datlef-old
cf stop datlef-old
cf rename datlef-new datlef
