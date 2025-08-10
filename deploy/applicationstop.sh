#!/bin/bash
if [ ! -d "/opt/deployment" ] 
then
    sudo mkdir /opt/deployment
fi
sudo /bin/rm -rf service-api/node_modules
sudo /bin/rm -rf service-api/coverage

ls service-api/

sudo /usr/local/bin/docker-compose -f /home/ec2-user/service-api/service-api/docker-compose.yml down
sudo /usr/bin/docker rmi -f $(docker images -a -q)

# Delete the old repo
sudo /bin/rm -rf /home/ec2-user/service-api
d=`date`
echo "$d : stopped" >> /opt/deployment/deploy.log
d=`date`
echo "$d : exiting stage 1 complete" >> /opt/deployment/deploy.log

exit 0