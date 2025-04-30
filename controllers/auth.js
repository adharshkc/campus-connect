const prisma = require("../prisma/client");
const authService = require("../services/auth");




const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user =  await prisma.user.findUnique({ where: { username } });
    
    if(!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    console.log(username, password, user)
    if(user.passwordHash !== password) {
      return res.render('login', { error: 'Invalid password' });
    }
    req.session.userId = user.id;
    req.session.role = user.userType;
    switch(user.userType) {
      case 'admin':
        return res.redirect('/admin/dashboard/');
      case 'staff':
        return res.redirect('/staff/dashboard');
      case 'student':
        return res.redirect('/student/dashboard');
      default:
        return res.redirect('/');
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
};
function getLogin (req, res){
    if(req.session.user){
        return res.redirect("/student")
    }
    res.render('login')
}

function getStudentDashboard(req, res){
    res.render('studentDashboard',{user: req.session.user})
}

function logout(req, res){
    req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.redirect("/student");
        }
        res.redirect("/login"); 
      });
}

module.exports = {login, getLogin, getStudentDashboard, logout}