/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var dotenv = require('dotenv').config({path: __dirname + '/.env'})
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors'); //so front end and back end can share data
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

//from other sus website
const bodyParser = require('body-parser') //parse incoming requests

const CLIENT_ID = process.env.CLIENT_ID || 'none';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'none';
const SQL_PASSWORD = process.env.SQL_PASSWORD || 'none';

var client_id = CLIENT_ID; // Your client id
var client_secret = CLIENT_SECRET; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

//database
var mysql = require('mysql2');

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();
var router = express.Router();

//database stuff
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: SQL_PASSWORD,
  database: 'sitepoint'
});

//console.log("meowmeow")
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//READING
con.query('SELECT * FROM annotations0', (err,rows) => { //Process via parsing.
  if(err) throw err;

  console.log('Data received from Db:');
  console.log(rows);
});

//CREATING (when song doesn't exist yet)
const song = { song: 'new_song', data: 'new_data' }; //take in user input !TODO
con.query('INSERT INTO annotations0 SET ?', song, (err, res) => {
  if(err) throw err;

  console.log('Last insert ID:', res.insertId);
});

//UPDATING (when a song gets a new annotation)
con.query(
  'UPDATE annotations0 SET data = ? Where song = ?',
  ['updated_data', 'new_song'],
  (err, result) => {
    if (err) throw err;

    console.log(`Changed ${result.changedRows} row(s)`);
  }
);


//KOT SUS
var songName = 'KillShot' //song being annotated
var colNum = 0 //the next availible column
var data = "NEWLY INSERTED" //the data being inserted

con.connect(function(err) {
  if (err) throw err;
  var sql = "INSERT INTO annotations0 (colNum) VALUES (data) WHERE song = 'songName'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted, ID: " + result.insertId);
  });
});



//closing the database, don't add database stuff after this
con.end((err) => {
  // The connection is terminated gracefully
  // Ensures all remaining queries are executed
  // Then sends a quit packet to the MySQL server.
});
//end database stuff

//more stuff from sus website lol
// We are using our packages here
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
 extended: true})); 
app.use(cors())
//end stuff

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
  
  //Start your server on a specified port
  app.listen(port, ()=>{
    console.log(`Server is runing on port ${port}`)
  })

});

//Route that handles annotation logic
app.post('/annotate', (req, res) =>{ 
  var data = req;
  console.log(data.body) //req.body.annotation
  res.end("meow!!!")
})

console.log('Listening on 8888');
app.listen(8888);
