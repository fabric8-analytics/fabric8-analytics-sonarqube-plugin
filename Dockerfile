FROM docker-registry.usersys.redhat.com/bayesian/sonarqube:latest
MAINTAINER Michal Srb <michal@redhat.com>

COPY target/sonar-bayesian-plugin-latest.jar ${SONARQUBE_HOME}/plugin-updates/

