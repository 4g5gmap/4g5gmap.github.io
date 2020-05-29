HOME = [52.516272, 13.377722]
// desity value based on two factors:
// protection: 100% green - 80% light green - 50 % yellow - 30 % orange, - 0% red

function getColor(d) {
    return d < 0 ? '#778899' : // gray -> no data
        d <= 0.5 ? '#7AC229' : // green
        d <= 1.0 ? '#9FC229' : // lightgreen
        d <= 4.0 ? '#C2BB29' : // yellow
        d <= 7.0 ? '#C28F29' : // orange
        '#C25A29'; // red
}

var color = [ 'rgba(249, 207, 0, 0.8)', //rgba(0, 0, 0, 0.2);
              'rgba(152, 75, 67, 0.8)',
              'rgba(6, 47, 79, 0.8)',
              'rgba(128, 128, 0, 0.8)',
              'rgba(144, 12, 63, 0.8)'
            ]

function randomColorisation(c){
    return color[c]
}

function scoreToText(s) {
    return s >= 7.0 ?  '<span style="color:#C25A29">(High)</span>' :
        s >= 4.0 ?  '<span style="color:#C28F29">(Medium)</span>' :
        s >= 0.1 ?  '<span style="color:#C2BB29">(Low)</span>' :
        '<span style="color:#7AC229">(None)</span>'
}

function initial_tab(){
    document.getElementById("OVERVIEW").style.display = "block";
    document.getElementById("overview").className += " active";
    document.getElementById("grOVERVIEW").style.display = "block";
    document.getElementById("grOVERVIEW").style.position = "relative";
}

function vulnToText(l) {
    var ret = "";
    l.forEach(function(v) {
        switch (v) {
            case 1:
                ret += "<li>Lack of randomness in TMSIs (4.0)</li>"
                break;
            case 2:
                ret += "<li>Paging with IMSIs (7.3)</li>"
                break;
            case 3:
                ret += "<li>Frequent IMSI request before authentication (7.3)</li>"
                break;
            case 4:
                ret += "<li>Null scheme for SUCI (7.3)</li>"
                break;
            case 5:
                ret += "<li>Unprotected measurement reports (6.5)</li>"
                break;
            case 6:
                ret += "<li>Lack of randomness in C-RNTIs (6.5)</li>"
                break;
            case 7:
                ret += "<li>Unfiltered silent SMS (7.2)</li>"
                break;
            case 8:
                ret += "<li>Using null encryption (control plane) (7.3)</li>"
                break;
            case 9:
                ret += "<li>Using null encryption (data plane) (7.3)</li>"
                break;
            case 10:
                ret += "<li>IPSec disabled for VoLTE (7.7)</li>"
                break;
            case 11:
                ret += "<li>IPSec disabled for VoWiFi (9.1)</li>"
                break;
            case 12:
                ret += "<li>V8 + V9 (9.1)</li>"
                break;
            case 13:
                ret += "<li>Retrieval of device capabilities (6.7)</li>"
                break;
            case 14:
                ret += "<li>No availablity of IMS services (fallback to 2G) (9.1)</li>"
                break;
            case 15:
                ret += "<li>No integrity protection (control plane) (8.0)</li>"
                break;
            case 16:
                ret += "<li>No integrity protection (data plane) (8.0)</li>"
                break;
            default:
                break;
        }
    });
    return ret;
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    // Show the current tab, and add an "active" class to the button that opened the tab
    parent = document.getElementById(tabName.slice(0,-2));
    child = document.getElementById(tabName.concat('2v').toLowerCase());
    document.getElementById(tabName).style.display = "block";
    if (parent) {
        parent.style.display = "block";
    }
    if (child) {
        document.getElementById(tabName.concat('ut')).style.display = "block";
        child.className += " active";
    }
    evt.currentTarget.className += " active";
}

var countryMarkers = new L.FeatureGroup();
var cellMarkers = new L.FeatureGroup();
var ltemap;

function makeMap(cells) {
    var TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    var MB_ATTR = 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, Location information from <a href="https://opencellid.org">OpenCellID</a>';
    var ltemap = L.map('llmap').setView([HOME[0],HOME[1]], 5);
    L.tileLayer(TILE_URL, { attribution: MB_ATTR, maxZoom: 17, minZoom: 3 }).addTo(ltemap);
    legend(ltemap)
    $.getJSON("static/countries.geojson",function(data){ // load GeoJSON from external file
        L.geoJson(data, {
            style: function(feature) {
                for (var i = 0; i < cells.length; i++) {
                    if(cells[i][0] && feature.properties.ADMIN.includes(cells[i][0])){
                        feature.properties.density = cells[i][1]
                        return {
                            fillColor: getColor(feature.properties.density),
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            dashArray: '3',
                            fillOpacity: 0.8
                        };
                    }
                }
                return {
                    fillColor: getColor(-1),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.8
                };
            },
            // cells[0] = Country name
            // cells[1] = total score for coloring
            // cells[2] = List of operators
            // cells[2][0] = Operator name
            // cells[2][1] = List of score vector
            // cells[2][1][0] = year
            // cells[2][1][1] = total
            // cells[2][1][2] = UT
            // cells[2][1][3] = IN
            // cells[2][1][4] = DG
            // cells[2][1][5] = IMP
            // cells[2][2][1] = UT vuln list
            // cells[2][2][2] = IN vuln list
            // cells[2][2][3] = DG vuln list
            // cells[2][2][4] = IMP vuln list
            onEachFeature: function(feature, layer) {
                layer.on({
                    click: function(e){
                        for (var i = 0; i < cells.length; i++) {
                            if (cells[i][0] && feature.properties.ADMIN.includes(cells[i][0])) {
                                var content =
                                    $(`<div>
                          <div class="header">
                            <a href="#"><img src="static/img/pie.png" height="29" width="29" /></a>
                            <h2>&nbsp;` + feature.properties.ADMIN + `</h2>
                          </div>
                          <div class="tab">
                            <button class="tablinks" id="overview" onclick="openTab(event, 'OVERVIEW')">Overview</button>
                            <button class="tablinks" onclick="openTab(event, 'DETAILS')">Score Details</button>
                            <button class="tablinks" onclick="openTab(event, 'DOWNLOAD')">Download Configuration</button>
                          </div>

                          <div id="OVERVIEW" class="tabcontent">
                          <h3>How Secure Is My Network?</h3>
                          <!--
                          <ul>
                          <li><span style="font-size: 130%"><span style="color: #c2bb29; font-weight: bold">B</span> Telekom Deutschland GmbH</span><br/><span style="font-size: 110%">User Tracking: <span style="color: #c2bb29; font-weight: bold">B</span>, Interception: <span style="color: #c2bb29; font-weight: bold">B</span><br/>Downgrading: <span style="color: #c28f29; font-weight: bold">C</span>, Impersonation: <span style="color: #7ac229; font-weight: bold">A</span></span></li>
                          <li><span style="font-size: 130%"><span style="color: #c2bb29; font-weight: bold"">B</span> Vodafone D2 GmbH</span><br/><span style="font-size: 110%">User Tracking: <span style="color: #c2bb29; font-weight: bold">B</span>, Interception: <span style="color: #7ac229; font-weight: bold">A</span><br/>Downgrading: <span style="color: #c28f29; font-weight: bold">C</span>, Impersonation: <span style="color: #7ac229; font-weight: bold">A</span></span></li>
                          <li><span style="font-size: 130%"><span style="color: #c2bb29; font-weight: bold"">B</span> E-Plus Mobilfunk GmbH & Co. KG</span><br/><span style="font-size: 110%">User Tracking: <span style="color: #c28f29; font-weight: bold">C</span>, Interception: <span style="color: #c2bb29; font-weight: bold">B</span><br/>Downgrading: <span style="color: #7ac229; font-weight: bold">A</span>, Impersonation: <span style="color: #7ac229; font-weight: bold">A</span></span></li>
                          <li><span style="font-size: 130%"><span style="color: #7ac229; font-weight: bold"">A</span> Telefonica Germany GmbH & Co. oHG</span><br/><span style="font-size: 110%">User Tracking: <span style="color: #c2bb29; font-weight: bold">B</span>, Interception: <span style="color: #7ac229; font-weight: bold"">A</span><br/>Downgrading: <span style="color: #7ac229; font-weight: bold">A</span>, Impersonation: <span style="color: #7ac229; font-weight: bold">A</span></span></li>
                          <li>As of: 2019</li>
                          </ul>
                          -->
                          <canvas id="grOVERVIEW" style="width: 450px; height: 250px"></canvas>
                          </div>

                          <div id="DETAILS" class="tabcontent">
                            <div class="tab">
                              <button class="tablinks" id="details2v" onclick="openTab(event, 'DETAILSut')">User Tracking</button>
                              <button class="tablinks" id="details3v" onclick="openTab(event, 'DETAILSin')">Interception</button>
                              <button class="tablinks" id="details4v" onclick="openTab(event, 'DETAILSdg')">Downgrading</button>
                              <button class="tablinks" id="details5v" onclick="openTab(event, 'DETAILSip')">Impersonation</button>
                            </div>
                          </div>
              <div id="DETAILSut" class="tabcontent">
                  <div style="width: 250px; height: 250px; float: left"><h3>User Tracking</h3><canvas id="ovutChart" style="width: 250px; position: relative; height: 250px;"></canvas></div>
                  <div style="width: 200px; float: left"><h3>Vulnerabilities</h3><ul id="listUt">` + vulnToText(cells[i][3][0]) +`</ul></div>
              </div>
              <div id="DETAILSin" class="tabcontent">
                  <div style="width: 250px; height: 250px; float: left"><h3>Interception</h3><canvas id="ovintChart" style="width: 250px; position: relative; height: 250px;"></canvas></div>
                  <div style="width: 200px; float: left"><h3>Vulnerabilities</h3><ul id="listIn">` + vulnToText(cells[i][3][1]) + `</ul></div>
              </div>
              <div id="DETAILSdg" class="tabcontent">
                  <div style="width: 250px; height: 250px; float: left"><h3>Downgrading</h3><canvas id="ovdgChart" style="width: 250px; position: relative; height: 250px;"></canvas></div>
                  <div style="width: 200px; float: left"><h3>Vulnerabilities</h3><ul id="listDg">` + vulnToText(cells[i][3][2]) + `</ul></div>
              </div>
              <div id="DETAILSip" class="tabcontent">
                  <div style="width: 250px; height: 250px; float: left"><h3>Impersonation</h3><canvas id="ovimpChart" style="width: 250px; position: relative; height: 250px;"></canvas></div>
                  <div style="width: 200px; float: left"><h3>Vulnerabilities</h3><ul id="listIp">` + vulnToText(cells[i][3][3]) + `</ul></div>
              </div>

                  <div id="DOWNLOAD" class="tabcontent"><h3>Configuration Download</h3><p>Currently not available, please visit this section later.</p></div>
                      </div>`)[0];

                                layer.bindPopup(content, {maxWidth: 500});
                                layer.openPopup();
                                initial_tab();

                                var ut_chart = document.getElementById('grOVERVIEW').getContext('2d');
                                generate_chart_bar(ut_chart, cells[i][2], "2019")

                                ut_chart = document.getElementById("ovutChart").getContext('2d');
                                generate_chart(ut_chart, cells[i][2], 2);
                                ut_chart = document.getElementById("ovintChart").getContext('2d');
                                generate_chart(ut_chart, cells[i][2], 3);
                                ut_chart = document.getElementById("ovdgChart").getContext('2d');
                                generate_chart(ut_chart, cells[i][2], 4);
                                ut_chart = document.getElementById("ovimpChart").getContext('2d');
                                generate_chart(ut_chart, cells[i][2], 5);

                            }
                        }
                    }
                });
            }
        }).addTo(countryMarkers);
    });

    basestations.forEach(function(item) {
        // item[0] = Coords
        // item[1] = Cell identification, item[2] = Vulnerability scores snapshot, item[3] = Timeline of overall scores
        // item[4] = Score-UT, item[5] = Vuln-UT
        // item[6] = Score-IN, item[7] = Vuln-IN
        // item[8] = Score-DG, item[9] = Vuln-DG
        // item[10] = Score-IMP, item[11] = Vuln-IMP
        // item[12] = Score for colorization
        var m = L.marker([item[0][1], item[0][0]]).addTo(cellMarkers);
        var c = L.circle([item[0][1], item[0][0]], {color: getColor(item[12]), radius: 200}).addTo(cellMarkers);
        m.on('click', function(e) {
            var content = 
                $(`<div>
              <div class="header">
                  <a href="#"><img src="static/img/pie.png" height="29" width="29" /></a>
                  <h2>&nbsp;Cell Details</h2>
              </div>
              <div class="tab">
                <button class="tablinks" id="overview" onclick="openTab(event, 'OVERVIEW')">Overview</button>
                <button class="tablinks" onclick="openTab(event, 'DETAILS')">Score Details</button>
                <button class="tablinks" onclick="openTab(event, 'DOWNLOAD')">Download Configuration</button>
              </div>

              <div id="OVERVIEW" class="tabcontent">
                  <div style="width: 50%; float: left;">
                      <h3>Cell Information</h3>
                      <ul>
                      <li>Generation: ` + item[1][0] + `</li>
                      <li>MCC/MNC: ` + item[1][1] + `/` + item[1][2] + ` (` + item[1][3] + `/` + item[1][4] + `)</li>
                      <li>Cell ID: ` + item[1][5] + `</li>
                      <li>Tracking Area Code: ` + item[1][6] + `</li>
                      </ul>
                  </div>
                  <div style="width: 50%; float: left;">
                      <h3>Vulnerability Scores</h3>
                      <ul>
                      <li>User Tracking: ` + item[2][0] + ` ` + scoreToText(item[2][0]) + `</li>
                      <li>Interception: ` + item[2][1] + ` ` + scoreToText(item[2][1]) + `</li>
                      <li>Downgrading: ` + item[2][2] + ` ` + scoreToText(item[2][2]) + `</li>
                      <li>Impersonation: ` + item[2][3] + ` ` + scoreToText(item[2][3]) + `</li>
                      <li>Total: ` + item[2][4] + ` ` + scoreToText(item[2][4]) + `</li>
                      </ul>
                  </div>
                  <h3>Timeline of Scores</h3>
                  <div><canvas id="grOVERVIEW" style="width: 450px; height: 150px;"></canvas></div>
                  <p>Click on "Score Details" tab for more information.</p>
              </div>
              <div id="DETAILS" class="tabcontent">
                <div class="tab">
                  <button class="tablinks" id="details2v" onclick="openTab(event, 'DETAILSut')">User Tracking</button>
                  <button class="tablinks" id="details3v" onclick="openTab(event, 'DETAILSin')">Interception</button>
                  <button class="tablinks" id="details4v" onclick="openTab(event, 'DETAILSdg')">Downgrading</button>
                  <button class="tablinks" id="details5v" onclick="openTab(event, 'DETAILSip')">Impersonation</button>
                </div>
              </div>
              <div id="DETAILSut" class="tabcontent">
                  <div style="width: 250px; float: left"><h3>User Tracking</h3><canvas id="ovutChart" style="width: 250px; position: relative"></canvas></div>
                  <div style="width: 200px; float: left"><h3>Vulnerabilities</h3><ul id="listUt">` + vulnToText(item[5]) +`</ul></div>
              </div>
              <div id="DETAILSin" class="tabcontent">
                  <div style="width: 250px; float: left"><h3>Interception</h3><canvas id="ovintChart" style="width: 250px; position: relative"></canvas></div>
                  <div style="width: 200px; float: left"><h3>Vulnerabilities</h3><ul id="listIn">` + vulnToText(item[7]) + `</ul></div>
              </div>
              <div id="DETAILSdg" class="tabcontent">
                  <div style="width: 250px; float: left"><h3>Downgrading</h3><canvas id="ovdgChart" style="width: 250px; position: relative"></canvas></div>
                  <div style="width: 200px; float: left"><h3>Vulnerabilities</h3><ul id="listDg">` + vulnToText(item[9]) + `</ul></div>
              </div>
              <div id="DETAILSip" class="tabcontent">
                  <div style="width: 250px; float: left"><h3>Impersonation</h3><canvas id="ovimpChart" style="width: 250px; position: relative"></canvas></div>
                  <div style="width: 200px; float: left"><h3>Vulnerabilities</h3><ul id="listIp">` + vulnToText(item[11]) + `</ul></div>
              </div>

              <div id="DOWNLOAD" class="tabcontent"><h3>Configuration Download</h3><p>Currently not available, please visit this section later.</p></div>
          </div>`)[0];
            m.bindPopup(content, {maxWidth: 500});
            m.openPopup();
            initial_tab();

            var cv_chart = document.getElementById("grOVERVIEW").getContext('2d');
            generate_chart_single(cv_chart, item[1][4] + '/Cell ' + item[1][5], item[3]);

            cv_chart = document.getElementById("ovutChart").getContext('2d');
            generate_chart_single(cv_chart, item[1][4] + '/Cell ' + item[1][5], item[4]);
            cv_chart = document.getElementById("ovintChart").getContext('2d');
            generate_chart_single(cv_chart, item[1][4] + '/Cell ' + item[1][5], item[6]);
            cv_chart = document.getElementById("ovdgChart").getContext('2d');
            generate_chart_single(cv_chart, item[1][4] + '/Cell ' + item[1][5], item[8]);
            cv_chart = document.getElementById("ovimpChart").getContext('2d');
            generate_chart_single(cv_chart, item[1][4] + '/Cell ' + item[1][5], item[10]);
        });
    });

    var detailMode;

    ltemap.on('zoomend', function (e) {
        if (ltemap.getZoom() > 6) {
            if (!detailMode) {
                ltemap.removeLayer(countryMarkers);
                ltemap.addLayer(cellMarkers);
            }
            detailMode = true;
        } else {
            if (detailMode) {
                ltemap.removeLayer(cellMarkers);
                ltemap.addLayer(countryMarkers);
            }
            detailMode = false;
        }
    });

    ltemap.addLayer(countryMarkers);

    var info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'help'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>4G5GMap Help</h4><ul><li>This version is intended for WPES 2021 review, not for public usage.</li><li>Best viewed with the latest version of Firefox.</li><li>Zoom in for more details for the following cities: Amsterdam, Berlin, Brussels, Las Vegas, London, Paris, Reykjavik, Riga, Tallinn, Wien</li><li>Click on a country and zoom into the city to find base stations and vulnerability scores.</li><li>Some operator\'s data are hidden due to responsible disclosure</li><li>The majority of the data comes from  4G networks. Since the data for 5G networks are limited in quantity and quality we are not displaying in this map at the moment.</li></ul>'
    };

    info.addTo(ltemap);
}

function generate_chart_single(ctx, title, data_array) {
    var datasets = [];
    datasets.push({
        fill: false,
        label: title,
        backgroundColor: randomColorisation(1),
        borderColor: randomColorisation(1),
        data: data_array,
    });

    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["2015", "2016", "2017", "2018", "2019"],
            datasets: datasets,
        }, options: {
            responsive: false,
            legend: {
                position: 'bottom',
            },
            scales: {
                yAxes: [{
                    ticks: {
                        stepSize: 2,  //begin always with 0
                        beginAtZero: true,
                        max : 10
                    }
                }]
            },
        }
    });
}

function generate_chart(ctx, mnos, position){
    var datasets = []
    for (var j = 0; j < mnos.length; j++) { //mnos
        data_array = [0,0,0,0,0]
        for (var k = 0; k < mnos[j].length; k++) {
            for (var l = 0; l < mnos[j][k].length; l++) {
                value = mnos[j][k][l][position]; //category per year
                year = mnos[j][k][l][0]; //years name
                if (year == "2015") {
                    data_array[0] = value
                }
                if (year == "2016") {
                    data_array[1] = value
                }
                if (year == "2017") {
                    data_array[2] = value
                }
                if (year == "2018") {
                    data_array[3] = value
                }
                if (year == "2019") {
                    data_array[4] = value
                }
            }
        }

        if (data_array.some(elem => elem > -1)){
            datasets.push({ //if no data is given for a mno (all zero array)
                fill: false,
                label:  mnos[j][0], //mno
                backgroundColor: randomColorisation(j),
                borderColor: randomColorisation(j),
                data: data_array, //UT/IN/IM/USIM of mno
            });
        }
    }


    if (datasets.length == 0) { //if no data is given in general
        datasets.push({
            fill: false,
            label:  "no data"
        });
    }

    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["2015", "2016", "2017", "2018", "2019"],
            datasets: datasets,
        }, options: {
            responsive: false,
            legend: {
                position: 'bottom',
            },
            scales: {
                yAxes: [{
                    ticks: {
                        stepSize: 2,  //begin always with 0
                        beginAtZero: true,
                        max : 10
                    }
                }]
            },
        }
    });
}

function generate_chart_bar(ctx, mnos, year_in){
    var datasets = []
    for (var j = 0; j < mnos.length; j++) { //mnos
        data_array = [0,0,0,0,0]
        for (var k = 0; k < mnos[j].length; k++) {
            for (var l = 0; l < mnos[j][k].length; l++) {
                //value = mnos[j][k][l][position]; //category per year
                year = mnos[j][k][l][0]; //years name
                if (year == year_in) {
                    data_array[0] = mnos[j][k][l][2];
                    data_array[1] = mnos[j][k][l][3];
                    data_array[2] = mnos[j][k][l][4];
                    data_array[3] = mnos[j][k][l][5];
                }
            }
        }

        if (data_array.some(elem => elem > -1)){
            datasets.push({ //if no data is given for a mno (all zero array)
                fill: false,
                label:  mnos[j][0], //mno
                backgroundColor: randomColorisation(j),
                borderColor: randomColorisation(j),
                data: data_array, //UT/IN/IM/USIM of mno
            });
        }
    }


    if (datasets.length == 0) { //if no data is given in general
        datasets.push({
            fill: false,
            label:  "no data"
        });
    }

    var chart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: ["Tracking Identity/Location", "Network Availability", "Voice/SMS Interception", "Data Interception"],
            datasets: datasets,
        }, options: {
            responsive: false,
            legend: {
                position: 'bottom',
            },
            scales: {
                xAxes: [{
                    ticks: {
                        stepSize: 2,  //begin always with 0
                        beginAtZero: true,
                        max : 10
                    }
                }]
            },
        }
    });
}

function legend(ltemap){
    var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (ltemap) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0.1, 0.9, 3.9, 6.9, 10],
            levels = ["Low", "", "Medium", "", "High"],
            labels = [];
        div.innerHTML += "<b>Score</b><br />"
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i]) + '"></i> ' + levels[i] + '<br>';
        }
        return div;
    };
    legend.addTo(ltemap);
}

$(function() {
    makeMap(cells, basestations);
})

