const axios = require('axios');
const Promise = require('promise');
const key = require('../key');
const gMapsClient = require('@google/maps').createClient({
    key: key.getKey(),
    Promise: Promise
});

//TODO: Change API calls to build valid url and use axios.get(), and add argument typechecking

function asArray(arg) {
    return Array.isArray(arg) ? arg : [arg];
}

function latLng(arg) {
    if (!arg) {
        return -1;
    } else if (arg.lat != undefined && arg.lng != undefined) {
        arg = [arg.lat, arg.lng];
    } else if (arg.latitude != undefined && arg.longitude != undefined) {
        arg = [arg.latitude, arg.longitude];
    }
    return asArray(arg).join(',');
}

exports.getCoordinates = function (req) {
    //https://maps.googleapis.com/maps/api/place/findplacefromtext/output?parameters
    var requestJSON = {
        input: req,
        inputtype: 'textquery',
        language: 'pt',
        fields: [
            'geometry', 'geometry/location', 'geometry/location/lat',
            'geometry/location/lng', 'name', 'place_id'
        ]
    };
    var url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input='+ requestJSON.input + '&inputtype=' + requestJSON.inputtype + '&language=' + requestJSON.language + '&fields=' + requestJSON.fields.toString() + '&key=' + key.getKey();
    console.log('Request URL:\n' + url);
    return url;
    /*console.log('pre-request\n');
    axios.get(url)
        .then((response) => {
            console.log('post-response\n');
            console.log(response.json.results[0]['location']);
            return response.json.results[0]['location'];
        })
        .catch((err) => {
            console.log(err);
        });*/

    /*gMapsClient.findPlace({
        input: req,
        inputtype: 'textquery',
        language: 'pt',
        fields: [
            'geometry', 'geometry/location', 'geometry/location/lat',
            'geometry/location/lng', 'icon', 'id', 'name', 'place_id'
        ]
    })
        .asPromise()
        .then((response) => {
            console.log(response.json.results[0]['location']);
            return response.json.results[0]['location'];
        })
        .catch((err) => {
            console.log(err);
        });*/
};

exports.getRoute = function (req) {
    //https://maps.googleapis.com/maps/api/directions/json?destination=38.736843%2C-9.13075&mode=walking&origin=38.7377939%2C-9.1380037&un%20its=metric&waypoints=38.7367036%2C-9.1383635%7C38.736988%2C-9.135464&optimize=true&key=AIzaSyD6h_ZyaegKrsj5GnVfkyO41Ax4DuAzMho
    var nStops = req.length;
    if (req.length>2) { //if the path has intermediate stops
        var waypointLocations = [];
        for (let i=1; i<(req.length-1); i++) {
            waypointLocations.push(latLng(req[i].location));
        }
        var requestJSON = {
            origin: req[0].location.lat.toString().concat(",", req[0].location.lng.toString()),
            destination: req[nStops-1].location.lat.toString().concat(",", req[nStops-1].location.lng.toString()),
            mode: 'walking',
            units: 'metric',
            waypoints: waypointLocations,
            /*[
                waypointLocations[0],
                waypointLocations[1]
            ],*/
            optimize: true
        };
        var url = 'https://maps.googleapis.com/maps/api/directions/json?destination='+requestJSON.destination.toString()+'&mode='+requestJSON.mode+'&origin='+requestJSON.origin.toString()+'&un%20its='+requestJSON.units+'&waypoints='+requestJSON.waypoints.toString()+'&optimize='+requestJSON.optimize.toString()+'&key='+key.getKey();
    } else {
        var requestJSON = {
            origin: req[0].location.lat.toString().concat(",", req[0].location.lng.toString()),
            destination: req[nStops-1].location.lat.toString().concat(",", req[nStops-1].location.lng.toString()),
            mode: 'walking',
            units: 'metric',
            optimize: true
        };
        var url = 'https://maps.googleapis.com/maps/api/directions/json?destination='+requestJSON.destination.toString()+'&mode='+requestJSON.mode+'&origin='+requestJSON.origin.toString()+'&un%20its='+requestJSON.units+'&optimize='+requestJSON.optimize.toString()+'&key='/*+ key.getKey()*/;

    }
    //console.log('\nRoute Request:\n');
    //console.log(requestJSON);
    /*gMapsClient.directions(requestJSON)
        .asPromise()
        .then((response) => {
            console.log('\nRoute Response:\n');
            console.log(response.json.results);
            return response.json.results;
        })
        .catch((err) => {
            console.log(err);
        });*/
    console.log(url);
    return url;
};

//Receives a Point of Interest and returns the place detail
// https://maps.googleapis.com/maps/api/place/nearbysearch/json?parameters
exports.getDetail = function (req) {
    var requestJSON = {
        location: {
            latitude: req.location.lat,
                longitude: req.location.lng
        },
        //radius: 10,
        rankby: 'distance',
        keyword: req.name,
    };
    var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+ requestJSON.location.latitude.toString() + ',' + requestJSON.location.longitude.toString() + '&rankby=' + requestJSON.rankby.toString() + '&keyword=' + requestJSON.keyword.toString() + '&key=' + key.getKey();
    console.log(url);
    /*
    gMapsClient.placesNearby({
        location: {
            latitude: req.location.lat,
            longitude: req.location.lng
        },
        //radius: 10,
        rankby: 'distance',
        keyword: req.name,
    })
        .asPromise()
        .then((response) => {
            //console.log('\nDetail Response:\n');
            console.log(response.json.results[0]);
            return response.json.results[0];
        })
        .catch((err) => {
            console.log(err);
        });
     */
};
