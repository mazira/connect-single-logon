# What is this?

This is a connect middleware to only allow one session per user.  If a user logs in from more than one location only the most recent location is kept valid and sessions of all other locations are expired(or destroyed).

# Installation

  $ npm install connect-single-logon

# Usage

To use this middleware, include it in your list of middlewares.  This middleware requires session to work and uses session storage to keep track of which sessions to expire and which one to keep active.  This means that you need to include this middleware after the session middleware.  Please see the with-ajax example for a complete application which uses this middleware.

To get this to work, you first install the middle ware

  app.use(express.cookieParser('SuperAwesomeSecret1231421312412312412312412312412'));
  app.use(express.session());
  app.use(singleLogon({ uniqueUser: function(req) {
    return req.session.username;
  });

The uniqueUser function is a required paramter.  It's a callback which is used to uniquely identify a user.  Only one of the sessions
belonging to a user will be kept active.

To mark a session exclusive for a user, e.g. right after successful authentication, you need to call req.session.makeExclusive function.

  if (authenticated()) {
    req.session.logged_in = true;
    req.session.username = username;

    req.session.makeExclusive();
  }

This makes the session exclusive for the newly logged in user.  Any other session for this user which tries to access any of your web resources will now be destroyed.  

If you don't want the whole session to be destroyed, you can provide a flushSession function as an argument when initializing this middleware. E.g. if your website determine's a user's current status as logged-in by keeping track of a session variable logged_in, then just merely setting this variable to false will prevent user from logging in.  This way you can still maintain state in the session while logging the user out.

  app.use(express.cookieParser('SuperAwesomeSecret1231421312412312412312412312412'));
  app.use(express.session());
  app.use(singleLogon({ 
    uniqueUser: function(req) {
      return req.session.username;
    },
    flushSession: function(req) {
      req.session.logged_in = false;
    }));

# Options

### uniqueUser (Required)
A function callback which will be called by the middleware to determine which unique user the session belongs to.  You need to return something that uniquely identifies users on your website.

### flushFunction
A callback called by the middleware to clear the logged in state for a user.  The default action is to completely delete the session.

# LICENSE
(The MIT License)

Copyright (C) 2012 Uday Verma (uday.karan@gmail.com)

Copyright (C) 2012 Mazira, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
