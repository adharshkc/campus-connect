const prisma = require("../prisma/client");
const { getAdmin } = require("../services/admin");
const authService = require("../services/auth");
const nodemailer = require("nodemailer");

const crypto = require('crypto');


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
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',  // SMTP server address
  port: 587,                 // Port for SMTP (usually 587 for TLS or 465 for SSL)
  secure: false,             // true for 465, false for other ports
  auth: {
    user: 'Campusconnectsoftware@gmail.com',
    pass: 'nhdn mpwa fqpn ckvq'
  }
});
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user =  await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.render('forgotPassword', { message: "Email not found" });
    }
     const resetToken = crypto.randomBytes(32).toString('hex');
    // const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    await prisma.user.update({
      where: { id: user.id },
      data: {
        token:resetToken,
      }
    });
     const mailOptions = {
      from: '"Campus Connect" <Campusconnectsoftware@gmail.com>',
      to: email,
      subject: 'Password Reset Request',
      text: `Dear ${user.username},\n\nWe received a request to reset your password. If you did not make this request, please ignore this email.\n\nTo reset your password, please click the link below:\n\nhttp://localhost:3000/reset-password/${resetToken}\n\nIf you have any questions, feel free to contact us.\n\nBest regards,\nCampus Connect Team`,
      html: `
        <p>Dear ${user.username},</p>
        <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
        <p>To reset your password, please click the link below:</p>
        <p><a href="http://localhost:3000/reset-password/${resetToken}">Reset Password</a></p>
      `
    };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.error('Error:', error);
        }
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
      });

    // Send email with reset link
    res.render('forgotPassword', { message: "Password reset link sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {login, getLogin, getStudentDashboard, logout, getProfile, forgotPassword};