# Local SonarQube instance

The instructions in this directory allow you to run a local SonarQube instance
to experiment with custom plugins, and other aspects of possible integration
between SonarQube and Project Bayesian

## Running SonarQube locally

For the time being, this is completely disconnected from the default
docker-compose setup, as it is intended purely for local experimentation.
The assumption is that real deployments using the SonarQube integration will
work with a pre-existing SonarQube installation.

Running the SonarQube server (in this directory):

    docker-compose up

The default username/password account credentials are just `admin`/`admin`.

After logging in, go to "Administration", select "System->Update Centre" and
then select the "Available" tab to install additional existing plugins.

Since this is purely for local experimentation, a volume mount from the host
allows manual injection of plugins: files added to `extensions/plugins` will
appear in `/opt/sonarqube/extensions/plugins` inside the container, permitting
[manual plugin installation](http://docs.sonarqube.org/display/SONAR/Installing+a+Plugin)
by saving the plugins directly into your source checkout (the `.gitignore`
file in that directory ensures they won't be inadvertently checked in). Use
the "Installed" tab of the Update Centre pane described above to confirm
whether or not the plugin has been detected and loaded appropriately.

NOTE: for the purpose of loading plugins, stopping and restarting the docker
container does *not* count as restarting the server - instead, after the
service is already running, go to "Administration", select "System->System Info"
and click the "Restart Server" button.

(This simple approach to injecting plugins via `docker-compose` was inspired by
the data container approach in https://github.com/MehrCurry/docker-sonar )

Alternatively you can build and "hot" deploy the Bayesian plugin with
`../sonarqube-widget/deploy.sh` script.
