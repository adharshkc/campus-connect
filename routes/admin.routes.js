const express = require("express");
const {
  getAdminDashboard,
  getAdminStudent,
  addTeacher,
  getAdminTeacher,
  getAddTeacher,
  deleteTeacher,
  getEditTeacher,
  editTeacher,
  getDepartment,
  addDepartment,
  getAddDepartment,
  getEditDepartment,
  editDepartment,
  deleteDep,
  getReports,
  deleteReport,
  getVehicle,
  getAddVehicle,
  addVehicle,
  getEditVehicle,
  editVehicle,
  deleteVehicle,
  getAdminEvents,
  getAddEvent,
  getEditEvent,
  addEvent,
  deleteEvent,
  getAdminSubjects,
  getAddSubject,
  addSubject,
  deleteSubject,
  getSingleEvent,
} = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/authentication");
const router = express.Router();

router.get("/admin/dashboard/", isAdmin, getAdminDashboard);
router.get("/admin/students", isAdmin, getAdminStudent);
router.get("/admin/teachers", isAdmin, getAdminTeacher);
router.get("/admin/addTeacher", isAdmin, getAddTeacher);
router.post("/admin/teacher", isAdmin, addTeacher);
router.get("/admin/delete-teacher/:id", isAdmin, deleteTeacher);
router.get("/admin/editTeacher/:id", isAdmin, getEditTeacher);
router.post("/admin/editTeacher", isAdmin, editTeacher);
router.get("/admin/departments", isAdmin, getDepartment);
router.get("/admin/addDepartment", isAdmin, getAddDepartment);
router.get("/admin/editDepartment/:id", isAdmin, getEditDepartment);
router.post("/admin/department", isAdmin, addDepartment);
router.post("/admin/editDepartment", isAdmin, editDepartment);
router.get("/admin/deleteDepartment/:id", isAdmin, deleteDep);
router.get("/admin/reports", isAdmin, getReports);
router.get("/admin/deleteReport", isAdmin, deleteReport);
router.get("/admin/vehicles", isAdmin, getVehicle);
router.get("/admin/addVehicle", isAdmin, getAddVehicle)
router.post("/admin/addVehicle", isAdmin, addVehicle )
router.get("/admin/editVehicle/:id", isAdmin, getEditVehicle)
router.post("/admin/editVehicle", isAdmin, editVehicle)
router.get("/admin/deleteVehicle/:id", isAdmin, deleteVehicle)
router.get("/admin/events", isAdmin, getAdminEvents)
router.get('/admin/addEvent', isAdmin, getAddEvent)
router.get('/admin/editEvent/:id', isAdmin, getEditEvent)
router.post('/admin/addEvent', isAdmin, addEvent)
// router.post('/admin/editEvent', isAdmin, editEvent)
router.get('/admin/deleteEvent/:id', isAdmin, deleteEvent)
router.get('/admin/subjects', isAdmin, getAdminSubjects)
router.get('/admin/addSubject', isAdmin, getAddSubject)
router.post('/admin/addSubject', isAdmin, addSubject)
router.get('/admin/deleteSubject/:id', isAdmin, deleteSubject)
router.get("/admin/event/:eventId", isAdmin, getSingleEvent);


module.exports = router;
