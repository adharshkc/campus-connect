const prisma = require("../prisma/client");


const viewController = {
    getLogin: (req, res) => {
        // Redirect to home if already logged in
        if (req.user) {
          return res.redirect('/');
        }
        res.render('login', { error: null });
      },
    
      getForgotPassword : (req, res) => {
         // Render the forgot password page
         res.render('forgotPassword', { message: null });
}
, 
       getResetPassword: async (req, res) => {
        // Validate the reset token
        const { token } = req.params;
        try {
            const user = await prisma.user.findFirst({
                where: {
                    token: token,
                }
            });
            if (!user) {
                return res.render('newPassword', { token: null, error: "Invalid or expired reset token." });
            }
            res.render('newPassword', { token, error: null });
        } catch (error) {
            console.error(error);
            res.render('newPassword', { token: null, error: "An error occurred. Please try again." });
        }
    
    },
    postNewPassword: async (req, res) => {
        // Handle new password submission
        const { token } = req.body;
        const { password } = req.body;
        console.log("New password request received:", token, password);
        try {
            const user = await prisma.user.findFirst({
                where: {
                    token: token,
                }
            });
            if (!user) {
                return res.render('password', { token: null, error: "Invalid or expired reset token." });
            }
            console.log(user)
            // Update the user's password and clear the reset token
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordHash: password, // Hash the password in a real application
                    token: null,
                },
            });
            res.render('login', { error: "Password updated successfully. Please log in." });
        } catch (error) {
            console.error(error);
            res.render('new', { token, error: "An error occurred. Please try again." });
        }
    }

};


module.exports = viewController;