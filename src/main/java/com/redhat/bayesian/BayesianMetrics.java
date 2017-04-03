package com.redhat.bayesian;

import org.sonar.api.measures.CoreMetrics;
import org.sonar.api.measures.Metric;
import org.sonar.api.measures.Metrics;

import java.util.Arrays;
import java.util.List;

public final class BayesianMetrics implements Metrics {
  
  public static final Metric<Double> CVSS = new Metric.Builder("cvss", "Cvss score", Metric.ValueType.FLOAT)
    .setDescription("CVSS score")
    .setDirection(Metric.DIRECTION_BETTER)
    .setQualitative(false)
    .setDomain("Bayesian")
    .create();

  // getMetrics() method is defined in the Metrics interface and is used by
  // Sonar to retrieve the list of new metrics
  public List<Metric> getMetrics() {
    return Arrays.<Metric>asList(CVSS);
  }
}