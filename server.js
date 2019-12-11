const express = require('express');
const bodyParser = require('body-parser');
const poi = require('../controllers/poi.controller.js');

const PORT = process.env.PORT || 5000

const app = express();
app.use(bodyParser.json())

app.post('/routes', poi.getRoutes);
app.get('/test', poi.test);


const server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
