# Bayesian SonarQube Widget


## Build jar

```
mvn clean verify
```

## Build Docker image

```
mvn -DfinalName=sonar-bayesian-plugin-latest clean verify && docker build --no-cache --pull -t docker-registry.usersys.redhat.com/bayesian/bayesian-sonarqube .
```
