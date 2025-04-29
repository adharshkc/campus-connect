const express = require("express");
const { isStudent } = require("../middlewares/authentication");
const {
  getStudentDashboard,
  getStudentProfile,
  getStudentAttendance,
  getTeacher,
  getSubject,
  getEvent,
  getVehicle,
  getComplaint,
  getAddComplaint,
  addComplaint,
  getChats,
  chats,
  getCommunity,
  addCommunity,
} = require("../controllers/studentController");

const router = express.Router();

router.get("/student/dashboard", isStudent, getStudentDashboard);
router.get("/student/profile", isStudent, getStudentProfile);
router.get("/student/attendance", isStudent, getStudentAttendance);
router.get("/student/teacher", isStudent, getTeacher);
router.get("/student/subject", isStudent, getSubject);
router.get("/student/event", isStudent, getEvent);
router.get("/student/vehicle", isStudent, getVehicle);
router.get("/student/complaints", isStudent, getComplaint);
router.get("/student/addComplaints", isStudent, getAddComplaint);
router.post("/student/complaint", isStudent, addComplaint);
router.get("/student/chat",isStudent, getChats)
router.post("/student/chat", isStudent,  chats)
router.get("/student/community", isStudent, getCommunity);
router.post("/student/community", isStudent, addCommunity);
module.exports = router;
