function makeDoughnut(ctx, labels, data){
  if (data[0] == 0) { //if all zero in given array, than no data
      color = ["#D3D3D3"]
      data = [100] //set full grey dougnut
      labels = ['No Data']
  } else {
    color = ["#0B6623", "#7C0A02"]
  }
  makeChart(ctx, 'doughnut', labels, data, color)
 }

function makePie(ctx, labels, data){
  if (data.every(elem => elem == 0)) { //no data given
      color = ["#D3D3D3"]
      data = [100] //set full grey pie
      labels = ['No Data']
  } else {
    color = ['#44B3C2', '#F1A94E', '#E45641', '#5D4C46', '#7B8D8E', '#F2EDD8']
  }
  makeChart(ctx, 'pie', labels, data, color)
}



function makeChart(ctx, type, labels, data, color){
  new Chart(ctx, {
  type: type,
  data: {
    labels: labels,
    datasets: [
      {
        backgroundColor: color,
        data: data
      }
    ]
  },
  options: {
    legend: {
        display: false
    },
  }
});
}

function makeBarChart(ctx, labels, data, color){
  new Chart(ctx, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [
      {
        backgroundColor: color,
        data: data
      }
    ]
  },
  options: {
    legend: {
        display: false
    },
    scales: {
      yAxes: [{
        ticks: {
          max: 10,  //begin always with 0
          beginAtZero: true
        }
      }]
    },
  }
});
}

function statsCreate(){
  var div = document.getElementById('stat_div');
  var table = document.createElement('table');
  table.classList.add('table');
  var thead = document.createElement('thead');
  var tr = document.createElement('tr');
  tr.id = "stats_head"
  thead.appendChild(tr)
  var tbody = document.createElement('tbody');
  var tr = document.createElement('tr');
  tr.id = "stats_body"
  tbody.appendChild(tr)
  table.appendChild(thead);
  table.appendChild(tbody);
  div.appendChild(table)
}

function statsAdd(mno, year, data){
  //var div = document.getElementById('stat_div');
  //div.classList.add('col-md-12');
  var trhead = document.getElementById('stats_head');
  var trbody = document.getElementById('stats_body');

  var th = document.createElement('th');
  th.appendChild(document.createTextNode(year + " : " + mno));
  trhead.appendChild(th)
  var td = document.createElement('td');
  td.classList.add('row-md-1')
  //td.width  = "80px";
  td.height = "100px";
  var can = document.createElement('canvas');
  can.width  = "80px";
  can.height = "100px";
  td.appendChild(can);
  if (data.every(elem => elem == 0)) { //no data given
      color = ["#D3D3D3"]
      data = [0] //set full grey pie
      labels = ['No Data']
  } else {
    color = ['#44B3C2', '#F1A94E', '#E45641', '#5D4C46', '#7B8D8E', '#F2EDD8']
  }
  makeBarChart(can, ["Areas", "Cells"], data, color)
  trbody.appendChild(td)
}



function addCountry(countryname) {
  var country = document.getElementById("country");
  var text = document.createElement("b");
  text.innerHTML = countryname;
  country.appendChild(text)
  }


function inTableCreate(gen){
  category = gen == 'GSM'? gen + " Interception & USIM prevalence" : gen +  " Interception"
  headers = [category, "Year", "EAs", "IAs", "EAs supported", "IAs supported", "UE capabilites replayed"]
  if (gen != 'LTE RRC'){
    headers.push("RRC Encryption")
  }
  createTable(gen + '_in_div', headers, gen +"_in_body")
}

function utTableCreate(gen){
  headers = [gen + " User Tracking", "Year", "TMSI Anonymization", "TMSI Mechanism", "Frequency Hopping"]
  createTable(gen + '_ut_div', headers, gen +"_ut_body")
}

function imTableCreate(gen){
  headers = [gen + " Impersonation", "Year", "Authenticated Calls", "Authenticated SMS"]
  createTable(gen + '_im_div', headers, gen +"_im_body")
}

function createTable(divname, headers, bodyname){
  var div = document.getElementById(divname);
  var table = document.createElement('table');
  table.classList.add('table');
  var thead = document.createElement('thead');
  var tr = document.createElement('tr');
  for (var i = 0; i < headers.length; i++) {
    var th = document.createElement('th');
    if (i == 0) {
      th.classList.add('col-md-3');
    } else {
      th.classList.add('col-md-1');
    }
    th.appendChild(document.createTextNode(headers[i]));
    tr.appendChild(th)
  }
  thead.appendChild(tr)
  var tbdy = document.createElement('tbody');
  tbdy.id = bodyname
  table.appendChild(thead);
  table.appendChild(tbdy);
  div.appendChild(table)
}

function imTableAdd(gen, mno_info) {
  var tbdy = document.getElementById(gen + '_im_body');
  var tr = document.createElement('tr');
  for (var j = 0; j < mno_info.length; j++) {
      var td = document.createElement('td');
      td.width  = "80px";
      td.height = "80px";
      td.style.textAlign='center';
      if (j >= 2) {
        var can = document.createElement('canvas');
        can.width  = "50px";
        can.height = "50px";
        td.appendChild(can);
        makeDoughnut(can, ["supported","not supported"], [mno_info[j], (100 - (mno_info[j]))]);
      } else {
          td.appendChild(document.createTextNode(mno_info[j]));
      }
      tr.appendChild(td)
  }
  tbdy.appendChild(tr);
}


function utTableAdd(gen, mno_info) {
  var tbdy = document.getElementById(gen + '_ut_body');
  var tr = document.createElement('tr');
  for (var j = 0; j < mno_info.length; j++) {
      var td = document.createElement('td');
      td.width  = "80px";
      td.height = "80px";
      td.style.textAlign='center';
      if (j >= 2) {
        var can = document.createElement('canvas');
        can.width  = "50px";
        can.height = "50px";
        td.appendChild(can);
        if (j == 3) {
         labels = mno_info[j].length == 0? ['No Data'] :["Block", "Shift", "Unknown"]
         makePie(can, labels, mno_info[j] );
        } else {
          makeDoughnut(can, ["supported","not supported"], [mno_info[j], (100 - (mno_info[j]))]);
        }
      } else {
          td.appendChild(document.createTextNode(mno_info[j]));
      }
      tr.appendChild(td)
  }
  tbdy.appendChild(tr);
}


function inTableAdd(gen, mno_info) {
  var tbdy = document.getElementById(gen + '_in_body');
  var tr = document.createElement('tr');
  for (var j = 0; j < mno_info.length; j++) {
      var td = document.createElement('td');
      td.width  = "80px";
      td.height = "80px";
      td.style.textAlign='center';
      if (j < 2) {
        td.appendChild(document.createTextNode(mno_info[j]));
      } else {
        var can = document.createElement('canvas');
        can.width  = "50px";
        can.height = "50px";
        td.appendChild(can);
        if (j == 2) {
          if (gen == 'LTE' || gen == 'LTE RRC') {
            labels = mno_info[j].length == 0? ['No Data'] : ["EEA0","EEA1","EEA2","EEA3","EEA4+"]
          } else if (gen == 'UMTS') {
            labels = mno_info[j].length == 0? ['No Data'] : ["UEA0","UEA1","UEA2","UEA3","UEA4+"]
          } else {
            labels = mno_info[j].length == 0? ['No Data'] : ["A5/0","A5/1","A5/2","A5/3","A5/4+"]
          }
          makePie(can, labels, mno_info[j] );

        } else if (j == 3) {
          if (gen == 'LTE' || gen == 'LTE RRC') {
            labels = mno_info[j].length == 0? ['No Data'] :["EIA0","EIA1","EIA2","EIA3", "EIA4+"]
          } else if (gen == 'UMTS') {
            labels = mno_info[j].length == 0? ['No Data'] :["UIA0","UIA1","UIA2","UIA3", "UIA4+"]
          } else {
            labels = mno_info[j].length == 0? ['No Data'] :["A5/0","A5/1","A5/2","A5/3", "A5/4+"]
          }
          makePie(can, labels, mno_info[j] );
        } else if (j > 3) {
          makeDoughnut(can, ["supported","not supported"], [mno_info[j], (100 - (mno_info[j]))]);
        }
      }
      tr.appendChild(td)
  }
  tbdy.appendChild(tr);
}


$(function() {
  addCountry(country[0])

  statsCreate()
  utTableCreate("LTE")
  utTableCreate("UMTS")
  utTableCreate("GSM")

  inTableCreate("LTE")
  inTableCreate("UMTS")
  inTableCreate("GSM")
  inTableCreate("LTE RRC")

  imTableCreate("GSM")

  mnos = country[1]
  for (var i = 0; i < mnos.length; i++) { //mnos
    mno = mnos[i]
    mno_name = mno[0]
    for (var j = 1; j < mno.length; j++) {
      year = mno[j]
      year_name = year[0]

      lte_tmsi_anonym = year[1]
      lte_tmsi_block  = year[2]
      lte_tmsi_shift  = year[3]
      lte_tmsi_undef  = lte_tmsi_anonym > 0? year[4] : 0  //if 100 percent, wheter block nor shift is given (no data)
      lte_tmsi_mech   = [ lte_tmsi_block, lte_tmsi_shift, lte_tmsi_undef ]
      lte_hop         = year[5]
      lte_nas_eas     = [ year[6],  year[7],  year[8],  year[9],  year[10] ]

      lte_nas_ias     = [ year[11], year[12], year[13], year[14], year[15] ]
      lte_nas_eia_rep = year[16]
      lte_nas_ea_sup  = year[17]
      lte_nas_ia_sup  = year[18]
      lte_nas_sh      = year[19]

      umts_tmsi_anonym = year[20]
      umts_tmsi_block  = year[21]
      umts_tmsi_shift  = year[22]
      umts_tmsi_undef  = umts_tmsi_anonym > 0? year[23] : 0 //if 100 percent, wheter block nor shift is given (no data)
      umts_tmsi_mech   = [ umts_tmsi_block, umts_tmsi_shift, umts_tmsi_undef ]
      umts_hop         = year[24]
      umts_nas_eas     = [ year[25], year[26], year[27], year[28], year[29] ]
      umts_nas_ias     = [ year[30], year[31], year[32], year[33], year[34] ]
      umts_nas_eia_rep = year[35]
      umts_nas_ea_sup  = year[36]
      umts_nas_ia_sup  = year[37]
      umts_nas_sh      = year[38]

      gsm_tmsi_anonym = year[39]
      gsm_tmsi_block  = year[40]
      gsm_tmsi_shift  = year[41]
      gsm_tmsi_undef  = gsm_tmsi_anonym > 0? year[42] : 0 //if 100 percent, wheter block nor shift is given (no data)
      gsm_tmsi_mech   = [ gsm_tmsi_block, gsm_tmsi_shift, gsm_tmsi_undef ]
      gsm_hop         = year[43]
      gsm_nas_eas     = [ year[44], year[45], year[46], year[47], year[48] ]
      gsm_nas_ias     = [ year[49], year[50], year[51], year[52], year[53] ]
      gsm_nas_eia_rep = year[54]
      gsm_nas_ea_sup  = year[55]
      gsm_nas_ia_sup  = year[56]
      gsm_nas_sh      = year[57]

      lte_rrc_eas     = [ year[58], year[59], year[60], year[61], year[62] ]
      lte_rrc_ias     = [ year[63], year[64], year[65], year[66], year[67] ]
      lte_rrc_eia_rep = year[68]
      lte_rrc_ea_sup  = year[69]
      lte_rrc_ia_sup  = year[70]

      call_auth = year[71]
      sms_auth  = year[72]

      no_lais  = year[73]
      no_cells = year[74]

      

      utTableAdd("LTE",    [mno_name, year_name, lte_tmsi_anonym,  lte_tmsi_mech,  lte_hop ]);
      utTableAdd("UMTS",   [mno_name, year_name, umts_tmsi_anonym, umts_tmsi_mech, umts_hop]);
      utTableAdd("GSM",    [mno_name, year_name, gsm_tmsi_anonym,  gsm_tmsi_mech,  gsm_hop]);


      inTableAdd("LTE",    [mno_name, year_name, lte_nas_eas, lte_nas_ias, lte_nas_ea_sup, lte_nas_ia_sup, lte_nas_eia_rep, lte_nas_sh]);
      inTableAdd("UMTS",   [mno_name, year_name, umts_nas_eas, umts_nas_ias, umts_nas_ea_sup, umts_nas_ia_sup, umts_nas_eia_rep, umts_nas_sh]);
      inTableAdd("GSM",    [mno_name, year_name, gsm_nas_eas, gsm_nas_ias, gsm_nas_ea_sup, gsm_nas_ia_sup, gsm_nas_eia_rep, gsm_nas_sh]);

      inTableAdd("LTE RRC",[mno_name, year_name, lte_rrc_eas, lte_rrc_ias, lte_rrc_ea_sup, lte_rrc_ia_sup, lte_rrc_eia_rep]);

      imTableAdd("GSM",    [mno_name, year_name, call_auth, sms_auth]);


      statsAdd(mno_name, year_name, [no_lais, no_cells] )
    }
  }
})
