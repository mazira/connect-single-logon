exports.login = function(req, res) {
  if (req.session && req.session.login_id == req.session.valid_login_id)
    res.redirect("/")

  res.render('login', { loginfailure: req.flash('login-errors') });
}

exports.logout = function(req, res) {
  req.session.destroy();
  res.redirect("/");
}

exports.process_login = function(req, res) {
  username = req.body.username;
  password = req.body.password;

  if (username == undefined || username.length == 0) {
    // we cannot let this user in unless a valid username is specified
    req.flash('login-errors', 'Please specify a valid username');
    res.redirect('/login');
  }

  req.session.regenerate(function(err) {
    req.session.login_id = crypto.randomBytes(48, function(ex, buf) {
      var token = buf.toString('hex');
    });
    req.session.valid_login_id = req.session.login_id
    req.session.username = username;

    res.redirect("/")
  });
}

