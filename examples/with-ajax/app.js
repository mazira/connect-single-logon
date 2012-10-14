
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , flash = require('connect-flash')
  , path = require('path')

try {
  var singleLogon = require("../../");
}
catch(err) {
  var singleLogon  = require("connect-single-logon");
}

var app = express();

/**
 * This module accepts two arguments:
 * @unique_user     A function that is called to uniquely identify a user(e.g. A user id)
 * @flush_session   A function that will flush a user's session (clear the state which makes your
 *                  auth system recognize a user)
 */
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('SuperAwesomeSecret1231421312412312412312412312412'));
  app.use(express.session());
  app.use(singleLogon({ uniqueUser: user.userKey }));
  app.use(flash())
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/login', user.login);
app.post('/login', user.processLogin);
app.get('/logout', user.logout);
app.post('/api/checklogin', user.checkLogin);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
