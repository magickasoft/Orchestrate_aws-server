var express = require('express'),
  app = express(),
  cors = require('cors'),
  mongoose = require("mongoose"),
  path = require('path'),
  bodyParser = require('body-parser'),
  http = require('http').Server(app),
  jwt = require('express-jwt'),
  cookieParser = require('cookie-parser'),
  JWT = require('jsonwebtoken');
  io = require('socket.io')(http);

// routes of static files and aliases for main pages
app.use( express.static('public') );

app.use( bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json() );
app.use( cors() );
app.use( cookieParser() );

// token is kept in "Authorisation" header
// after "Bearer " wording

var jwtTokenSecret = "ORCHESTRate2016";
var jwtGetToken = function( req ) {

  if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
          var scheme = parts[0];
          var credentials = parts[1];
          if (/^Bearer$/i.test(scheme)) { return credentials; }
      }
  }
  if ( req.cookies.access_token ) {
      return req.cookies.access_token;
  }
  return "";
};

var jwtOptions = { secret: jwtTokenSecret, getToken : jwtGetToken };
var jwtOptionsOptional =  { secret: jwtTokenSecret, getToken : jwtGetToken, "credentialsRequired": false };

var morgan = require('morgan');

var accessLogStream = require('file-stream-rotator').getStream( {
        filename: path.join(__dirname, './public/log') + "/access-%DATE%.log",
        frequency: "daily",
        date_format: "YYYYMMDD",
        verbose: true });

app.use( morgan('combined', { stream: accessLogStream } ) );

var util = require( "./model/Util.model.js" );

app.use( function( req, res, next ) {
    if ( req.headers['x-device'] !== undefined ) {
       util.trace( "DEVICE=" + req.headers['x-device'] + (( req.headers['x-group'] !== undefined ) ? " GROUP=" + req.headers['x-device']  : "" )  );
    }
    next();
});

// serving static HTML files
app.get('/', function(req, res){ res.sendFile( 'index.html', { root: path.join(__dirname, './public') } ); });
app.get('/conductor', function(req, res){ res.sendFile( 'conductor.html', { root: path.join(__dirname, './public') } ); });


app.get('/dashboard', jwt( jwtOptions ),
  function(req, res){
    util.log( "/dashboard?"  + JSON.stringify( req.query ));
    res.sendFile( 'dashboard.html', { root: path.join(__dirname, './public') } );
});


// plain HTML page
app.get('/auth', jwt( jwtOptionsOptional ), function(req, res){
    util.log( "/auth?"  + JSON.stringify( req.query ));
    if ( req.user !== undefined && req.user.iss !== undefined ) {
        util.log( "USER=" + JSON.stringify( req.user ) );
        res.redirect('../dashboard');
        return;
    }
    res.sendFile( 'auth.html', { root: path.join(__dirname, './public') } );
} );

// JSON action for token verification
app.get( "/api/auth", jwt( jwtOptionsOptional ), function(req, res){
    util.log( "/api/auth?"  + JSON.stringify( req.query ));
    if ( req.user !== undefined && req.user.iss !== undefined ) {
        util.log( "USER=" + JSON.stringify( req.user ) );
        res.status(200).json( req.user );
        return;
    }
    res.status(403).json( [] );
} );

// connecting to the database
//var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
//                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };
mongoose.connect( require( "./config/db.js" ).connection );
var db = mongoose.connection;
db.on('error', console.error.bind( console, 'database connection error:') ); // TODO: can be moved to the midware

// compiling Mongo models
require( "./model/Group.model.js" )(mongoose);
require( "./model/Song.model.js" )(mongoose);
require( "./model/Instrument.model.js" )(mongoose);
require( "./model/Member.model.js" )(mongoose);
require( "./model/Recording.model.js" )(mongoose);
require( "./model/User.model.js" )(mongoose);


app.post( "/api/oauth/token", function( req, res ) {
    //console.log( "req.body=" + JSON.stringify( req.body ) );
    if ( req.body.username && req.body.password ) {

       mongoose.model("User").findOne( {
          Login: req.body.username,
          Password: req.body.password
       }).exec( function( err, data ) {

          if ( util.noError( err, req, res ) ) {
            if ( ! data ) {
              util.warn( "User " + req.body.username + " was not found" );
              res.status(403).json( { "error" : "Please provide valid user/password"} );
            } else {
              var d = {

                Login: data.Login,
                Enabled: data.Enabled,

                access_token : JWT.sign({
                    iss: data.Login, expiresInMinutes: 1440 // expires in 24 hours
                }, jwtTokenSecret )
              };

              util.log( "Found: " + JSON.stringify( d ));
              res.status(200).json( d );
            }
          }
       });

    } else {
       res.status( 403 );
    }

});

app.post( "/api/oauthGroup/token", function( req, res ) {
    //console.log( "req.body=" + JSON.stringify( req.body ) );
    if ( req.body.logincode) {

        mongoose.model("Group").findOne( {
            LoginCode: req.body.logincode
        }).exec( function( err, data ) {
                if ( ! data ) {
                    res.status(403).json( { "error" : "Please provide valid LoginCode"} );
                } else {
                    var d = {
                        LoginCode: data.LoginCode
                    };
                    res.status(200).json( d );
                }
        });

    } else {
        res.status( 403 );
    }

});


// serving dynamic application routes
require( "./controller/groups.ctrl.js")( app, io, mongoose );
require( "./controller/instruments.ctrl.js")( app, io, mongoose );
require( "./controller/members.ctrl.js")( app, io, mongoose );
require( "./controller/songs.ctrl.js")( app, io, mongoose );
require( "./controller/recordings.ctrl.js")( app, io, mongoose );
require( "./controller/recordings.admin.ctrl.js")( app, io, mongoose );
require( "./controller/users.ctrl.js")( app, io, mongoose );

// ok. ready to start and listen to the port
var args = process.argv.slice(2);
var port = args[0] !== undefined ? args[0] : 3000;
http.listen( port, function(){ console.log( (new Date()).toUTCString() + ' listening on *:' + port ); });

