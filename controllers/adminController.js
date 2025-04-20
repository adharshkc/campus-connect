const { getAdmin } = require("../services/admin");
const { getAllDepartments, createDepartment } = require("../services/department");
const {
  getAllStaffs,
  createStaff,
  deleteStaff,
  getStaffById,
  editStaff,
} = require("../services/staff");
const { getAllStudents } = require("../services/student");

const getAdminDashboard = async (req, res, next) => {
  try {
    // console.log("akd");
    const { userId, role } = req.session;
    const admin = await getAdmin(userId);
    const students = await getAllStudents();
    const staffs = await getAllStaffs();
    const department = await getAllDepartments();
    const studentCount = students.length;
    const staffCount = staffs.length;
    const departmentCount = department.length;
    const topFiveStaffs = staffs.slice(0, 5);
    const topStudents = students.slice(0, 5);
    // console.log(admin);
    return res.render("adminDashboard", {
      studentCount,
      staffCount,
      departmentCount,
      topFiveStaffs,
      topStudents,
      admin,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAdminStudent = async (req, res, next) => {
  try {
    const students = await getAllStudents();
    // console.log(students);
    const { userId, role } = req.session;

    const admin = await getAdmin(userId);
    return res.render("adminStudentDashboard", { students, admin });
  } catch (error) {
    console.log(error);
  }
};
const getAdminTeacher = async (req, res, next) => {
  try {
    const staffs = await getAllStaffs();
    const { userId, role } = req.session;

    const admin = await getAdmin(userId);
    return res.render("adminTeacherDashboard", { staffs, admin });
  } catch (error) {
    console.log(error);
  }
};
const getAddTeacher = async (req, res, next) => {
  try {
    const { userId, role } = req.session;

    const admin = await getAdmin(userId);
    return res.render("add-teacher", { admin });
  } catch (error) {
    console.log(error);
  }
};
const getEditTeacher = async (req, res, next) => {
  try {
    const { userId, role } = req.session;
    const { id } = req.params;
    const staff = await getStaffById(id);
    const admin = await getAdmin(userId);
    return res.render("edit-teacher", { admin, staff });
  } catch (error) {
    console.log(error);
  }
};

const addTeacher = async (req, res) => {
  try {
    const {
      name,
      gender,
      phone,
      joiningDate,
      subject,
      designation,
      department,
      username,
      email,
      password,
    } = req.body;
    const staff = {
      name,
      gender,
      phone,
      joiningDate,
      subject,
      designation,
      department,
      username,
      email,
      password,
    };
    const user = await createStaff(staff);
    res.redirect("/admin/teachers");
  } catch (error) {
    console.log(error);
  }
};

const editTeacher = async (req, res) => {
  try {
    const {
      id,
      name,
      gender,
      phone,
      subject,
      designation,
      department,
      // username,
      // email,
    } = req.body;
    const staff = {
      id,
      name,
      gender,
      phone,
      subject,
      designation,
      department,
      // username,
      // email,
    };
    console.log(staff);
    await editStaff(staff);
    res.redirect("/admin/teachers");
  } catch (error) {
    console.log(error);
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const deletedStaff = await deleteStaff(id);
    console.log(deletedStaff);
    res.redirect("/admin/teachers");
  } catch (error) {}
};

const getDepartment = async (req, res) => {
  try {
    const { userId, role } = req.session;
    const admin = await getAdmin(userId);
    const departments = await getAllDepartments()
    console.log(departments)
    res.render("adminDepartmentDashboard", { admin, departments });
  } catch (error) {}
};

const getAddDepartment = async (req, res,)=>{
  try {
    const { userId, role } = req.session;
    const admin = await getAdmin(userId);
    res.render("add-department", {admin})
  } catch (error) {
    
  }
}

const addDepartment = async (req, res)=>{
  try {
    const {name, code} = req.body;
    const department = await createDepartment(name, code)
    res.redirect("/admin/departments")
  } catch (error) {
    
  }
}

const getEditDepartment = async(req, res)=>{
  const { userId, role } = req.session;
    const admin = await getAdmin(userId);
    res.render("edit-department", {admin})
}

const editDepartment = async (req, res)=>{
  try {
    const {name, code} = req.body;
    await departmentEdit(name,code)
    res.redirect("/admin/departments")
  } catch (error) {
    
  }
}

module.exports = {
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
  editDepartment,
  getEditDepartment
};
