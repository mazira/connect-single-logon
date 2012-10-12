
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , flash = require('connect-flash')
  , path = require('path')

var app = express();

/**
 * This module accepts two arguments:
 * @unique_user     A function that is called to uniquely identify a user(e.g. A user id)
 * @flush_session   A function that will flush a user's session (clear the state which makes your
 *                  auth system recognize a user)
 */
singleLogon = function (options) {
  var fnUnique = options.uniqueUser;
  var fnFlushSession = options.flushSession || function(req) { 
    req.session.destroy(function(err) {
      console.log("Regenerate");
      if (err) console.log("Failed to regenerate session"); }); };

  if (!fnUnique) throw new Error("uniqueUser parameter is required")

  return function(req, res, next) {
    if (!req.session || !req.sessionStore) throw new Error("Please include this middleware after session");

    function storeKey(user) {
      var key = user || fnUnique(req);
      return "singleLogon." + key + ".activeSessionID";
    }

    function storeValidSessionID(user, sessionID) {
      var dummy = { cookie: { _expires: null }, singleLogonID: sessionID };
      return req.sessionStore.set(storeKey(), dummy, function(err) {
        if (err) {
          console.log("Failed to store key with: " + dummy);
        }
      });
    }

    function getValidSessionID(user, fn) {
      req.sessionStore.get(storeKey(), function(err, sess) {
        if (err)
          fn(err);
        else {
          fn(null, sess.singleLogonID);
        }
      });
    }

    // Provide a function to set this session as the active session
    req.makeSessionExclusive = function() {
      var userKey = fnUnique(req);
      if (!userKey) throw new Error("Make sure you can provide a unique user id before calling makeSessionExclsive");
    
      storeValidSessionID(userKey, req.sessionID);
    }

    //
    // get this user's key, if we cannot determine at this time, it mostly means
    // that no user is logged in, which actually should have been taken care by
    // deleting the singleLogonSecureKey.
    userKey = fnUnique(req)
    if (!userKey) return next();

    // the user doesn't have a session id yet?
    if (!req.sessionID) return next();
    
    getValidSessionID(userKey, function(err, currentValidSessionID) {
      if (err) {
        console.log("Middleware failure: Could not load session store key");
        return next();
      }
      if (!currentValidSessionID) return next(); // we cannot really do much if we don't have a valid key to match

      // if this user's key matches the current user's key, let him/her in
      if (currentValidSessionID != req.sessionID) {
        // no match
        fnFlushSession(req);
      }

      return next();
    });
  }
}

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
