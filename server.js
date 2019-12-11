const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000

app.use(bodyParser.json())
require('./routes/poi.routes.js')(app)

const server = app.listen(PORT, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Listening at http://%s:%s", host, port)

});
