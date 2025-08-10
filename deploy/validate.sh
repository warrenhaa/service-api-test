#!/usr/bin/env bash

d=`date`
echo "$d : Validate Script" >> /opt/deployment/deploy.log
URL="localhost:3000/docs/"
echo "URL: $URL" >> /opt/deployment/deploy.log

while true
do
  HTTP_CODE=`curl --write-out '%{http_code}' -o /dev/null -m 10 -q -s $URL`
  if [ "$HTTP_CODE" == "200" ]; then
    echo "Successfully pulled root page." >> /opt/deployment/deploy.log
    exit 0;
  fi
  echo "Attempt to curl endpoint returned HTTP Code $HTTP_CODE. Backing off and retrying." >> /opt/deployment/deploy.log
  sleep 30
done

echo "Server did not come up after expected time. Failing." >> /opt/deployment/deploy.log
exit 1