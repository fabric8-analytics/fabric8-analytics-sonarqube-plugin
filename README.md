# Bayesian SonarQube Widget


## Build jar

```
mvn clean verify
```

## Build Docker image

```
mvn -DfinalName=sonar-bayesian-plugin-latest clean verify && docker build --no-cache --pull -t docker-registry.usersys.redhat.com/bayesian/bayesian-sonarqube .
```

## Alternate: Build and Deploy Bayesian Plugin
* Make sure that the system has docker daemon running and docker-compose already installed
* Run:
```
	./deploy_plugin.sh
```
