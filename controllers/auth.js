const prisma = require("../prisma/client");
const { getAdmin } = require("../services/admin");
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

async function getProfile(req, res){

      const { userId, role } = req.session;
      console.log(userId, role)
      try {
    let profile;

    switch (role) {
      case 'admin':
        profile = await prisma.adminProfile.findUnique({
          where: { userId },
          include: { user: true }
        });
        break;

      case 'student':
        profile = await prisma.studentProfile.findUnique({
          where: { userId },
          include: { user: true, department: true }
        });
        break;

      case 'staff':
        profile = await prisma.staffProfile.findUnique({
          where: { userId },
          include: { user: true, department: true }
        });
        break;

      default:
        return res.status(400).send("Invalid user role");
      }
      console.log(profile)
      const admin = await getAdmin(userId);
      res.render('profile', {admin, profile});
  } catch (error) {  
    console.error("Error fetching profile:", error);
  }
}

// const forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await authService.forgotPassword(email);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Send email with reset link
//     res.status(200).json({ message: "Reset link sent to your email" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

module.exports = {login, getLogin, getStudentDashboard, logout, getProfile}