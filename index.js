const loader = document.getElementById("loader");
const content = document.getElementById("content");

const url =
  'https://data.etabus.gov.hk/v1/transport/kmb/route-eta/';

const urlStopId = 'https://data.etabus.gov.hk/v1/transport/kmb/route-stop/'
const urlStopName = 'https://data.etabus.gov.hk/v1/transport/kmb/stop/'

const list = [
  {
    "route": "89",
    "stops":
    [{ "dir": "O", "seq": 6 },
    { "dir": "O", "seq": 10 },
    { "dir": "I", "seq": 12 },
    { "dir": "I", "seq": 16 },
    { "dir": "I", "seq": 19 }]
  },
  {
    "route": "282",
    "stops":
    [{ "dir": "O", "seq": 1 },
    { "dir": "O", "seq": 6 }]
  },
  {
    "route": "A41",
    "stops":
    [{ "dir": "O", "seq": 8 },
    { "dir": "O", "seq": 11 },
    { "dir": "I", "seq": 1 }]
  },
  {
    "route": "280X",
    "stops":
    [{ "dir": "I", "seq": 3 },
    { "dir": "I", "seq": 4 },
    { "dir": "I", "seq": 11 }]
  },
  {
    "route": "74A",
    "stops":
    [{ "dir": "O", "seq": 29 },
    { "dir": "O", "seq": 33 },
    { "dir": "I", "seq": 11 },
    { "dir": "I", "seq": 14 }]
  },
  {
    "route": "182",
    "stops":
    [{ "dir": "O", "seq": 10 },
    { "dir": "O", "seq": 23 },
    { "dir": "O", "seq": 27 },
    { "dir": "I", "seq": 2 },
    { "dir": "I", "seq": 3 },
    { "dir": "I", "seq": 4 },
    { "dir": "I", "seq": 7 },
    { "dir": "I", "seq": 23 }]
  }
]

const resultsDOM = document.querySelector('.results');

const init = async () => {
  let result = [];
  for (const x of list) {
    let route = x.route;
    const response = await fetch(`${url}${route}/1`);
    let data = await response.json();
    let results = data.data;
    for (const y of x.stops) {
      const inOut = y.dir == "O" ? "outbound" : "inbound";
      let responseStopIds = await fetch(`${urlStopId}${route}/${inOut}/1`);
      console.log(`${urlStopId}${route}/${inOut}/1`);
      let stopIdsJson = await responseStopIds.json();
      console.log(stopIdsJson);
      let stopId = stopIdsJson.data.filter(a => a.seq == y.seq)[0].stop;
      console.log(stopId);
      let responseStopName = await fetch(`${urlStopName}${stopId}`);
      let stopNameJson = await responseStopName.json();
      console.log(stopNameJson.data);

      let stopName = stopNameJson.data.name_tc;
      let b = results.filter(a => a.seq == y.seq && a.dir == y.dir);
      b.reduce(function (res, value) {
        let key = value.dir + value.seq
        if (!res[key]) {
          res[key] = value;
          result.push(res[key]);
          res[key].summ = [];
          res[key].stopName = stopName;
        }
        if (value.eta != null) {
          res[key].summ.push(Math.max(((new Date(value.eta) - new Date()) / 60000).toPrecision(2),0));
        } else {
          res[key].summ.push('冇車')
        }
        return res;
      }, {});
    }
  }
  console.log("change style");
  // loader.style.display = "none";
  spin.style.display = "none";
  // loader2.style.display = "none";
  content.style.display = "block";
  renderResults(result);
};

window.addEventListener('DOMContentLoaded', init);

const renderResults = (list) => {
  const etaList = list
    .map((item) => {
      const { route, seq, dest_tc, eta_seq, eta, summ, stopName } = item;
      let summFormatted = '';
      for (let i = 0; i < summ.length; i++) {
        if (i == 0) {
          summFormatted += summ[i];
        } else {
          summFormatted = summFormatted + ', ' + summ[i];
        }
      }
      console.log(summFormatted);
      return `
      <div class="row">
        <div class="col">${route}</div>
        <div class="col">${dest_tc}</div>
        <div class="col">${stopName}</div>
        <div class="col">${summFormatted}</div>
      </div>
    `;
    })
    .join('');
  resultsDOM.innerHTML = `<section>
  <div class="row header">
    <div class="col">路線</div>
    <div class="col">往</div>
    <div class="col">車站</div>
    <div class="col">時間</div>
  </div>
          ${etaList}
          </section>
        `;
  console.log("inner" + resultsDOM.innerHTML);
};
console.log("end");
