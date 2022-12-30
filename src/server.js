const dotenv = require('dotenv').config({path: __dirname + '/.env'})
const express = require('express'); // Express web server framework
const bodyParser = require("body-parser");
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

var app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser())
    .use(bodyParser.urlencoded({
      extended: true
    }))
    .use(bodyParser.json());


app.post('/music', function(req, res) {
  console.log(req.body.song);
  res.send("hello");
});

app.get('/getData', function(req,res) {
  // make some calls to database, fetch some data, information, check state, etc...
  var dataToSendToClient = {'message': 'error message from server'};
  // convert whatever we want to send (preferably should be an object) to JSON
  var JSONdata = JSON.stringify(dataToSendToClient);
  res.send(JSONdata);
});

console.log('Listening on 8888');
app.listen(8888);
