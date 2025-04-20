const viewController = {
    getLogin: (req, res) => {
        // Redirect to home if already logged in
        if (req.user) {
          return res.redirect('/');
        }
        res.render('login', { error: null });
      },
    
}


module.exports = viewController