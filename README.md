# Fabric8-Analytics SonarQube Plugin
SonarQube plugin that includes sensor code to initiate a user stack analyses and widget code to present recommendations and other related information

*Note on naming: The Fabric8-Analytics project has evolved from 2 different projects called "cucos" and "bayesian". We're currently in process of renaming the modules and updating documentation. Until that is completed, please consider "cucos" and "bayesian" to be synonyms of "Fabric8-Analytics".*

## Contributing

See our [contributing guidelines](https://github.com/fabric8-analytics/common/blob/master/CONTRIBUTING.md) for more info.

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
