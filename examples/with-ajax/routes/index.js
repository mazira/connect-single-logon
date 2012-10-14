
/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log(req.session)

  if (req.session && req.session.logged_in) {
    res.render('index', { username: req.session.username });
  }
  else {
    res.redirect('/login');
  }
};
