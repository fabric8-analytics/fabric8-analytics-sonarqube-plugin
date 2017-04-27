# Triggering SonarQube/Fabric8-Analytics scan from Jenkins

SonarQube provides an official Jenkins plugin that people can use for triggering
SonarQube analyses during Jenkins builds. The process how to install and configure the plugin
is described in details in the [official documentation](http://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Jenkins).
Therefore this document will mostly focus on the Fabric8-Analytics specific bits.

Note if you're looking for a simple way how to play around with the plugin, jump to the [Testing in OpenShift](#testing-in-openshift) section.

## sonar-scanner configuration

By default, [`sonar-scanner`](http://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner)
reads configuration from a file named `sonar-project.properties`. At minimum, the file
should contain following:

```
# project metadata
# must be unique in a given SonarQube instance
sonar.projectKey=my:project
# this is the name displayed in the SonarQube UI
sonar.projectName=My project
# the project version; for better overview in SonarQube,
# the value should reflect the current version
# as specified in package.json or similar manifest file.
sonar.projectVersion=1.0.0

# comma-separated paths to directories containing source files
sonar.sources=.

# SonarQube server with Fabric8-Analytics plugin installed
sonar.host.url=http://sonar-test.lab.eng.rdu2.redhat.com/
```

Note it's also possible to leave some of the parameters out and specify them in Jenkins instead.
That can be useful for example when you don't want to store location of the Sonar server
in your version control system.

`sonar.host.url` parameter tells `sonar-scanner` where to find SonarQube server.
If the server has the Fabric8-Analytics plugin installed, the `sonar-scanner`
will be able to trigger Fabric8-Analytics analysis. No further configuration is required.
This means that if Jenkins is already configured to perform Sonar scans during builds,
it's possible to also trigger Fabric8-Analytics scans by simply installing Fabric8-Analytics plugin
on the SonarQube server, Jenkins configuration can stay untouched.


## Running sonar-scanner during Jenkins build

There is nothing Fabric8-Analytics specific here. You can follow the official documentation and configure
your Jenkins jobs to trigger SonarQube scans. The SonarQube plugin supports both [standard
jobs](http://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Jenkins#AnalyzingwithSonarQubeScannerforJenkins-AnalyzingwiththeSonarQubeScanner)
and [pipelines](http://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Jenkins#AnalyzingwithSonarQubeScannerforJenkins-TriggeringSonarQubeanalysisinaJenkinspipeline).


## Where to find scan results

The SonarQube plugin doesn't show any results directly in the Jenkins web UI.
Instead, it provides a link to the SonarQube server where the results can be found.


## Testing in OpenShift

If you have access to OpenShift, you can easily spin up pre-configured Jenkins
instance which has the SonarQube plugin pre-installed. You can then inspect
the running instance and play around with it, see how the plugin is configured
or try to build the sample project (which will also schedule Fabric8-Analytics analysis).
Simply follow the instructions below.


Create a new project (optional, it's possible to use an existing one):
```
oc new-project fabric8-analytics-demo
```

Import the [image](https://gitlab.cee.redhat.com/msrb/openshift-jenkins-with-sonar-plugin) from the internal RH registry:
```
oc import-image docker-registry.usersys.redhat.com/bayesian/jenkins-2-centos7-with-sonarqube --insecure=true --confirm
```

Create a new application from the newly imported image:
```
oc new-app jenkins-ephemeral -p NAMESPACE=fabric8-analytics-demo -p JENKINS_IMAGE_STREAM_TAG=jenkins-2-centos7-with-sonarqube:latest
```

Find out the URL where the Jenkins is running:
```
oc status
```
