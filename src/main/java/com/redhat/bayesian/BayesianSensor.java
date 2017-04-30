package com.redhat.bayesian;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.sonar.api.batch.Sensor;
import org.sonar.api.batch.SensorContext;
import org.sonar.api.batch.fs.FileSystem;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.measures.Measure;

import org.sonar.api.resources.Project;
import org.sonar.api.utils.log.*;
import org.apache.maven.model.Dependency;
import org.apache.maven.model.Model;
import org.apache.maven.model.io.xpp3.MavenXpp3Writer;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
//import org.json.JSONObject;
import org.json.*;

public class BayesianSensor implements Sensor {

	private static final Logger log = Loggers.get(BayesianSensor.class);
	private static final String LOG_PREFIX = "BayesianSensor: ";
	private final FileSystem fs;

	public BayesianSensor(FileSystem fs) {
		this.fs = fs;
	}

	public boolean shouldExecuteOnProject(Project arg0) {
		return true;
	}

	public void analyse(Project project, SensorContext context) {
		File dir = fs.baseDir();
		log.info(LOG_PREFIX + "Base Directory is: " + dir.getAbsolutePath());
		Set<String> manifest_files = new HashSet<String>();
		manifest_files.add(new File(dir, "package.json").getAbsolutePath());
		manifest_files.add(new File(dir, "npm-shrinkwrap.json").getAbsolutePath());

		String mavenManifest = "pom.xml";
		if (new File(dir, mavenManifest).isFile()) {
			if (runningInMaven(context)) {
				File stackFile = new File(fs.workDir(), mavenManifest);
				try {
					List<Dependency> dependencies = getMavenDependencies(context);
					Model model = createMavenModel(project, context, dependencies);
					writeModelToFile(model, stackFile);
					manifest_files.add(stackFile.getAbsolutePath());
				} catch (Exception e) {
					log.error(LOG_PREFIX + "Error processing Maven dependencies", e);
				}
			} else {
				log.warn(LOG_PREFIX + "Unable to process " + mavenManifest + " files, please use sonar-maven-plugin.");
			}
		}

		String origin = context.settings().getString("sonar.projectName");
		log.info(LOG_PREFIX + "Origin is: " + origin);
		log.info(LOG_PREFIX + "URL: " + APIRestClient.getDefaultApiUrl() + "stack-analyses");

		APIRestClient client = new APIRestClient();
		String response = client.postMultipart(APIRestClient.getDefaultApiUrl() + "stack-analyses",
												manifest_files.toArray(new String[0]),
												origin, APIRestClient.getDefaultApiToken());
		try{
			/* 
			 * Add logic to retry the response from the asynchronous /stack-analyses call 
			 */
			
			/*
			 * Logic to Read the actual response from /stack-analyses
			 */
			/*Object obj = JSONValue.parse(response);
			JSONArray arr = (JSONArray)obj;
			JSONObject packageJson = arr. ("result").getJSONObject(0);
			Integer cvss_score = packageJson.getInt("cvss");
			log.info("cvss score:" + cvss_score);
			context.saveMeasure(new Measure<Double>(BayesianMetrics.CVSS, (double)cvss_score));*/
			JSONParser parser = new JSONParser();
			JSONObject json = (JSONObject) parser.parse(response);
			String id  = json.get("id").toString();
			String status_response  = "error";
			int retry_count = 10;

			while(retry_count!= 0){
				if(status_response.contains("error")){
					TimeUnit.SECONDS.sleep(20);
					String url = APIRestClient.getDefaultApiUrl() + "stack-analyses/" + id;
					log.info("Retried URL: " + url);
					status_response = client.get(url, APIRestClient.getDefaultApiToken());
					retry_count -- ;
				}
				else {
					break;
				}
			}
			if(!(status_response.contains("error"))){
				JSONObject obj = (JSONObject) parser.parse(status_response);
				JSONArray array = new JSONArray();
				array = (JSONArray)obj.get("result");
				JSONObject component_object = (JSONObject)array.get(0);
				JSONArray components = (JSONArray)component_object.get("components");
				float cvss_score = (float) 0.0;
				for( int i = 0; i < components.size(); i++){
						JSONObject eachComponent = (JSONObject)components.get(i);
						JSONObject security = (JSONObject)eachComponent.get("security");
						if(security!=null){
							JSONArray vulnerabilities = (JSONArray)security.get("vulnerabilities");
							if (vulnerabilities!=null && vulnerabilities.size()!=0){
								JSONObject each_item = (JSONObject)vulnerabilities.get(0);
								if(each_item!=null){
									String cvss = (String)each_item.get("cvss");
									Float cvss_f = Float.valueOf(cvss);
									if(cvss_f!=null){
										if (cvss_f > cvss_score){
											cvss_score = cvss_f;
										}
									}
								}
							}
						}
				}
				
				context.saveMeasure(new Measure<Double>(BayesianMetrics.CVSS, (double)cvss_score));
				log.info("cvss score:" + cvss_score);
				
				
			}
		}catch (Exception e) {
			log.info(e.getMessage());
		}
	
		log.info("Response: " + response);
		
	}

	private boolean runningInMaven(SensorContext context) {

		if ("maven".equals(context.settings().getProperties().get("sonar.scanner.app").toLowerCase())) {
			return true;
		}
		return false;
	}

	private void writeModelToFile(Model model, File file) throws IOException {

		MavenXpp3Writer writer = new MavenXpp3Writer();
		try (OutputStream os = new FileOutputStream(file)) {
			writer.write(os, model);
		}
	}

	private List<Dependency> getMavenDependencies(SensorContext context) throws ParseException {

		String depsString = context.settings().getProperties().get("sonar.maven.projectDependencies");
		List<Dependency> dependencies = new ArrayList<Dependency>();

		JSONParser parser = new JSONParser();

		JSONArray array = (JSONArray) parser.parse(depsString);

		for (int i = 0; i < array.size(); i++) {
			JSONObject dep = (JSONObject) array.get(i);
			Dependency dependency = new Dependency();

			String pkg = (String) dep.get("k");
			String[] ga = pkg.split(":", 2);

			dependency.setGroupId(ga[0]);
			dependency.setArtifactId(ga[1]);
			dependency.setVersion((String) dep.get("v"));
			dependency.setScope((String) dep.get("s"));

			dependencies.add(dependency);
		}

		return dependencies;
	}

	private Model createMavenModel(Project project, SensorContext context, List<Dependency> dependencies) {

		Model model = new Model();

		String[] ga = project.getKey().split(":", 2);
		String groupId = ga[0];
		String artifactId = ga[0];
		if (ga.length > 1) {
			artifactId = ga[1];
		}
		model.setGroupId(groupId);
		model.setArtifactId(artifactId);
		model.setVersion(project.getAnalysisVersion());
		model.setModelVersion("4.0.0");
		model.setDependencies(dependencies);

		return model;
	}
}
