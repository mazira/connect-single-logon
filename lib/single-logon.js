/*!
 * single-login
 * Copyright(C) 2012 Mazira LLC.
 * Copyright(C) 2012 Uday K Verma.
 */

exports = module.exports = function (options) {
  var fnUnique;
  var fnFlushSession;

  if (options) {
    var fnUnique = options.uniqueUser;
    var fnFlushSession = options.flushSession;
  }

  if (!fnUnique) throw new Error("uniqueUser parameter is required");
  fnFlushSession = fnFlushSession || function(req, cb) { 
    req.session.regenerate(cb);
  };

  return function(req, res, next) {
    if (!req.session || !req.sessionStore) throw new Error("Please include this middleware after session");

    function storeKey(user) {
      var key = user || fnUnique(req);
      return "singleLogon." + key + ".activeSessionID";
    }

    function storeValidSessionID(user, sessionID) {
      var dummy = { cookie: { expires: req.session.cookie.expires }, singleLogonID: sessionID };
      req.sessionStore.set(storeKey(), dummy, function(err) {
        if (err) {
          console.log("Failed to store key with: " + dummy);
          console.log(err);
        }
      });
    }

    function getValidSessionID(user, fn) {
      req.sessionStore.get(storeKey(), function(err, sess) {
        if (err)
          fn(err);
        else {
          fn(null, sess && sess.singleLogonID);
        }
      });
    }

    // Provide a function to set this session as the active session
    req.session.makeExclusive = function() {
      var userKey = fnUnique(req);
      if (!userKey) throw new Error("Make sure you can provide a unique user id before calling session.makeExclusive");
    
      storeValidSessionID(userKey, req.sessionID);
    }

    //
    // get this user's key, if we cannot determine at this time, it mostly means
    // that no user is logged in, which actually should have been taken care by
    // deleting the singleLogonSecureKey.
    userKey = fnUnique(req);
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
      if (currentValidSessionID === req.sessionID) return next();

      // no match
      fnFlushSession(req, function(err) {
        if (err) console.log("Failed to regenerate session");
	return next();
      });
    });
  };
};
