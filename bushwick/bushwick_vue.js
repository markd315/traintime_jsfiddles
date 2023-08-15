Vue.use(VueMaterial.default);

new Vue({
  el: '#app',
  data: {
    timer: '',
    docks: {},
    stations: {
    "k_st": {
        name: "Kosciuszko St",
        trains: [],
        xfer: "SubwayKosciuskoSt",
        subways: []
      },
    "central": {
        name: "Central Av",
        trains: [],
        xfer: "SubwayCentralAv",
        subways: []
      },
    "dekalb": {
        name: "Dekalb Av",
        trains: [],
        xfer: "SubwayDeKalbAvL",
        subways: []
      },
    "delancey": {
    	name: "Delancey / Essex",
      trains: [],
      xfer: "SubwayDelanceyStEssexSt",
      subways:[]
    },
    "canal_st": {
        name: "Canal St",
        trains: [],
        xfer: "SubwayCanalStJNQRZ6",
        subways: []
      },
     "ninety_sixth_street": {
        name: "96th Street",
        trains: [],
        xfer: "Subway96St2Av",
        subways: []
      },
    "fourteenth_street": {
        name: "14th Street",
        trains: [],
        xfer: "Subway6Av14StFLM",
        subways: []
      },
    "usq": {
        name: "USQ",
        trains: [],
        xfer: "Subway14StUnionSq",
        subways: []
      },
    "thirty_third_street": {
        name: "33rd Street",
        trains: [],
        xfer: "Subway34StHeraldSq",
        subways: []
      },
    }
  },
  created: function() {
    this.fetchAll();
    this.timer = setInterval(this.fetchAll, 25000)
  },
  methods: {
  	fetchAll: function() {
    	this.fetchBikes();
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
        case 'FX':
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
        case '4':
        case '5':
        case '6':
        case '6X':
        	return '#00933c'
       	case 'J':
        case 'Z':
        	return '#996633'
        case 'NJTransitLightRailHudsonbergenLightRail':
        default:
        	return '#009999'
          
			}
    },
    fetchBikes: function() {
      api = "https://citymapper.com/api/3/nearby?brand_ids=CitiBike&location=40.695473,-73.926774&region_id=us-nyc&mode_id=us-nyc-citibike&limit=50&extended=1"
      url = 'https://corsproxy.io/?' + encodeURIComponent(api);
      this.docks = []
      this.$http.get(url).then((function(station) {
          return function(result) {
            dock_coords = {
            	"CitiBike_5f0aa684-a1c5-4119-827f-7860f1cd4ccd": {
              	"down": 1,
                "right": 2
              },
              "CitiBike_a3d72b5b-9587-4f33-9722-c01e20a9b358": {
              	"down": 1,
                "left": 2
              },
              "J": {
              	"down": 2,
                "left": 1
              },
              "CitiBike_ee70b21e-4a95-4bdf-802c-50f83a76971d": {
              	"down": 1,
                "left": 3
              },
              "CitiBike_2a9e2320-083d-4044-aedf-0c15ecfefe61": {
              	"down": 2,
                "right": 2
              },
              "CitiBike_372c592e-09d8-400c-9595-2aa3510f39b0": {
              	"up": 2,
                "right": 1
              },
              "CitiBike_c63e9937-cadb-4813-aee3-5fd3fcc93767": {
              	"down": 3,
                "left": 2
              },
              "CitiBike_493e046c-5d62-4772-90c4-b6a9f4afcd39": {
                "left": 6
              },
              "M": {
                "up": 2,
              	"left": 2
              },
             	"L": {
                "up": 5,
              },
            }
          	for(let dock_idx in result.body.elements){
            	dock = result.body.elements[dock_idx];
              if(dock.walk_time_seconds < 380 || dock.id == 'CitiBike_f6cf3ecc-b3ad-4291-8c24-277f28f64ba1'){
                if(dock.id == 'CitiBike_d5ca6311-7471-480f-9c79-38baaafe34ba'){
                	dock.id = 'J';
                  dock.name = '(J) ' + dock.name;
                }
                if(dock.id == 'CitiBike_21361381-fd4a-44a4-bfa7-61f075192ce9'){
                	dock.id = 'M';
                  dock.name = '(M) ' + dock.name;
                  
                }
                if(dock.id == 'CitiBike_f6cf3ecc-b3ad-4291-8c24-277f28f64ba1'){
                	dock.id = 'L';
                  dock.name = '(L) ' + dock.name;
                }
                dock.coords = dock_coords[dock.id];
             		
            		this.docks.push(dock);
              }
            }
            	console.log(this.docks);
          }
        })());
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
                  if (rid == 'NewYorkSubwayW'){
                  	rid = 'W';
                  }
                  if('time_seconds' in data && 'direction_id' in data){
                  	dir = data.direction_id;
                    if(data.destination_name == "Broad St"){
                    	dir = '2';
                    }
                    if(data.destination_name == "Jamaica Center - Parsons/Archer"){
                    	dir = '3';
                    }
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
            	if(i < 5 || (orderedList[i].name[0] == 'Q' && i < 9)){
              	subset.push(orderedList[i]);
              }
            }
            this.stations[lookup_station].trains = subset;
          }
        })(lookup_station));
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  }
});

