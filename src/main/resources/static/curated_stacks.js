var requested_stack;
var pager_stack_id = 0;
var requested_stack_dependencies = [];


function get_stack_analysis(stack_analysis_id) {
  $j(document).ready(function () {
    var apiHost = "${bayesian.api.server}";

    jQuery.ajax({
      url: apiHost + '/stack-analyses/' + stack_analysis_id,
      type: 'GET',
      error: function (xhr, ajaxOptions, thrownError) {
        var msg = JSON.parse(xhr.responseText);
        document.getElementById("comparisonDetail").innerHTML = "<div class=''>Error: " + msg.error + " </div>";
        document.getElementById("comparisonDetail").style.display = 'block';
      },
      success: function (data, textStatus, xhr) {
        var status = xhr.status;
        var msg = JSON.parse(xhr.responseText);

        if (status == 202) { // Receives an Accept but not Done yet
          document.getElementById("comparisonDetail").innerHTML = "<div class=''>" + msg.error + "</div>";
          document.getElementById("comparisonDetail").style.display = 'block';
          return;
        }
        requested_stack = data;
        try {
        render_referenced_stack(data);
        }
        catch(e) {
          document.getElementById("comparisonDetail").innerHTML = "<div class=''>" + "There was error processing recommendations API" + "</div>";
          document.getElementById("comparisonDetail").style.display = 'block';
          return;
        }
      }
    });
  });
}

function get_first_sucesfull_analysis(project_name) {
  $j(document).ready(function () {
  var apiHost = "${bayesian.api.server}";

  jQuery.ajax({
    url: apiHost + '/stack-analyses/by-origin/' + project_name,
    type: 'GET',
    error: function (xhr, ajaxOptions, thrownError) {
      var msg = JSON.parse(xhr.responseText);
      document.getElementById("comparisonDetail").innerHTML = "<div class=''>Error: " + msg.error + " </div>";
      document.getElementById("comparisonDetail").style.display = 'block';
    },
    success: function (data, textStatus, xhr) {
      var status = xhr.status;
      var msg = JSON.parse(xhr.responseText);

      if (status == 202) { // Receives an Accept but not Done yet
        document.getElementById("comparisonDetail").innerHTML = "<div class=''>" + msg.error + "</div>";
        document.getElementById("comparisonDetail").style.display = 'block';
        return;
      } else {
        var result = "";
        var reqLen = data.results.length;
        for (var i = 0, j = 0; i < reqLen; i++) {

          var req = data.results[i];

          try {
            var requestJson = JSON.parse(data.results[i].requestJson);
            requestJson = JSON.parse(requestJson.manifest[0].content);
            j++;
            if (j == 1) result = req.id;
          }
          catch (e) {
            continue;
          }
        }
        get_stack_analysis(result);
      }
    }
  });
  });
}

function render_referenced_stack(stack, stack_id = 0) {
  var recommendations = stack.result[0].recommendation.recommendations;
  var components = stack.result[0].components;

  dependencies = [];
  for (var component in components) {
    dependencies.push({ name: components[component].name, version: components[component].version });
  }
  dependencies = sort_packages_by_name(dependencies);
  requested_stack_dependencies = dependencies
  buildHtmlTable(dependencies, '#referencedStack', "Your Stack");
  render_number_of_simmilar_stacks(recommendations);
  render_similarity_score(recommendations);
  render_reference_stack(recommendations, pager_stack_id);
}

function render_number_of_simmilar_stacks(recommendation) {
  document.getElementById("number_of_reference_stacks").innerHTML = recommendation.similar_stacks.length;
}

function get_missing_packages(recommendation, stack_id = 0) {
  var missing_packages = recommendation.similar_stacks[pager_stack_id].analysis.missing_packages;
  result = [];
  for (var missing_package in missing_packages) {
    result.push({ name: missing_packages[missing_package] });
  }
  return result;
}

function get_version_mismatch(recommendation, stack_id = 0) {
  var version_mismatch = recommendation.similar_stacks[pager_stack_id].analysis.version_mismatch;
  result = [];
  for (var package in version_mismatch) {
    result.push({ name: version_mismatch[package] });
  }
  return result;
}


function render_reference_stack(recommendation, stack_id = 0) {
  // list of missing packages from referenced stack is used here
  var abdurdant_packages = get_missing_packages(recommendation);
  var version_mismatch = get_version_mismatch(recommendation);
  get_reference_stack(recommendation.similar_stacks[stack_id].uri, abdurdant_packages, version_mismatch);
}

function get_reference_stack(uri, abdurdant_packages, version_mismatch) {
  var result = [];
  var deps_not_in_reference_stack = [];
  var recommendations = [];
  jQuery.ajax({
    url: uri,
    type: 'GET',
    error: function (xhr, ajaxOptions, thrownError) {
      var msg = JSON.parse(xhr.statusText);
      document.getElementById("comparisonDetail").innerHTML = "<div class=''>Error: " + msg.error + " </div>";
      document.getElementById("comparisonDetail").style.display = 'block';
    },
    success: function (data, textStatus, xhr) {
      document.getElementById("referenceStackName").innerHTML = data.application_name + " " + data.application_version;
      for (var package in data.dependencies) {

        if (abdurdant_packages.map(function (e) { return e.name; }).indexOf(data.dependencies[package].package_name) == -1) {
          if (version_mismatch.map(function (e) { return e.name; }).indexOf(data.dependencies[package].package_name) == -1) {
            result.push({ name: data.dependencies[package].package_name, version: data.dependencies[package].version_spec.spec, action: " - " });
          }else {
            result.push({ name: data.dependencies[package].package_name, version: data.dependencies[package].version_spec.spec, action: "Change" });
          }
        }else if (abdurdant_packages.length > 0){
          deps_not_in_reference_stack.push({ name: data.dependencies[package].package_name, version: data.dependencies[package].version_spec.spec, action: "Add" });
        }
      }

      result = sort_packages_by_name(result);
      for (package in requested_stack_dependencies){
        if (result.map(function (e) { return e.name; }).indexOf(requested_stack_dependencies[package].name) == -1){
          result.splice(package, 0, {name: "-", version: "-", action: "-"});
        }
      }
      result = result.concat(deps_not_in_reference_stack);
      buildHtmlTable(result.map(function (e) { return { name: e.name, version: e.version }; }), '#ReferenceStackTable');
      buildHtmlTable(result.map(function (e) { return { action: e.action }; }), '#RecommandationsTable');
    }
  });
}

function render_similarity_score(recommendation, stack_id = 0) {
  var similarity_score = recommendation.similar_stacks[pager_stack_id].similarity * 100;
  document.getElementById("similarity_score").innerHTML = similarity_score.toFixed(2);
}

function sort_packages_by_name(depList) {
  depList.sort(function (a, b) {
    return (a.name > b.name) - (a.name < b.name);
  });
  return depList;
}

function nav_next_reference_stack() {
  pager_stack_id = pager_stack_id + 1;
  render_referenced_stack(requested_stack, pager_stack_id);
}

function nav_prev_reference_stack() {
  pager_stack_id = pager_stack_id - 1;
  if (pager_stack_id < 0) {
    return;
  } else {
    render_referenced_stack(requested_stack, pager_stack_id);
  }
}

function buildHtmlTable(myList, selector, caption = "", show_column_header = true) {
  //reset table to default empty state
  document.getElementById(selector.slice(1)).innerHTML = "<caption>"+ caption +"</caption>";

  var columns = addAllColumnHeaders(myList, selector, show_column_header);

  for (var i = 0; i < myList.length; i++) {
    var row$ = $j('<tr/>');
    for (var colIndex = 0; colIndex < columns.length; colIndex++) {
      var cellValue = myList[i][columns[colIndex]];

      if (cellValue === null) { cellValue = ""; }

      row$.append($j('<td/>').html(cellValue));
    }
    $j(selector).append(row$);
  }
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records
function addAllColumnHeaders(myList, selector, show_column_header = true) {
  var columnSet = [];
  var headerTr$ = $j('<tr/>');

  for (var i = 0; i < myList.length; i++) {
    var rowHash = myList[i];
    for (var key in rowHash) {
      if ($j.inArray(key, columnSet) == -1) {
        columnSet.push(key);
        if (show_column_header === true) {
          headerTr$.append($j('<th/>').html(key));
        }
      }
    }
  }
  $j(selector).append(headerTr$);
  return columnSet;
}
