Vue.use(VueMaterial.default);

new Vue({
  el: '#app',
  data: {
    timer: '',
    terminals_nyc: ['33rd Street', 'World Trade Center', '33rd Street via Hoboken'],
    terminals_nj: ['Hoboken', 'Journal Square', 'Newark', 'Journal Square via Hoboken'],
    stations: {
    "hoboken": {
        name: "Hoboken",
        trains: [],
        xfer: "LightRailStationHoboken",
        subways: []
      },
    "thirty_third_street": {
        name: "33rd Street",
        trains: [],
        xfer: "Subway34StHeraldSq",
        subways: []
      },
     "ninety_sixth_street": {
        name: "96th Street",
        trains: [],
        xfer: "Subway96St2Av",
        subways: []
      },
    "twenty_third_street": {
        name: "23rd Street",
        trains: []
      },
    "fourteenth_street": {
        name: "14th Street",
        trains: [],
        xfer: "Subway6Av14StFLM",
        subways: []
      },
    "ninth_street": {
        name: "9th Street",
        trains: [],
        xfer: "SubwayW4StWashSq",
        subways: []
      },
    "christopher_street": {
        name: "Christopher Street",
        xfer: "SubwayChristopherStSheridanSq",
        trains: [],
        subways: []
      },
      "world_trade_center": {
        name: "WTC",
        xfer: "SubwayCortlandtSt1",
        trains: [],
        subways: []
      },
      "newport": {
        name: "Newport",
        trains: []
      },
      "grove_street": {
        name: "Grove Street",
        trains: []
      },
      "journal_square": {
        name: "Journal Square",
        trains: []
      },
    	"exchange_place": {
        name: "Exchange Place",
        trains: []
      },
      "harrison": {
        name: "Harrison",
        trains: []
      },
      "newark": {
        name: "Newark Penn",
        trains: []
      },
    }
  },
  created: function() {
    this.fetchAll();
    this.timer = setInterval(this.fetchAll, 25000)
  },
  methods: {
  	fetchAll: function() {
    	this.fetchStations();
      this.fetchSubway();
    },
    getLineColor: function(route_id) {
    	switch(route_id) {
        case 'A':
        case 'C':
        case 'E':
          return '#0039A6'
        case 'B':
        case 'D':
        case 'F':
        case 'M':
          return '#ff6319'
        case 'L':
          return '#808183'
        case 'N':
        case 'R':
        case 'W':
        case 'NewYorkSubwayW':
          return '#fccc0a'
        case 'Q':
        	return '#f4c2c2'
        case '1':
        case '2':
        case '3':
        	return '#ee352e'
        case 'NJTransitLightRailHudsonbergenLightRail':
        default:
        	return '#009999'
          
			}
    },
    fetchStations: function() {
      for (let curr_station in this.stations) {
        this.$http.get("https://path.api.razza.dev/v1/stations/" + curr_station + "/realtime").then((function(station) {
          return function(result) {
            this.stations[station].trains = result.body.upcomingTrains.sort(function(a, b) {
              return Date.parse(a.projectedArrival) - Date.parse(b.projectedArrival);
            }).map(function(train) {
              return {
                name: train.lineName,
                arrival_time: moment(Date.parse(train.projectedArrival)).fromNow(),
                line_color: train.lineColors,
                dir: ""
              };
            });
          }
        })(curr_station));
      }
    },
    fetchSubway: function() {
      for (let lookup_station in this.stations) {
      	if (!this.stations[lookup_station].hasOwnProperty("xfer")) {
        	continue;
        }
        api = "https://citymapper.com/api/2/metrodepartures?headways=1&ids=" + this.stations[lookup_station].xfer + "&region_id=us-nyc"
        url = 'https://corsproxy.io/?' + encodeURIComponent(api);

        this.$http.get(url).then((function(station) {
          return function(result) {
          	departures = []
            for (s in result.body.stations[0]['sections']){
            	for (grp in result.body.stations[0]['sections'][s]['departure_groupings']){
								grp = result.body.stations[0]['sections'][s]['departure_groupings'][grp]
              	for (dept in grp['departures']){
                	data = grp['departures'][dept]
                  rid = data.route_id;
                  if (rid == 'NJTransitLightRailHudsonbergenLightRail'){
                  	rid = 'HBLR';
                  }
                  if (rid == 'NewYorkSubwayW'){
                  	rid = 'W';
                  }
                  dir = data.direction_id;
                  if (data.destination_name == 'Tonnelle Avenue'){
                  	dir = '1'
                  }
                  if('time_seconds' in data && 'direction_id' in data){
                    outputdata = {
                      name: rid + " " + data.destination_name,
                      arrival_time: "in " + Math.round(data.time_seconds/60) + " minutes",
                      line_color: [this.getLineColor(data.route_id)],
                      dir: dir
                    }
                  	departures.push(outputdata);
                  }
                  else if('scheduled_time' in data && 'direction_id' in data) {
                  	tm = moment(Date.parse(data.scheduled_time)).fromNow()
                    outputdata = {
                      name: rid + " " + data.destination_name,
                      arrival_time: tm.toString(),
                      line_color: [this.getLineColor(data.route_id)],
                      dir: dir
                    }
                    if(lookup_station == "ninety_sixth_street"){
                    	//console.log(outputdata);
                      // We have to wipe any stations that don't have path stops manually, or they get duplicated
                      this.stations[lookup_station].trains = []
                    }
                    if(!outputdata.arrival_time.includes("hour"))
                    	departures.push(outputdata);
                  }
              }
              }
            }
            orderedList = departures.sort((a, b) => {
            	let rgx = /in (\d*) minutes/;
              let mins_a = parseInt(a['arrival_time'].match(rgx)[1]);
							let mins_b = parseInt(b['arrival_time'].match(rgx)[1]);
              if (mins_a > mins_b) {
                return 1
              } else if (mins_a < mins_b) {
                return -1
              } else {
                return 0
              }
            });
            subset = []
            for(i in orderedList){
            	console.log(orderedList[i].name[0]);
            	if(i < 6 || orderedList[i].name[0] == 'Q'){
              	subset.push(orderedList[i]);
              }
            }
            this.stations[lookup_station].trains.push(...subset);
          }
        })(lookup_station));
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  }
});

