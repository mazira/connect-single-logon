exports.login = function(req, res) {
  if (req.session && req.session.logged_in)
    res.redirect("/")

  res.render('login', { loginfailure: req.flash('login-errors') });
}

exports.logout = function(req, res) {
  req.session.destroy();
  res.redirect("/");
}

exports.processLogin = function(req, res) {
  username = req.body.username;
  password = req.body.password;

  if (username == undefined || username.length == 0) {
    // we cannot let this user in unless a valid username is specified
    req.flash('login-errors', 'Please specify a valid username');
    res.redirect('/login');
  }
  else {
    // make sure that this session is exclusive
    req.session.logged_in = true;
    req.session.username = username;

    req.session.makeExclusive();

    res.redirect("/")
  }
}

exports.userKey = function (req) {
  return req.session.username;
}

exports.flushSession = function(req) {
  req.session.logged_in = false;
}

exports.checkLogin = function(req, res) {
  var login_status = (req.session && req.session.logged_in);
  res.json({ logged_in: login_status });
}
