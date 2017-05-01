# OpenShift Jenkins image with SonarQube plugin pre-installed

Official Jenkins image for OpenShift with SonarQube plugin pre-installed and pre-configured.
There is also a sample job that can be used for testing.

## Build


```
s2i build . openshift/jenkins-2-centos7 <doker registry>/jenkins-2-centos7-with-sonarqube
```

Please see [documentation](https://github.com/openshift/jenkins#installing-using-s2i-build)
of the official OpenShift Jenkins image for more information.
