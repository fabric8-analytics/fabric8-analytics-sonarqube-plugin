#!/bin/bash

# Build and deploy Bayesian plugin for SonarQube

sonar_home="sonarqube-alpine"

# check if SonarQube server is running
curl -sSf http://localhost:9000 > /dev/null
rc=$?
if [[ $rc -ne 0 ]]; then
    echo "SonarQube server is not running, try:"
    echo "docker-compose -f ${sonar_home}/docker-compose.yml up"
    exit 1
fi

# build and deploy
mvn clean package org.codehaus.sonar:sonar-dev-maven-plugin::upload -DsonarHome=${sonar_home} $@

