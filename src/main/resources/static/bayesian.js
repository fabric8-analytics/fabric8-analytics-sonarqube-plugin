var stack_data = {};

function display_result(id, packageName, packageVersion, definitionFile) {
  $j(document).ready(function () {
  definitionFile = definitionFile || "package.json";
  html = "";
  apiHost = "${bayesian.api.server}";
  var url = apiHost + '/stack-analyses/' + id;
  document.getElementById("result-body").style.display = 'none';

  jQuery.ajax({
    url: url,
    error: function (xhr, ajaxOptions, thrownError) {
      var msg = JSON.parse(xhr.responseText);
      document.getElementById("errors").innerHTML = "<div class=''>Error: " + msg.error + " </div>";
      document.getElementById("errors").style.display = 'block';
      document.getElementById("result-body").style.display = 'none';
    },
    success: function (data, textStatus, xhr) {
      var status = xhr.status;
      var msg = JSON.parse(xhr.responseText);

      if (status == 202) { // Receives an Accept but not Done yet
        document.getElementById("errors").innerHTML = "<div class=''>" + msg.error + "</div>";
        document.getElementById("errors").style.display = 'block';
        document.getElementById("result-body").style.display = 'none';
        return;
      }

      stack_data = data;

      var pkgInfo = "<h1>" + packageName + " " + packageVersion + "</h1>";
      pkgInfo += "<ul class='nav navbar-nav nav-tabs'><li id='nav_link_package_json_data' class='active'><a onclick=\"switch_data_file('package.json');\">metadata file</a></li>";
      if (stack_data.result.length > 1){
        pkgInfo += "<li id='nav_link_npm-shrinkwrap_json_data'><a onclick=\"switch_data_file('npm-shrinkwrap.json');\">dependency lock file</a></li></ul>";
      }else{
        pkgInfo += "</ul>";
      }
      document.getElementById("errors").style.display = 'none';
      document.getElementById("packageInfo").innerHTML = pkgInfo;
      render_stack_details(0);

      for (var result in data.result) {
        // NOTE: In widget-span-X, every X point is equal to 8.33 % of parent.
        // Therefore we can only use 12 points of X in every row.
        html += "<table id='component_list-" + data.result[result].manifest_name + "' class='data'><thead><tr class=''>";
        html += "<th class=''>Ecosystem</div>";
        html += "<th class=''>Package</div>";
        html += "<th class=''>Version <a href='https://gitlab.cee.redhat.com/bayesian/Bayesian/tree/master/docs/stack-analysis.md#version-components'><img title='Version used in this stack. Click for more info.' src='/static/bayesian/icons/266-question.svg'></img></a>" + "</th>";
        html += "<th class=''>Latest Version <a href='https://gitlab.cee.redhat.com/bayesian/Bayesian/tree/master/docs/stack-analysis.md#latest-version-components'><img title='Latest version available. Click for more info.' src='/static/bayesian/icons/266-question.svg'></img></a>" + "</th>";
        html += "<th class=''>Public Usage <a href='https://gitlab.cee.redhat.com/bayesian/Bayesian/tree/master/docs/stack-analysis.md#public-usage-components'><img title='Indication of how often this component is being used. Click for more info.' src='/static/bayesian/icons/266-question.svg'></img></a>" + "</th>";
        html += "<th class=''>Relative Public Usage <a href='https://gitlab.cee.redhat.com/bayesian/Bayesian/tree/master/docs/stack-analysis.md#relative-public-usage-components'><img title='Indication of how often this component is being used relatively to other components. Click for more info.' src='/static/bayesian/icons/266-question.svg'></img></a>" + "</th>";
        html += "<th class=''>Red Hat Usage <a href='https://gitlab.cee.redhat.com/bayesian/Bayesian/tree/master/docs/stack-analysis.md#red-hat-usage-components'><img title='Indication of usage within Red Hat. Click for more info.' src='/static/bayesian/icons/266-question.svg'></img></a>" + "</th>";
        html += "<th class=''>Popularity <a href='https://gitlab.cee.redhat.com/bayesian/Bayesian/tree/master/docs/stack-analysis.md#popularity-components'><img title='Indication of how popular this package is in terms of forks/stargazers counti. Click for more info.' src='/static/bayesian/icons/266-question.svg'></img></a>" + "</th>";
        html += "<th class=''>Licenses <a href='https://gitlab.cee.redhat.com/bayesian/Bayesian/tree/master/docs/stack-analysis.md#licenses-components'><img title='Licenses found. Click for more info.'  src='/static/bayesian/icons/266-question.svg'></img></a>" + "</th>";
        html += "<th class=''>CVSS <a href='https://gitlab.cee.redhat.com/bayesian/Bayesian/tree/master/docs/stack-analysis.md#cvss-components'><img title='The security vulnerability ranking based on the CVSS score. Click for more info.' src='/static/bayesian/icons/266-question.svg'></img></a>" + "</th>";
        html += "<th class=''>Black Duck Security <a href='https://gitlab.cee.redhat.com/bayesian/Bayesian/tree/master/docs/stack-analysis.md'><img title='The  BlackDuck security vulnerability information. Click for more info.' src='/static/bayesian/icons/266-question.svg'></img></a>" + "</th>";
        html += "<th class=''>Black Duck Licences <a href='https://gitlab.cee.redhat.com/bayesian/Bayesian/tree/master/docs/stack-analysis.md'><img title='The  BlackDuck security vulnerability information. Click for more info.' src='/static/bayesian/icons/266-question.svg'></img></a>" + "</th>";

        html += "</tr></thead><tbody>";

        for (var component in data.result[result].components) {
          var ecosystem = data.result[result].components[component].ecosystem;
          var name = data.result[result].components[component].name;
          var version = data.result[result].components[component].version;
          var latest_version = data.result[result].components[component].latest_version;
          var analyses_link = apiHost + "/analyses/" + ecosystem + "/" + name + "/" + version;
          var cvss = data.result[result].components[component].cve_details;
          var public_usage = handle_api_response_code(data.result[result].components[component].dependents_count);
          var relative_public_usage = data.result[result].components[component].relative_usage;
          var redhat_usage = get_redhat_channels(data.result[result].components[component].redhat_usage).toString().replace(/,/g, "<br/>");
          var github_forks = handle_api_response_code(data.result[result].components[component].github_details.forks_count);
          var github_stars = handle_api_response_code(data.result[result].components[component].github_details.stargazers_count);
          var licenses = data.result[result].components[component].licenses;
          var black_duck_details = data.result[result].components[component].blackduck_details;
          var black_duck_security = "";
          var black_duck_license = "";
          if (typeof black_duck_details.security[0] == "undefined" || black_duck_details.security.length === 0) {
            black_duck_security = " - ";
          } else {
            for (i = 0; i < black_duck_details.security.length; i++) {
              black_duck_security += "<span>" + black_duck_details.security[i].baseScore + "</span>";
            }
          }

          if (typeof black_duck_details.license == "undefined" || black_duck_details.license[0].name.length === 0) {
            black_duck_license = " - ";
          } else {
            for (i = 0; i < black_duck_details.license.length; i++) {
              black_duck_license += "<span>" + black_duck_details.license[i].name + "</span>";
            }
          }

          var version_style = "version-uptodate";
          if (latest_version === null) {
            latest_version = "N/A";
            version_style = "version-unknown";
          } else if (latest_version != version) {
            version_style = "version-old";
          }

          html += "<tr class='bottom-border'>";
          html += "<td class=''>" + ecosystem + "</td>";
          html += "<td class=''><a href='#componentDetailHeader' onclick=\"render_component_detail('" + ecosystem + "','" + name + "','" + version + "')\">" + name + "</a></td>";
          html += "<td class='" + version_style + "'>" + version + "</td>";
          html += "<td class=''>" + latest_version + "</td>";
          html += "<td class=''>";
          if (public_usage == "-" || public_usage == "N/A") {
            html += "<span title='This datapoint is not available. Please contact us if you think this is an error'>" + public_usage + "</span>";
          }
          else {
            html += public_usage;
          }
          html += "</td>";
          html += "<td class=''>" + relative_public_usage + "</td>";
          html += "<td class='break-word'>" + redhat_usage + "</td>";
          html += "<td class=''>";
          if (github_forks == "-" || github_forks == "N/A") {
            html += "<span title='Github Forks: This datapoint is not available. Please contact us if you think this is an error'>N/A</span> / ";
          }
          else {
            html += "<span title='Github Forks'>" + github_forks + "</span> / ";
          }
          if (github_stars == "-" || github_stars == "N/A") {
            html += "<span title='Github Stars: This datapoint is not available. Please contact us if you think this is an error'>N/A</span>";
          }
          else {
            html += "<span title='Github Stars'>" + github_stars + "</span>";
          }
          html += "</td>";
          html += "<td class='break-word' >" + licenses + "</td>";

          if (cvss.length === 0) {
            html += "<td class=''> - </td>";
          }
          else {
            cvssArray = [];
            for (var element in cvss) {
              cvssArray.push(parseFloat(cvss[element].cvss));
            }

            html += "<td class=''> ";
            html += getCvssRank(getMaxCvss(cvssArray));
            html += " </td>";
          }
          html += "<td class='break-word' >" + black_duck_security + "</td>";
          html += "<td class='break-word' >" + black_duck_license + "</td>";
          html += "</tr>";
        }
        html += "</tbody>";
        document.getElementById("components").innerHTML = html;
        $j("#component_list-" + data.result[result].manifest_name + " > tbody > tr:odd").addClass("odd");
        $j("#component_list-" + data.result[result].manifest_name + " > tbody > tr:not(.odd)").addClass("even");

        document.getElementById("result-body").style.display = 'block';
      }
      document.getElementById("component_list-npm-shrinkwrap.json").style.display = 'none';
    }
  });
  });
}

function render_stack_details(index) {
  reset_stack_details();
  var deps = dependencies_by_data_file(index, stack_data.result[index].components.length);
  document.getElementById("packageDeps").innerHTML = deps;

  var license_data = "<p> Licenses Found: " + stack_data.result[index].total_licenses + "</p>";
  license_data += "<p> Distinct Licenses: " + stack_data.result[index].distinct_licenses.length + "</p>";
  var temp = stack_data.result[index].distinct_licenses;

  license_data += "<p> Licenses: " + temp + "</p>";
  document.getElementById("licenses").innerHTML = license_data;

  var security_data = "<p>Total CVEs: " + stack_data.result[index].total_security_issues + "</p>";
  security_data += "<p>CVSS: " + getCvssRank(stack_data.result[index].cvss) + "</p>";
  document.getElementById("security").innerHTML = security_data;

  var usage_html = "<p> Average Public Component Usage: " + stack_data.result[index].usage.average_usage + "</p>";
  usage_html += "<p> Components with Low Public Usage: " + stack_data.result[index].usage.low_public_usage_components + "</p>";
  usage_html += "<p> Components Redistributed by Red Hat: " + stack_data.result[index].usage.redhat_distributed_components + "</p>";
  document.getElementById("usage").innerHTML = usage_html;

  var popularity_html = "<p> Average Component GitHub Stars: " + stack_data.result[index].popularity.average_stars + "</p>";
  popularity_html += "<p> Average Component GitHub Forks: " + stack_data.result[index].popularity.average_forks + "</p>";
  popularity_html += "<p> Components with Low Popularity: " + stack_data.result[index].popularity.low_popularity_components + "</p>";
  document.getElementById("popularity").innerHTML = popularity_html;

  if (typeof(stack_data.result[index].metadata) != "undefined") {
    var metadata_html = "<p> Components with tests: " + stack_data.result[index].metadata.components_with_tests + "</p>";
    metadata_html += "<p> Components with dependency lock file: " + stack_data.result[index].metadata.components_with_dependency_lock_file + "</p>";
    for (var engine in stack_data.result[index].metadata.required_engines) {
      metadata_html += "<p> Required " + engine + " versions: " + stack_data.result[index].metadata.required_engines[engine] + "</p>";
    }
    document.getElementById("metadata").innerHTML = metadata_html;
  } else {
    document.getElementById("metadata").innerHTML = "N/A";
  }
}

function reset_stack_details() {
  document.getElementById("licenses").innerHTML = "";
  document.getElementById("security").innerHTML = "";
  document.getElementById("usage").innerHTML = "";
  document.getElementById("popularity").innerHTML = "";
  document.getElementById("metadata").innerHTML = "";
}

function render_request_list(project_name_param) {
  var first_project_request = [];
  $j(document).ready(function () {
    var apiHost = "${bayesian.api.server}";

    jQuery.ajax({
      url: apiHost + '/stack-analyses/by-origin/' + project_name_param,
      type: 'GET',
      success: function (data) {
        document.getElementById("requests-info").style.display = 'block';
        if (data.status == "success") {
          var html = "";
          var reqLen = data.results.length;
          if (reqLen > 0) {
            html = "<table class='requests_table' style='width:100%'><tr class='widget-row'>";
            html += "<th class='widget-span widget-span-4 '>Request ID</th>";
            html += "<th class='widget-span widget-span-2 '>Package</th>";
            html += "<th class='widget-span widget-span-1 '>Version</th>";
            html += "<th class='widget-span widget-span-2 '>Submit Time</th>";
            html += "<th class='widget-span widget-span-3 '>Origin</th>";
            html += "</tr>";
          }

          for (var i = 0, j = 0; i < reqLen; i++) {
            var req = data.results[i];
            try {
              var requestJson = JSON.parse(req.requestJson);
              var filename = requestJson.manifest[0].filename;
              var content;
              var name;
              var version;
              if (filename.endsWith(".json")) {
                content = JSON.parse(requestJson.manifest[0].content);
                name = content.name;
                version = content.version;
              } else if (filename.endsWith(".xml")) {
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(requestJson.manifest[0].content, "text/xml");
                name = xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue;
                version = xmlDoc.getElementsByTagName("version")[0].childNodes[0].nodeValue;
              }
              if (project_name_param.indexOf(name) != -1) {
              j++;
              if (j == 1) {
                display_result(req.id, name, version);
              }
              var origin = req.origin;
              if (origin === null) {
                origin = "N/A";
              }

              html += "<tr class='widget-row'>";
              html += "<td class='widget-span widget-span-4 '><a onclick=\"display_result('" + req.id + "','" + name + "','" + version + "')\">" + req.id + "</a></td>";
              html += "<td class='widget-span widget-span-2 '>" + name + "</td>";
              html += "<td class='widget-span widget-span-1 '>" + version + "</td>";
              html += "<td class='widget-span widget-span-2 '>" + req.submitTime.substring(0, 19) + "</td>";
              html += "<td class='widget-span widget-span-3 '>" + origin + "</td>";
              html += "</tr>";
              }
            }
            catch (e) {
              continue;
            }
          }
          document.getElementById("requests-info").innerHTML = html;
        }
      }
    });
  });
}

function render_component_detail(ecosystem, package, version) {
  $j(document).ready(function () {
    var apiHost = "${bayesian.api.server}";

    jQuery.ajax({
      url: apiHost + '/analyses/' + ecosystem + "/" + package + "/" + version,
      type: 'GET',
      success: function (data) {
        document.getElementById("componentDetail").style.display = 'block';
        var html = "";
        var data_analyses_keys = keys(data.analyses);
        html += "<div>";
        html += "<p>Name:" + data.package + "</p> <p>Version:" + data.version + "</p>";
        html += "<p>Author:" + data.analyses.metadata.author + "</p>";
        html += "<p>Description:" + data.analyses.metadata.description + "</p>";
        html += "<p>Homepage: <a href='" + data.analyses.metadata.homepage + "' target=blank>" + data.analyses.metadata.homepage + "</a></p>";
        html += "</div>";

        html += "<div>";
        html += "<hr>";
        for (var key in data_analyses_keys) {
          if (typeof data.analyses[data_analyses_keys[key]].schema != "undefined") {
            html += "<div>";
            html += "<h3 class='capitalize'>" + data.analyses[data_analyses_keys[key]].schema.name.replace("_", " ") + "</h3>";
            if (typeof data.analyses[data_analyses_keys[key]].details != "undefined") {
              for (var i = 0; i <= data.analyses[data_analyses_keys[key]].details.length; i++) {

                var analysis_keys = keys(data.analyses[data_analyses_keys[key]].details[i]);
                for (var analysis_key in analysis_keys) {
                  html += "<div class='widget-span widget-row'>";
                  html += "<span>" + JSON.stringify(data.analyses[data_analyses_keys[key]].details[analysis_key], null, 4) + "</span>";
                  html += "</div>";
                }
              }
            }

            html += "</div>";
          }
        }

        html += "</div>";

        document.getElementById("componentDetail").innerHTML = html;
      }
    });
  });

}

function keys(obj) {
  var keys = [];

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(key);
    }
  }

  return keys;
}

function switch_data_file(data_file) {
  if (data_file == "package.json") {
    document.getElementById("component_list-npm-shrinkwrap.json").style.display = 'none';
    document.getElementById("component_list-package.json").style.display = 'block';
    $j("#nav_link_package_json_data").addClass('active');
    $j("#nav_link_npm-shrinkwrap_json_data").removeClass('active');


    render_stack_details(0);
  } else {
    document.getElementById("component_list-package.json").style.display = 'none';
    document.getElementById("component_list-npm-shrinkwrap.json").style.display = 'block';
    $j("#nav_link_package_json_data").removeClass('active');
    $j("#nav_link_npm-shrinkwrap_json_data").addClass('active');

    render_stack_details(1);
  }
}

function getMaxCvss(cvssArray) {
  if (cvssArray.length === 0) {
    return -1;
  }
  max = cvssArray[0];
  for (var cvss in cvssArray) {
    if (max < cvss) {
      max = cvss;
    }
  }
  return max;
}

function getCvssRank(cvss) {
  var result = "";
  if (cvss >= 0.0 && cvss <= 3.9) {
    result = "<abbr title='" + cvss + "'><b><font color='green'>Low</font></b></abbr>";
  }
  else if (cvss >= 4.0 && cvss <= 6.9) {
    result = "<abbr title='" + cvss + "'><b><font color='orange'>Medium</font></b></abbr>";
  }
  else if (cvss >= 7.0 && cvss <= 10.0) {
    result = "<abbr title='" + cvss + "'><b><font color='red'>Medium</font></b></abbr>";
  }
  return result;
}

function get_redhat_channels(redhat_usage) {
  var unique_channels = [];
  if (redhat_usage.hasOwnProperty('registered_srpms')) {
    var srpms = redhat_usage.registered_srpms;
    var channels = [];
    for (var index in srpms) {
      if (srpms[index].hasOwnProperty('published_in')) {
        channels.push.apply(channels, srpms[index].published_in);
      }
    }
    var channels_set = new Set(channels);
    unique_channels = Array.from(channels_set);
  }
  return unique_channels;
}

function handle_api_response_code(number) {
  if (number < 0 || typeof number == "undefined") {
    return "N/A";
  }
  else {
    return number;
  }
}

function dependencies_by_data_file(data_file, deps_count) {
  if (data_file === 0) {
    return "<p>Number of directly declared dependencies: " + deps_count + " </p>";
  } else {
    return "<p>Number of indirectly declared dependencies: " + deps_count + " </p>";
  }
}
