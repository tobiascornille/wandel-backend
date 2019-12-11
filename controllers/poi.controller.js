const gMaps = require("../external/google.maps");
const axios = require('axios');
var fs = require("fs");

//This module implements all logic of choosing which POI(s) to visit
var data = fs.readFileSync("poi.json", "utf-8");
const poi = JSON.parse(data);

exports.getRoutes = function(req, res) {
  var json_request = req.body;
  var destCoordsUrl = gMaps.getCoordinates(json_request.destination);
  axios.get(destCoordsUrl)
      .then((response) => {
        json_request.destination = response.data.candidates[0].geometry.location;
        var stops = stopList(testRequest);
        var route1 = gMaps.getRoute(stops[0]);
        var route2 = gMaps.getRoute(stops[1]);
        var route3 = gMaps.getRoute(stops[2]);

        var result = [
          {
            routeName: "Route 1",
            route: route1,
            spots: []
          },
          {
            routeName: "Route 2",
            route: route2,
            spots: []
          },
          {
            routeName: "Route 3",
            route: route3,
            spots: []
          }
        ];

        var spotsContent = [];
        for (let i = 1; i < stops[0].length - 1; i++) {
          spotsContent.push(stops[0][i]);
        }
        result[0].spots = spotsContent;

        spotsContent = [];
        for (let i = 1; i < stops[1].length - 1; i++) {
          spotsContent.push(stops[1][i]);
        }
        result[1].spots = spotsContent;

        spotsContent = [];
        for (let i = 1; i < stops[2].length - 1; i++) {
          spotsContent.push(stops[2][i]);
        }
        result[2].spots = spotsContent;

        return res.send(result);
      })
      .catch((err) => {
        console.log(err);
      });
};

// stopList receives a request of structure:
//30 min 2 park 1museum
var testRequest = {
  origin: {
    lat: 38.7378802,
    lng: -9.1394186
  },
  destination: {
    lat: 38.737671,
    lng: -9.1627037
  },
  preferences: {
    restaurant: false,
    park: true,
    viewpoint: false,
    museum: true,
    landmark: false,
    church: false
  }
};

// and returns a set of 3 lists of poi,
// each set is bigger than the previous one and each set is contained by the following set.

function stopList(req, res) {
  var originDestDistance = rawDistance(req.origin, req.destination);
  var rawdata = fs.readFileSync("poi.json");
  let allPoint = JSON.parse(rawdata);
  var selectedPoint = [];
  // console.log("all points :" + allPoint);
  var path1PoiList = { tier1: [], tier2: [], tier3: [] };
  var path2PoiList = { tier1: [], tier2: [], tier3: [] };
  var path3PoiList = { tier1: [], tier2: [], tier3: [] };
  var outsidePoi = [];

  var finalPath1 = [];
  var finalPath2 = [];
  var finalPath3 = [];

  // select point in a circle of length originDestDistance from origin
  for (var i = 0; i < allPoint.length; i++) {
    if (
      rawDistance(req.origin, allPoint[i].location) < originDestDistance &&
      rawDistance(req.destination, allPoint[i].location) < originDestDistance
    ) {
      selectedPoint.push(allPoint[i]);
    }
  }
  // console.log("the selected points are :");
  // console.log(selectedPoint);

  //create intermediary point
  var intPoint1 = {
    lat: (req.origin.lat * 2) / 3 + req.destination.lat / 3,
    lng: (req.origin.lng * 2) / 3 + req.destination.lng / 3
  };
  var intPoint2 = {
    lat: req.origin.lat / 3 + (req.destination.lat * 2) / 3,
    lng: req.origin.lng / 3 + (req.destination.lng * 2) / 3
  };

  //Check additional travel distance require to go to a POI
  for (var i = 0; i < selectedPoint.length; i++) {
    var distOrgPoint1 =
      rawDistance(req.origin, selectedPoint[i].location) +
      rawDistance(selectedPoint[i].location, intPoint1) -
      rawDistance(req.origin, intPoint1);
    var distPoint1Point2 =
      rawDistance(intPoint1, selectedPoint[i].location) +
      rawDistance(selectedPoint[i].location, intPoint2) -
      rawDistance(intPoint1, intPoint2);
    var distPoint2Dest =
      rawDistance(intPoint2, selectedPoint[i].location) +
      rawDistance(selectedPoint[i].location, req.destination) -
      rawDistance(intPoint2, req.destination);

    //Distance test
    // console.log("------------" + i + "------------");
    // console.log(distOrgPoint1);
    // console.log(distPoint1Point2);
    // console.log(distPoint2Dest);

    if (distOrgPoint1 <= 250) {
      path1PoiList.tier1.push(selectedPoint[i]);
    } else if (distOrgPoint1 <= 500 && distOrgPoint1 > 250) {
      path2PoiList.tier1.push(selectedPoint[i]);
    } else if (distOrgPoint1 <= 750 && distOrgPoint1 > 500) {
      path3PoiList.tier1.push(selectedPoint[i]);
    }

    if (distPoint1Point2 <= 250) {
      path1PoiList.tier2.push(selectedPoint[i]);
    } else if (distPoint1Point2 <= 500 && distPoint1Point2 > 250) {
      path2PoiList.tier2.push(selectedPoint[i]);
    } else if (distPoint1Point2 <= 750 && distPoint1Point2 > 500) {
      path3PoiList.tier2.push(selectedPoint[i]);
    }

    if (distPoint2Dest <= 250) {
      path1PoiList.tier3.push(selectedPoint[i]);
    } else if (distPoint2Dest <= 500 && distPoint2Dest > 250) {
      path2PoiList.tier3.push(selectedPoint[i]);
    } else if (distPoint2Dest <= 750 && distPoint2Dest > 500) {
      path3PoiList.tier3.push(selectedPoint[i]);
    }
  }

  for (var i = 0; i < selectedPoint.length; i++) {
    if (
      isNotIn(selectedPoint[i], path1PoiList.tier1) &&
      isNotIn(selectedPoint[i], path1PoiList.tier2) &&
      isNotIn(selectedPoint[i], path1PoiList.tier3) &&
      isNotIn(selectedPoint[i], path2PoiList.tier1) &&
      isNotIn(selectedPoint[i], path2PoiList.tier2) &&
      isNotIn(selectedPoint[i], path2PoiList.tier3) &&
      isNotIn(selectedPoint[i], path3PoiList.tier1) &&
      isNotIn(selectedPoint[i], path3PoiList.tier2) &&
      isNotIn(selectedPoint[i], path3PoiList.tier3)
    ) {
      outsidePoi.push(selectedPoint[i]);
    }
  }

  // console.log("path1PoiList");
  // console.log(path1PoiList);
  // console.log("path2PoiList");
  // console.log(path2PoiList);
  // console.log("path3PoiList");
  // console.log(path3PoiList);

  //Extract the preference from the request as a []
  var preferenceList = Object.keys(req.preferences).filter(
    k => req.preferences[k]
  );

  //Select POI by preference
  if (path1PoiList.tier1.length !== 0) {
    if (
      selectByPreference(preferenceList, path1PoiList.tier1, finalPath1) != -1
    ) {
      finalPath1.push(
        path1PoiList.tier1[
          selectByPreference(preferenceList, path1PoiList.tier1, finalPath1)
        ]
      );
    } else {
      if (selectNotExisting(path1PoiList.tier1, finalPath1) != -1) {
        finalPath1.push(
          path1PoiList.tier1[selectNotExisting(path1PoiList.tier1, finalPath1)]
        );
      }
    }
  }
  if (path1PoiList.tier2.lenght != 0) {
    if (
      selectByPreference(preferenceList, path1PoiList.tier2, finalPath1) != -1
    ) {
      finalPath1.push(
        path1PoiList.tier2[
          selectByPreference(preferenceList, path1PoiList.tier2, finalPath1)
        ]
      );
    } else {
      if (selectNotExisting(path1PoiList.tier2, finalPath1) != -1) {
        finalPath1.push(
          path1PoiList.tier2[selectNotExisting(path1PoiList.tier2, finalPath1)]
        );
      }
    }
  }
  if (path1PoiList.tier3.lenght != 0) {
    if (
      selectByPreference(preferenceList, path1PoiList.tier3, finalPath1) != -1
    ) {
      finalPath1.push(
        path1PoiList.tier3[
          selectByPreference(preferenceList, path1PoiList.tier3, finalPath1)
        ]
      );
    } else {
      if (selectNotExisting(path1PoiList.tier3, finalPath1) != -1) {
        finalPath1.push(
          path1PoiList.tier3[selectNotExisting(path1PoiList.tier3, finalPath1)]
        );
      }
    }
  }

  if (path2PoiList.tier1.lenght != 0) {
    if (
      selectByPreference(preferenceList, path2PoiList.tier1, finalPath2) != -1
    ) {
      finalPath2.push(
        path2PoiList.tier1[
          selectByPreference(preferenceList, path2PoiList.tier1, finalPath2)
        ]
      );
    } else {
      if (selectNotExisting(path2PoiList.tier1, finalPath2) != -1) {
        finalPath2.push(
          path2PoiList.tier1[selectNotExisting(path2PoiList.tier1, finalPath2)]
        );
      }
    }
  }
  if (path2PoiList.tier2.lenght != 0) {
    if (
      selectByPreference(preferenceList, path2PoiList.tier2, finalPath2) != -1
    ) {
      finalPath2.push(
        path2PoiList.tier2[
          selectByPreference(preferenceList, path2PoiList.tier2, finalPath2)
        ]
      );
    } else {
      if (selectNotExisting(path2PoiList.tier2, finalPath2) != -1) {
        finalPath2.push(
          path2PoiList.tier2[selectNotExisting(path2PoiList.tier2, finalPath2)]
        );
      }
    }
  }
  if (path2PoiList.tier3.lenght != 0) {
    if (
      selectByPreference(preferenceList, path2PoiList.tier3, finalPath2) != -1
    ) {
      finalPath2.push(
        path2PoiList.tier3[
          selectByPreference(preferenceList, path2PoiList.tier3, finalPath2)
        ]
      );
    } else {
      if (selectNotExisting(path2PoiList.tier3, finalPath2) != -1) {
        finalPath2.push(
          path2PoiList.tier3[selectNotExisting(path2PoiList.tier3, finalPath2)]
        );
      }
    }
  }

  if (path3PoiList.tier1.lenght != 0) {
    if (
      selectByPreference(preferenceList, path3PoiList.tier1, finalPath3) != -1
    ) {
      finalPath3.push(
        path3PoiList.tier1[
          selectByPreference(preferenceList, path3PoiList.tier1, finalPath3)
        ]
      );
    } else {
      if (selectNotExisting(path3PoiList.tier1, finalPath3) != -1) {
        finalPath3.push(
          path3PoiList.tier1[selectNotExisting(path3PoiList.tier1, finalPath3)]
        );
      }
    }
  }
  if (path3PoiList.tier2.lenght != 0) {
    if (
      selectByPreference(preferenceList, path3PoiList.tier2, finalPath3) != -1
    ) {
      finalPath3.push(
        path3PoiList.tier2[
          selectByPreference(preferenceList, path3PoiList.tier2, finalPath3)
        ]
      );
    } else {
      if (selectNotExisting(path3PoiList.tier2, finalPath3) != -1) {
        finalPath3.push(
          path3PoiList.tier2[selectNotExisting(path3PoiList.tier2, finalPath3)]
        );
      }
    }
  }
  if (path3PoiList.tier3.lenght != 0) {
    if (
      selectByPreference(preferenceList, path3PoiList.tier3, finalPath3) != -1
    ) {
      finalPath3.push(
        path3PoiList.tier3[
          selectByPreference(preferenceList, path3PoiList.tier3, finalPath3)
        ]
      );
    } else {
      if (selectNotExisting(path3PoiList.tier3, finalPath3) != -1) {
        finalPath3.push(
          path3PoiList.tier3[selectNotExisting(path3PoiList.tier3, finalPath3)]
        );
      }
    }
  }

  // filing up path 1
  if (finalPath1.length === 0) {
    if (finalPath2.length !== 0) {
      for (var i = 0; i < finalPath2.length; i++) {
        if (finalPath1.length < 2) {
          if (
            selectByPreference(preferenceList, finalPath2, finalPath1) != -1
          ) {
            finalPath1.push(
              finalPath2[
                selectByPreference(preferenceList, finalPath2, finalPath1)
              ]
            );
          } else {
            if (selectNotExisting(finalPath2, finalPath1) != -1) {
              finalPath1.push(
                finalPath2[selectNotExisting(finalPath2, finalPath1)]
              );
            }
          }
        } else {
          break;
        }
      }
    } else if (finalPath3.length !== 0) {
      for (var i = 0; i < finalPath3.length; i++) {
        if (finalPath1.length < 1) {
          if (
            selectByPreference(preferenceList, finalPath3, finalPath1) != -1
          ) {
            finalPath1.push(
              finalPath3[
                selectByPreference(preferenceList, finalPath3, finalPath1)
              ]
            );
          } else {
            if (selectNotExisting(finalPath3, finalPath1) != -1) {
              finalPath1.push(
                finalPath3[selectNotExisting(finalPath3, finalPath1)]
              );
            }
          }
        } else {
          break;
        }
      }
    }
  } else if (finalPath1.length === 1) {
    if (finalPath2.length !== 0) {
      for (var i = 0; i < finalPath2.length; i++) {
        if (finalPath1.length < 1) {
          if (
            selectByPreference(preferenceList, finalPath2, finalPath1) != -1
          ) {
            finalPath1.push(
              finalPath2[
                selectByPreference(preferenceList, finalPath2, finalPath1)
              ]
            );
          } else {
            if (selectNotExisting(finalPath2, finalPath1) != -1) {
              finalPath1.push(
                finalPath2[selectNotExisting(finalPath2, finalPath1)]
              );
            }
          }
        } else {
          break;
        }
      }
    }
  }

  //If path 3 is not full, full it with point in the area that are further (in outsidePoi)
  if (finalPath3.length < 3) {
    if (3 - finalPath3.length >= outsidePoi.length) {
      for (var i = 0; i < outsidePoi.length; i++) {
        if (finalPath3.length < 3) {
          if (
            selectByPreference(preferenceList, outsidePoi, finalPath3) != -1
          ) {
            finalPath3.push(
              outsidePoi[
                selectByPreference(preferenceList, outsidePoi, finalPath3)
              ]
            );
          } else {
            if (selectNotExisting(outsidePoi, finalPath3) != -1) {
              finalPath3.push(
                outsidePoi[selectNotExisting(outsidePoi, finalPath3)]
              );
            }
          }
        } else {
          break;
        }
      }
    } else {
      for (var i = 0; i < outsidePoi.length; i++) {
        if (selectNotExisting(outsidePoi, finalPath3) != -1) {
          finalPath3.push(
            outsidePoi[selectNotExisting(outsidePoi, finalPath3)]
          );
        }
      }
    }
  }

  // filing up path 3
  if (finalPath3.length < 3) {
    for (var i = 0; i < finalPath2.length; i++) {
      if (finalPath3.length < 3) {
        if (selectByPreference(preferenceList, finalPath2, finalPath3) != -1) {
          finalPath3.push(
            finalPath2[
              selectByPreference(preferenceList, finalPath2, finalPath3)
            ]
          );
        } else {
          if (selectNotExisting(finalPath2, finalPath3) != -1) {
            finalPath3.push(
              finalPath2[selectNotExisting(finalPath2, finalPath3)]
            );
          }
        }
      } else {
        break;
      }
    }
    for (var i = 0; i < finalPath1.length; i++) {
      if (finalPath3.length < 3) {
        if (selectByPreference(preferenceList, finalPath1, finalPath3) != -1) {
          finalPath3.push(
            finalPath1[
              selectByPreference(preferenceList, finalPath1, finalPath3)
            ]
          );
        } else {
          if (selectNotExisting(finalPath1, finalPath3) != -1) {
            finalPath3.push(
              finalPath1[selectNotExisting(finalPath1, finalPath3)]
            );
          }
        }
      } else {
        break;
      }
    }
  }

  // filing up path 2 change 4 by 2
  if (finalPath2.length < 3) {
    for (var i = 0; i < finalPath1.length; i++) {
      if (finalPath2.length < 3) {
        if (selectByPreference(preferenceList, finalPath1, finalPath2) != -1) {
          finalPath2.push(
            finalPath1[
              selectByPreference(preferenceList, finalPath1, finalPath2)
            ]
          );
        } else {
          if (selectNotExisting(finalPath1, finalPath2) != -1) {
            finalPath2.push(
              finalPath1[selectNotExisting(finalPath1, finalPath2)]
            );
          }
        }
      } else {
        break;
      }
    }
    for (var i = 0; i < finalPath3.length; i++) {
      if (finalPath2.length < 3) {
        if (selectByPreference(preferenceList, finalPath3, finalPath2) != -1) {
          finalPath2.push(
            finalPath3[
              selectByPreference(preferenceList, finalPath3, finalPath2)
            ]
          );
        } else {
          if (selectNotExisting(finalPath3, finalPath2) != -1) {
            finalPath2.push(
              finalPath3[selectNotExisting(finalPath3, finalPath2)]
            );
          }
        }
      } else {
        break;
      }
    }
  }

  var finalReturn = [finalPath1, finalPath2, finalPath3];

  // console.log("final return");
  // console.log(finalReturn);
  // to view all data in console use :
  // console.log("finalPath1");
  // console.log(finalPath1);
  // console.log("finalPath2");
  // console.log(finalPath2);
  // console.log("finalPath3");
  // console.log(finalPath3);
  return finalReturn;
}

/*
[
    [],
    [],
    []
]
*/

function selectByPreference(preference, list, existingList) {
  for (var j = 0; j < preference.length; j++) {
    for (var i = 0; i < list.length; i++) {
      for (var k = 0; k < list[i].category.length; k++) {
        if (list[i].category[k] === preference[j]) {
          if (existingList.length !== 0) {
            if (isNotIn(list[i], existingList)) {
              return i;
            }
          } else {
            return i;
          }
        }
      }
    }
  }
  return -1;
}

function selectNotExisting(list, existingList) {
  if (list.length !== 0) {
    if (existingList.length !== 0) {
      for (var i = 0; i < list.length; i++) {
        if (isNotIn(list[i], existingList)) {
          return i;
        }
      }
    } else {
      return 0;
    }
  } else {
    return -1;
  }
}

function isNotIn(element, list) {
  for (var i = 0; i < list.length; i++) {
    if (element === list[i]) {
      return false;
    }
  }
  return true;
}

/* AUX functions*/

/*Distance, as the crow flies, in m, between two points.
This will be used as an estimate of walking distance
to reduce the number of calls to the google maps API.
point should be of structure:
{
  "lat": 41.43206,
  "lng": -81.38992
}
*/
function rawDistance(p1, p2) {
  //console.log("p1:\n");
  //console.log(p1);
  //console.log("p2:\n");
  //console.log(p2);
  var R = 6371000; // Radius of the earth in m
  var lat1 = p1["lat"];
  var lng1 = p1["lng"];
  var lat2 = p2["lat"];
  var lng2 = p2["lng"];
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLng = deg2rad(lng2 - lng1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in m
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/*-------------------------TEST-------------------------*/

function populateDetail() {
  var temp = fs.readFileSync("poi.json");
  for (let i = 0; i < temp.length; i++) {
    temp[i]["gDetail"] = gMaps.getDetail(poi[i]);
  }
  var poiData = JSON.stringify(temp);
  fs.writeFile("poi.json", poiData, function(err) {
    if (err) {
      console.log(err);
    }
  });
}

exports.test = function() {
  testRequest.destination = 'Cais do Sodre';
  var destCoordsUrl = gMaps.getCoordinates(testRequest.destination);
  axios.get(destCoordsUrl)
      .then((response) => {
        console.log(response.data.candidates[0].geometry.location);
        testRequest.destination = response.data.candidates[0].geometry.location;
        var stops = stopList(testRequest);
        var route1 = gMaps.getRoute(stops[0]);
        var route2 = gMaps.getRoute(stops[1]);
        var route3 = gMaps.getRoute(stops[2]);

        var res = [
          {
            routeName: "Route 1",
            route: route1,
            spots: []
          },
          {
            routeName: "Route 2",
            route: route2,
            spots: []
          },
          {
            routeName: "Route 3",
            route: route3,
            spots: []
          }
        ];

        var spotsContent = [];
        for (let i = 1; i < stops[0].length - 1; i++) {
          spotsContent.push(stops[0][i]);
        }
        res[0].spots = spotsContent;

        spotsContent = [];
        for (let i = 1; i < stops[1].length - 1; i++) {
          spotsContent.push(stops[1][i]);
        }
        res[1].spots = spotsContent;

        spotsContent = [];
        for (let i = 1; i < stops[2].length - 1; i++) {
          spotsContent.push(stops[2][i]);
        }
        res[2].spots = spotsContent;

        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
};
