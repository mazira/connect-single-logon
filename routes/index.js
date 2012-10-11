
/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log(req.session)

  if (req.session && req.session.login_id == req.session.valid_login_id) {
    res.render('index', { username: req.session.username });
  }
  else {
    res.redirect('/login');
  }
};
