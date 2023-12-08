#/bin/sh
pg_host=$(cf env datlef | sed -n 's/^.*postgres.*@\(.*\)\/.*$/\1/p')
cf ssh -L localhost:5444:$pg_host datlef
