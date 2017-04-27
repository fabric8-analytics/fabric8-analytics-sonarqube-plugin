# Scanning Maven projects

The recommended way of analyzing Java Maven projects is to use the official [Sonar Maven plugin](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Maven).
Fabric8-Analytics sensor will only work for Maven projects when invoked through the plugin.

To analyze your Maven project, run following command in a directory where your pom.xml file is:
```
mvn clean verify sonar:sonar -Dsonar.host.url=http://your-sonar-server:port
```

Please see the [official documentation](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Maven#AnalyzingwithSonarQubeScannerforMaven-InitialSetup) for more configuration options.
