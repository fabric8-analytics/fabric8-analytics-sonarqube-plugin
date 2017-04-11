#!/bin/sh

if $(docker inspect -f {{.State.Running}} sonar)
	echo "Docker container for sonar is running. Good to go ahead with the build"
then
	echo "Starting the sonarqube docker container"
	docker-compose -f sonarqube-alpine/docker-compose.yml build
	docker-compose -f sonarqube-alpine/docker-compose.yml up -d
	sleep 60
fi

mvn sonar:sonar clean package
cp target/sonar-bayesian-plugin-1.0-SNAPSHOT.jar sonarqube-alpine/extensions/plugins

docker restart sonar

