package com.redhat.bayesian;

import java.util.Arrays;
import java.util.List;
import org.sonar.api.Properties;
import org.sonar.api.Property;

import org.sonar.api.SonarPlugin;

@Properties({
  @Property(
    key = BayesianConstants.SERVER_URL_PROPERTY,
    name = "Server URL",
    description = "http://<Bayesian API URL>/api/v1/",
    global = true,
    project = true,
    module = false
  )
})
public class BayesianPlugin extends SonarPlugin {

	public List getExtensions() {
		// TODO Auto-generated method stub
		return (Arrays.asList(BayesianSensor.class, BayesianMainWidget.class,
                          BayesianStackDetailWidget.class, BayesianComponentDetailWidget.class,
                          BayesianCompareReferenceStacksWidget.class, BayesianMetrics.class));
	}
	
}
