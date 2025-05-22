const express = require("express");
const {
  getLogin,
  getStudentDashboard,
  login,
  logout,
  getProfile,
} = require("../controllers/auth");
// const { protect } = require("../middlewares/authentication");
const viewController = require("../controllers/viewController");
const router = express.Router();

router.get("/login", viewController.getLogin)
router.post("/login", login);
// router.get("/student", getStudentDashboard);
router.get("/logout", logout);
router.get("/profile", getProfile)
// router.post("/forgot-password", forgotPassword);

module.exports = router;
