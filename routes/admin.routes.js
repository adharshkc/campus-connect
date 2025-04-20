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
} = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/authentication");
const router = express.Router();

router.get("/admin/dashboard/", isAdmin, getAdminDashboard);
router.get("/admin/students", isAdmin, getAdminStudent);
router.get("/admin/teachers", isAdmin, getAdminTeacher);
router.get("/admin/addTeacher", isAdmin, getAddTeacher);
router.post("/admin/teacher", isAdmin, addTeacher);
router.get("/admin/delete-teacher/:id", isAdmin, deleteTeacher)
router.get('/admin/editTeacher/:id', isAdmin, getEditTeacher)
router.post('/admin/editTeacher', isAdmin, editTeacher)
router.get('/admin/departments', isAdmin, getDepartment)
router.get('/admin/addDepartment', isAdmin, getAddDepartment)
router.get('/admin/editDepartment/:id', isAdmin, getEditDepartment)
router.post('/admin/department', isAdmin, addDepartment)
router.post('/admin/editDepartment', isAdmin, editDepartment)
router.get('/admin/deleteDepartment/:id', isAdmin, deleteDep)

module.exports = router;
