FROM sonarqube:6.0-alpine

MAINTAINER Michal Srb <michal@redhat.com>

# Enable dev mode for hot deployments
RUN sed -i -e "\$asonar.web.dev=true" ${SONARQUBE_HOME}/conf/sonar.properties
