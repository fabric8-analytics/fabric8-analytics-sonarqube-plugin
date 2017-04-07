##### Run the following command to test java-app:
```
mvn clean verify sonar:sonar -Dsonar.host.url=http://localhost:9000 -Dbayesian.api.server=https://recommender.api.prod-preview.openshift.io -Dsonar.scanner.app=maven
```

* bayesian.api.server: It can be any Bayesian API server instance of your choice
