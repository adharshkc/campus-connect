const express = require("express");
const { isStaff } = require("../middlewares/authentication");
const {
  getDashboard,
  getStudentDashboard,
  getAddStudent,
  addStudent,
  deleteStudent,
  getAttendance,
  addPresentAttendance,
  addAbsentAttendance,
  getDepartment,
  getVehicle,
  getEvent,
  addLate,
  getCommunity,
} = require("../controllers/staffController");
// const { getCommunity } = require("../controllers/studentController");

const router = express.Router();

router.get("/staff/dashboard", isStaff, getDashboard);
router.get("/staff/studentDashboard", isStaff, getStudentDashboard);
router.get("/staff/addStudent",isStaff, getAddStudent);
router.post("/staff/addStudent",isStaff, addStudent);
router.get("/staff/deleteStudent/:id", isStaff, deleteStudent);
router.get("/staff/attendance", isStaff, getAttendance);
router.post("/staff/attendance/present", isStaff, addPresentAttendance);
router.post("/staff/attendance/absent", isStaff, addAbsentAttendance);
router.get("/staff/departmentDashboard", isStaff, getDepartment);
router.get("/staff/vehicleDashboard", isStaff, getVehicle);
router.get("/staff/eventDashboard", isStaff, getEvent);
router.post("/staff/attendance/late", isStaff, addLate);
router.get("/staff/community", isStaff, getCommunity)


module.exports = router;
