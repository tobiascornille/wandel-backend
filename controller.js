const http = require('http');
const selector = require('./poi-selector');
//TODO: move gMaps API calls to another module
const gMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBvACQ0omZMX3ey_8WNkAxGrqrHTJOiKNE'
});


http.createServer( function (request, response) {
    //TODO: request is now GET not POST
    /*if (request.method === 'POST') {
        var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            const json_request = JSON.parse(body);
            gMapsClient.findPlace({
                input: json_request['destination'],
                inputtype: 'textquery',
                language: 'pt',
                fields: [
                    'geometry', 'geometry/location', 'geometry/location/lat',
                    'geometry/location/lng', 'icon', 'id', 'name', 'place_id'
                ]
            })
                .then(function (response) {
                    //TODO: add check to see if response is valid
                    //location of the top result
                    json_request['destination'] = response['results'][0]['location'];
                });
            const spotList = selector.poiList(json_request);
        });
    }*/
}).listen(8080);