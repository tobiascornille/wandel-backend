const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()).require('./routes/poi.routes.js')(app);

//TODO: move gMaps API calls to another module

const server = app.listen(8081, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Listening at http://%s:%s", host, port)

});