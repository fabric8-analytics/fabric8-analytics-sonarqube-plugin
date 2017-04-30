package com.redhat.bayesian;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.io.FileNotFoundException;

import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.HttpResponse;

public class APIRestClient {
	private String inputFile;
	private String url;
	
	public APIRestClient() {
		this.url = "";
		this.inputFile = "";
	}
	
	// To support GET
	public APIRestClient(String url) {
		this.url = url;
	}
	
	// To support multipart POST
	public APIRestClient(String url, String inputFile) {
		// to support multipart requests
		this.inputFile = inputFile;
		this.url = url;
	}
	
	public String get(String url, String authToken) {
		String response = "";
		String header = "Bearer " + authToken;
		CloseableHttpClient httpClient = HttpClients.createDefault();
		try {
			HttpGet httpGetRequest = new HttpGet(url);
			httpGetRequest.setHeader("Authorization", header);
			ResponseHandler<String> responseHandler = new BasicResponseHandler();
			response = httpClient.execute(httpGetRequest, responseHandler);
		} catch (Exception e) {
		  e.printStackTrace();
		} finally {
		  httpClient.getConnectionManager().shutdown();
		}
		return response;
	}
	
	// TODO
	public String post() {
		return "";
	}
	
	public String postMultipart(String url, String [] inputFiles, String origin, String authToken) {
		CloseableHttpClient httpclient = HttpClients.createDefault();
		HttpPost httpPost = new HttpPost(url);
		MultipartEntityBuilder builder = MultipartEntityBuilder.create();

		boolean noFiles = true;
		String header = "Bearer " + authToken;

		for (String inputFile: inputFiles) {
			File f = new File(inputFile);
			if (f.isFile()) {
				noFiles = false;
				builder.addBinaryBody("manifest[]", f);
			}
		}

		String response = "";
		if (noFiles == false) {
			if (origin != null && !origin.isEmpty()) {
				builder.addTextBody("origin", origin);
			}
			HttpEntity reqEntity = builder.build();
			httpPost.setEntity(reqEntity);
			httpPost.setHeader("Authorization", header);

			try {
				ResponseHandler<String> responseHandler = new BasicResponseHandler();
				response = httpclient.execute(httpPost, responseHandler);
			}
			catch (FileNotFoundException e) {
				e.printStackTrace();
			}
			catch (ClientProtocolException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return response;
	}

	public static String getDefaultApiUrl() {

		String config = "/config.properties";

		String url = null;
		try (InputStream in = APIRestClient.class.getResourceAsStream(config)) {
			Properties properties = new Properties();
			properties.load(in);
			url = properties.getProperty("bayesian.api.server");
			if (url == null) {
				new IllegalStateException("bayesian.api.server property is null");
			}
		} catch (IOException e) {
			new IllegalStateException(config + " resource is missing");
		}
		return url;
	}

	public static String getDefaultApiToken() {

		String config = "/config.properties";

		String token = null;
		try (InputStream in = APIRestClient.class.getResourceAsStream(config)) {
			Properties properties = new Properties();
			properties.load(in);
			token = properties.getProperty("bayesian.api.token");
			if (token == null) {
				new IllegalStateException("bayesian.api.token property is null");
			}
		} catch (IOException e) {
			new IllegalStateException(config + " resource is missing");
		}
		return token;
	}
}
