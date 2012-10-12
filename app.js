
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , flash = require('connect-flash')
  , path = require('path')
  , crypto = require('crypto');

var app = express();

/**
 * This module accepts two arguments:
 * @unique_user     A function that is called to uniquely identify a user(e.g. A user id)
 * @flush_session   A function that will flush a user's session (clear the state which makes your
 *                  auth system recognize a user)
 */
singleLogon = function (uniqueUser, flushSession) {
  return function(req, res, next) {
    if (!req.session || !req.sessionStore) throw new Error("Please include this middleware after session");

    function secureKey() {
      return crypto.randomBytes(48).toString('hex');
    }

    function storeKey(user) {
      var key = user || uniqueUser(req);
      return "singleLogonUserId." + key;
    }

    function storeValidKey(user, key) {
      var dummy = { cookie: { _expires: null }, singleLogonId: key };
      console.log("Storing: " + dummy);
      return req.sessionStore.set(storeKey(), dummy, function(err) {
        console.log("Saved key with data: " + dummy);
      });
    }

    function getValidKey(user, fn) {
      req.sessionStore.get(storeKey(), function(err, sess) {
        if (err)
          fn(err)
        else {
          console.log(sess)
          fn(null, sess.singleLogonId)
        }
      });
    }

    // Provide a function to set this session as the active session
    req.makeSessionExclusive = function() {
      var userKey = uniqueUser(req);
      if (!userKey) throw new Error("Make sure you can provide a unique user id before calling makeSessionExclsive");
    
      var key = secureKey();

      storeValidKey(userKey, key);
      req.session.singleLogonSecureKey = key;
    }

    //
    // get this user's key, if we cannot determine at this time, it mostly means
    // that no user is logged in, which actually should have been taken care by
    // deleting the singleLogonSecureKey.
    userKey = uniqueUser(req)
    if (!userKey) return next();

    // if the secure key hasn't been set, we cannot really validate anything
    if (!req.session.singleLogonSecureKey) return next();
    
    console.log("Key is set");

    getValidKey(userKey, function(err, currentValidKey) {
      if (err) {
        console.log("Middleware failure: Could not load session store key");
        return next();
      }
      if (!currentValidKey) return next(); // we cannot really do much if we don't have a valid key to match

      console.log(currentValidKey + ", " + req.session.singleLogonSecureKey);

      // if this user's key matches the current user's key, let him/her in
      if (currentValidKey == req.session.singleLogonSecureKey) {
        console.log("Key match");
        return next();
      }
      else {
        // no match, we have reset our key and this user is using an older one, do this 
        // only when we had a key for this userKey
        console.log("Flushing session");
        flushSession(req);
        req.session.singleLogonSecureKey = undefined;
      }

      console.log("I was called yay!");
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
  app.use(singleLogon(user.userKey, user.flushSession)),
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

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
