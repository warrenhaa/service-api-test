#!/bin/bash

cd /tmp/deploy/ >> /opt/deployment/deploy.log
sudo /bin/chmod 755 deploy/* >> /opt/deployment/deploy.log
d=`date`
echo "$d : changed permisssion of scripts" >> /opt/deployment/deploy.log
sudo /bin/cp -R /tmp/deploy/* /home/ec2-user/service-api/ >> /opt/deployment/deploy.log
d=`date`
echo "$d : files copied " >> /opt/deployment/deploy.log
cd /home/ec2-user/service-api >> /opt/deployment/deploy.log
sudo /bin/chmod 755 /home/ec2-user/service-api/* >> /opt/deployment/deploy.log
d=`date`
echo "$d : pemission changed after copy in user/service-api" >> /opt/deployment/deploy.log
d=`date`
echo "$d : downloaded bundle exiting stage 3 complete" >> /opt/deployment/deploy.log

exit 0
