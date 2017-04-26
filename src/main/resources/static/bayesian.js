var stack_data = {};

function display_result(id, packageName, packageVersion, definitionFile) {
  definitionFile = definitionFile || "package.json";
  html = "";
  //id = "f82f074df2884cddbb006461ed002ca1";
  //id = '4dee41bf900a4c05aa96c91bd7a064c3';
  apiHost = "${bayesian.api.server}";
  var url = apiHost + 'stack-analyses/' + id;
  stackAnalysesCall(url);
}

function setLicenceDonut(colData) {
  var c3ChartDefaults = $j().c3ChartDefaults();
  var donutData = {
    type: 'donut',
    colors: {
      Cats: $j.pfPaletteColors.blue,
      Hamsters: $j.pfPaletteColors.green,
      Fish: $j.pfPaletteColors.orange,
      Dogs: $j.pfPaletteColors.red
    },
    columns: colData,
    onclick: function (d, i) { console.log("onclick", d, i); },
    onmouseover: function (d, i) { console.log("onmouseover", d, i); },
    onmouseout: function (d, i) { console.log("onmouseout", d, i); }
  };

  // Small Donut Chart
  var donutChartSmallConfig = c3ChartDefaults.getDefaultDonutConfig('8');
  donutChartSmallConfig.bindto = '#donut-chart-10';
  donutChartSmallConfig.tooltip = { show: true };
  donutChartSmallConfig.data = donutData;
  donutChartSmallConfig.legend = {
    show: true,
    position: 'right'
  };
  donutChartSmallConfig.size = {
    width: 250,
    height: 115
  };
  donutChartSmallConfig.tooltip = {
    contents: $j().pfDonutTooltipContents
  };

  var donutChartSmall = c3.generate(donutChartSmallConfig);
}

function stackAnalysesCall(url) {
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

      if (status == 202) {
        document.getElementById("errors").innerHTML = "<div class=''>" + msg.error + "</div>";
        document.getElementById("errors").style.display = 'block';
        document.getElementById("result-body").style.display = 'none';
        return;
      }
      if (data) {
        document.getElementById("errors").style.display = 'none';
        document.getElementById("result-body").style.display = 'block';
        console.log('SUCCESS: ');
        formRecommendationList(data);
      }
      else {
        console.log('Issue with data: ');
      }
    }
  });
}

function formRecommendationList(stackAnalysesData) {
  if (stackAnalysesData.hasOwnProperty('recommendation')) {
    var recommendation = stackAnalysesData.recommendation.recommendations;
    var dependencies = stackAnalysesData.components;
    if (recommendation && recommendation.hasOwnProperty('similar_stacks') && recommendation.similar_stacks.length > 0) {
      var similarStacks = recommendation.similar_stacks;
      const analysis = similarStacks[0].analysis;
      var missingPackages = analysis.missing_packages;
      var versionMismatch = analysis.version_mismatch;

      setRecommendations(recommendation.similar_stacks[0])
    } else {
      $j('#recommenderListView').html('');
      let strToAdd = '<div class="list-view-pf-main-info">' +
        '<div class="list-view-pf-left">' +
        '<img src="/static/bayesian/icons/269-info.svg"></img>' +
        '</div>' +
        '<div class="list-view-pf-body">' +
        '<div class="list-view-pf-description">' +
        '<div class="list-group-item-text">' +
        '<b>We have no recommendations for you.</b> Your stack looks great!' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
      $j('#recommenderListView').append(strToAdd);
    }

    if (stackAnalysesData.hasOwnProperty('result') && stackAnalysesData.result.length > 0) {
      var result = stackAnalysesData.result[0];
      if (result.hasOwnProperty('components')) {
        var components = result.components;
        buildDependenciesUI(components);
      }
    }

    if (stackAnalysesData.hasOwnProperty('result') && stackAnalysesData.result[0].hasOwnProperty('distinct_licenses')
      && stackAnalysesData.result[0].distinct_licenses.length > 0) {
      buildLicenceList(stackAnalysesData.result[0].distinct_licenses);
    }

    if (stackAnalysesData.hasOwnProperty('result') && stackAnalysesData.result[0].hasOwnProperty('components')
      && stackAnalysesData.result[0].distinct_licenses.length > 0) {
      formOverviewLayout(stackAnalysesData.result[0].components);
    }

  }
}

function setRecommendations(similarStack) {
  if (similarStack) {
    const analysis = similarStack.analysis;
    var missing = analysis.missing_packages;
    var version = analysis.version_mismatch;
    var recommendations = [];
    var stack_name = similarStack.stack_name || "An existing stack";
    for (var i in missing) {
      if (missing.hasOwnProperty(i)) {
        var key = Object.keys(missing[i]);
        var value;
        recommendations.push({
          suggestion: 'Recommended',
          action: 'Add',
          message: key[0] + ' ' + missing[i][key[0]],
          subMessage: stack_name + " has this dependency included"
        });
      }
    }
  }

  for (var i in version) {
    if (version.hasOwnProperty(i)) {
      var key = Object.keys(version[i]);
      var value;
      recommendations.push({
        suggestion: 'Recommended',
        action: 'Upgrade',
        message: key[0] + ' ' + version[i][key[0]],
        subMessage: stack_name + " has differnt version of dependency"
      });
    }
  }
  constructRecommenderUI(recommendations)
}

function constructRecommenderUI(recommendations) {
  $j('#recommenderListView').html('');
  for (var i in recommendations) {
    var strToAdd = '<div class="list-group-item list-view-pf-stacked recommendation-group-item recommendation-list">' +
      '<div class="list-view-pf-main-info">' +
      '<div class="list-view-pf-left">' +
      '<img src="/static/bayesian/icons/269-info.svg"></img>' +
      '</div>' +
      '<div class="list-view-pf-body">' +
      '<div class="list-view-pf-description">' +
      '<div class="list-group-item-text">' +
      '<span class="main-text-info">' + recommendations[i].suggestion + '-' + recommendations[i].action + '-' + recommendations[i].message + '</span>' +
      '<span class="addtional-info">&nbsp;' + recommendations[i].subMessage + '</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
    $j('#recommenderListView').append(strToAdd);
  }
}


// ***************** dependencies *********************** //

var cvssScale = {
    low: {
      start: 0.0,
      end: 3.9,
      iconClass: 'warningCVE',
      displayClass: 'progress-bar-warning'
    },
    medium: {
      start: 4.0,
      end: 6.9,
      iconClass: 'warningCVE',
      displayClass: 'progress-bar-warning'
    },
    high: {
      start: 7.0,
      end: 10.0,
      iconClass: 'dangerCVE',
      displayClass: 'progress-bar-danger'
    }
  };

   var keys = {
    name: 'name',
    currentVersion: 'curVersion',
    latestVersion: 'latestVersion',
    cveid: 'cveid',
    cvss: 'cvss',
    license: 'license',
    linesOfCode: 'linesOfCode',
    avgCycloComplexity: 'avgCycloComplexity',
    noOfFiles: 'noOfFiles',
    dateAdded: 'dateAdded',
    publicPopularity: 'pubPopularity',
    enterpriseUsage: 'enterpriseUsage',
    teamUsage: 'teamUsage'
  };

  var headers = [
    {
      name: 'Name',
      identifier: this.keys['name'],
      isSortable: true
    }, {
      name: 'Current Version',
      identifier: this.keys['currentVersion'],
      isSortable: true
    }, {
      name: 'Latest Version',
      identifier: this.keys['latestVersion']
    }, {
      name: 'CVE ID',
      identifier: this.keys['cveid']
    }, {
      name: 'CVSS',
      identifier: this.keys['cvss']
    }, {
      name: 'License',
      identifier: this.keys['license']
    }, {
      name: 'Lines Of Code',
      identifier: this.keys['linesOfCode'],
      isSortable: true
    }, {
      name: 'Avgerage Cyclomatic Complexity',
      identifier: this.keys['avgCycloComplexity']
    }, {
      name: 'Total Files',
      identifier: this.keys['noOfFiles'],
      isSortable: true
    }
  ];

function getCvssObj(score) {
  if (score) {
    var iconClass = cvssScale.medium.iconClass;
    var displayClass = cvssScale.medium.displayClass;
    if (score >= cvssScale.high.start) {
      iconClass = cvssScale.high.iconClass;
      displayClass = cvssScale.high.displayClass;
    }
    return {
      iconClass: iconClass,
      displayClass: displayClass,
      value: score,
      percentScore: (score / 10 * 100)
    };
  }
}

function getCveId(security) {
  if (security && security.vulnerabilities && security.vulnerabilities[0].id) {
    return security.vulnerabilities[0].id;
  } else {
    return 'NA';
  }
}

function getCvssString(security) {
  if (security && security.vulnerabilities && security.vulnerabilities[0].cvss) {
    var cvssValue = parseFloat(security.vulnerabilities[0].cvss);
    return getCvssObj(cvssValue);
  } else {
    return {
      value: 'NA'
    };
  }
}

function buildDependenciesUI(dependencies) {
  var length = dependencies.length;
  var dependencyTable = $j('#dependenciesTable');
  var tableHeader = dependencyTable.find('thead');
  var tableBody = dependencyTable.find('tbody');
  var dependenciesList = [];
  var dependency, eachOne;
  $j(tableBody).empty();
  $j(tableHeader).empty();
  for (var i = 0; i < length; ++i) {
    dependency = {};
    eachOne = dependencies[i];
    var cycloMaticValue = eachOne['code_metrics']['average_cyclomatic_complexity'];
    dependency[keys['name']] = eachOne['name'];
    dependency[keys['currentVersion']] = eachOne['version'];
    dependency[keys['latestVersion']] = eachOne['latest_version'] || 'NA';
    dependency[keys['cveid']] = getCveId(eachOne['security']);
    dependency[keys['cvss']] = getCvssString(eachOne['security']);
    dependency[keys['license']] = eachOne['licenses'];
    dependency[keys['linesOfCode']] = eachOne['code_metrics']['code_lines'];

    dependency[keys['avgCycloComplexity']]
      = cycloMaticValue !== -1 ? cycloMaticValue : 'NA';
    dependency[keys['noOfFiles']] = eachOne['code_metrics']['total_files'];
    dependenciesList.push(dependency);
  }

  dependencies = {
    headers: headers,
    list: dependenciesList
  };
  var headerRow = $j('<tr />').appendTo(tableHeader);
  var strCvss = '';
  $j.map(dependencies.headers, (key, value) => {
    $j('<th>' + key.name + '</th>').appendTo(headerRow);
  });
  $j.map(dependencies.list, (key, value) => {
    var bodyRow = $j('<tr />').appendTo(tableBody);
    bodyRow.append('<td>' + key.name + '</td>');
    bodyRow.append('<td>' + key.curVersion + '</td>');
    bodyRow.append('<td>' + key.latestVersion + '</td>');

    bodyRow.append('<td>' + key.cveid + '</td>');
    if (key.cvss.value !== 'NA') {
      strCvss = '<td><span data-toggle="tooltip" data-placement="top">' +
        '<img class="dependencies-cve-icon" src="/static/bayesian/icons/' + key.cvss.iconClass + '.png"></img>' +
        key.cvss.value
        + '</span></td>';
    } else {
      strCvss = '<td><span>' +
        key.cvss.value
        + '</span></td>';
    }

    bodyRow.append(strCvss);
    bodyRow.append('<td>' + key.license + '</td>');
    bodyRow.append('<td>' + key.linesOfCode + '</td>');
    bodyRow.append('<td>' + key.avgCycloComplexity + '</td>');
    bodyRow.append('<td>' + key.noOfFiles + '</td>');

  });
}

// ***************** Overview *********************** //

function formOverviewLayout(compData) {
  var compAnalysesCVE = [], codelineSum = 0, totalFileSum = 0,
    cyclomaticComplexitySum = 0, cyclomaticComplexityAvg = 0,
    licenseList = [], columnData = [];
  var cvssObj = {
    id: '',
    value: -1 // -1 to say that no package is vulnerable
  };
  for (var i = 0; i < compData.length; i++) {
    if (compData[i].hasOwnProperty('code_metrics') && compData[i].code_metrics.hasOwnProperty('average_cyclomatic_complexity')) {
      codelineSum += compData[i].code_metrics.code_lines;
      totalFileSum += compData[i].code_metrics.total_files;
      cyclomaticComplexitySum += compData[i].code_metrics.average_cyclomatic_complexity
    }
    var dependencyObj = {}, dependencyArr = [];
    dependencyObj.icon = "dependency";
    dependencyObj.value = compData.length;
    dependencyObj.alias = "Declared dependencies";
    dependencyArr.push(dependencyObj);
    buildCardStackTemplate(dependencyArr, "dependencies-card-contents", 12);
    licenseList = licenseList.concat(compData[i].licenses);

    if (compData[i].security && compData[i].security.vulnerabilities && compData[i].security.vulnerabilities[0].cvss) {
      var value = parseFloat(compData[i].security.vulnerabilities[0].cvss);
      if (value > cvssObj.value) {
        cvssObj.value = value;
        cvssObj.id = compData[i].security.vulnerabilities[0].id;
      }
    }
  }

  buildSecurity(cvssObj);

  var licenseMap = _.groupBy(licenseList, function (value) {
    return value;
  });

  for (let key in licenseMap) {
    if (licenseMap.hasOwnProperty(key)) {
      let temp = [];
      temp.push(key);
      temp.push(licenseMap[key].length);
      columnData.push(temp);
    }
  }
  setLicenceDonut(columnData)

  var codeMetricObj = {}, codeMetricArr = [];
  codeMetricObj.icon = "linesOfCode";
  codeMetricObj.value = codelineSum;
  codeMetricObj.alias = "lines of code";
  codeMetricArr.push(codeMetricObj);
  codeMetricObj = {}
  codeMetricObj.icon = "cyclomatic";
  codeMetricObj.value = (cyclomaticComplexitySum / compData.length) < 0 ? "NA" : (cyclomaticComplexitySum / compData.length).toFixed(2);
  codeMetricObj.alias = "Avg. cyclomatic complexity";
  codeMetricArr.push(codeMetricObj);
  codeMetricObj = {}
  codeMetricObj.icon = "totalFiles";
  codeMetricObj.value = totalFileSum;
  codeMetricObj.alias = "Total files";
  codeMetricArr.push(codeMetricObj);
  buildCardStackTemplate(codeMetricArr, "codemetric-card-contents", 4);
}

function buildSecurity(cvss) {
  if (cvss) {
    var securityInfo = {};
    var cvssValue = cvss.value;
    if (cvssValue < 0) {
      securityInfo.value = -1;
    } else if (cvssValue < 7.0) {
      securityInfo.value = cvssValue;
    } else {
      var cvssObj = cvssValue >= 0 ? getCvssObj(cvssValue) : null;
      securityInfo = cvssObj;
      securityInfo.id = cvss.id;
    }
    buildCveList(securityInfo);
  }
}

function buildCveList(securityInfo) {
  $j('#cve-card-contents').empty();
  if (securityInfo.value !== -1) {
    var strToAdd = '<div class="row">' +
      '<div class="col-sm-12"><br>' +
      '<div class="cvss-id">' + securityInfo.id +
      '<img class="security-icon" src="/static/bayesian/icons/' + securityInfo.iconClass + '.png"></img>' +
      '</div>' +
      '<div class="row cvss-data">' +
      '<div class="col-sm-12"><br>' +
      '<span class="cvss-score">' + securityInfo.value + '</span>' +
      '<span class="cvss-score-label"><span class="label-1"> CVSS</span> score</span>' +
      '<span class="cvss-indication"><b> ' + securityInfo.value + ' of 10</b> Total</span>' +
      '</div>' +
      '</div>' +
      '<br><div class="progress">' +
      '<div class="progress-bar ' + securityInfo.displayClass + '" role="progressbar" ' +
      '" style="width:' + securityInfo.percentScore + '%" ' +
      'title=' + securityInfo.value + '"cvss score">' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    $j('#cve-card-contents').append(strToAdd);
  } else {
    var strToAdd = '<div class="row make-center"><div class="col-md-12">' +
      '<div class="row f8-icon-size overview-code-metric-icon"><br>' +
      '<img class="overview-icon" src="/static/bayesian/icons/269-info.svg"></img>' +
      '</div><br>' +
      '<div class="row f8-chart-numeric">No CVE or CVSS data available' +
      '</div></div>' +
      '</div>';
    $j('#cve-card-contents').append(strToAdd);
  }
}

function buildLicenceList(compAnalysesLicences) {
  $j('#licence-card-contents').empty();
  for (var i in compAnalysesLicences) {
    var strToAdd = '<li class="list-group-item">' + compAnalysesLicences[i];
    $j('#licence-card-contents').append(strToAdd);
  }
}

function buildCardStackTemplate(cardDataSetSummary, cardcontentId, classGrid) {
  $j('#' + cardcontentId).empty();
  for (var i in cardDataSetSummary) {
    var strToAdd = '<div class="col-md-' + classGrid + '">' +
      '<div class="row f8-icon-size overview-code-metric-icon"><br>' +
      '<img class="overview-icon" src="/static/bayesian/icons/' + cardDataSetSummary[i].icon + '.png"></img>' +
      '</div>' +
      '<div class="row f8-chart-numeric">' +
      cardDataSetSummary[i].value +
      '</div>' +
      '<div class="row f8-chart-description">' +
      '<p>' + cardDataSetSummary[i].alias + '</p>' +
      '</div>' +
      '</div>';
    $j('#' + cardcontentId).append(strToAdd);
  }
}

/*
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

  if (typeof (stack_data.result[index].metadata) != "undefined") {
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
}*/


function render_request_list(project_name_param) {
  var first_project_request = [];
  $j(document).ready(function () {
    var apiHost = "${bayesian.api.server}";
    jQuery.ajax({
      url: apiHost + 'stack-analyses/by-origin/' + project_name_param,
      type: 'GET',
      success: function (data) {
        if (data.status == "success") {
          var html = "";
          var reqLen = data.results.length;
          var req = data.results[0];
          display_result(req.id, "", "");
        }
      }
    });
  });
}

/*
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

*/