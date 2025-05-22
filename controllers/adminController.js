const prisma = require("../prisma/client");
const { getAdmin } = require("../services/admin");
const {
  getAllDepartments,
  createDepartment,
  departmentEdit,
  getDepById,
  depDelete,
} = require("../services/department");
const { getAllEvents, createEvent, getEventById, delEvent } = require("../services/event");
const { reportDelete, getAllReports } = require("../services/report");
const {
  getAllStaffs,
  createStaff,
  deleteStaff,
  getStaffById,
  editStaff,
} = require("../services/staff");
const { getAllStudents } = require("../services/student");
const { getAllSubjects, createSubject, delSubject } = require("../services/subject");
const {
  getAllVehicles,
  createVehicle,
  getVehicleById,
  editVeh,
  delVehicle,
} = require("../services/vehicles");
const nodemailer = require("nodemailer");
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
    const departments = await getAllDepartments()

    return res.render("add-teacher", { admin, departments });
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
    await editStaff(staff);
    res.redirect("/admin/teachers");
  } catch (error) {
    console.log(error);
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStaff = await deleteStaff(id);
    res.redirect("/admin/teachers");
  } catch (error) {}
};

const getDepartment = async (req, res) => {
  try {
    const { userId, role } = req.session;
    const admin = await getAdmin(userId);
    const departments = await getAllDepartments();
    res.render("adminDepartmentDashboard", { admin, departments });
  } catch (error) {}
};

const getAddDepartment = async (req, res) => {
  try {
    const { userId, role } = req.session;
    const admin = await getAdmin(userId);
    res.render("add-department", { admin });
  } catch (error) {}
};

const addDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    const department = await createDepartment(name, code);
    res.redirect("/admin/departments");
  } catch (error) {}
};

const getEditDepartment = async (req, res) => {
  const { userId, role } = req.session;
  const { id } = req.params;
  const admin = await getAdmin(userId);
  const departments = await getDepById(parseInt(id));
  res.render("edit-department", { admin, departments });
};

const editDepartment = async (req, res) => {
  try {
    const { name, code, id } = req.body;
    console.log(req.body);
    await departmentEdit(name, code, parseInt(id));
    res.redirect("/admin/departments");
  } catch (error) {}
};

const deleteDep = async (req, res) => {
  const { id } = req.params;
  await depDelete(parseInt(id));
  res.redirect("/admin/departments");
};

const getReports = async (req, res) => {
  const { userId, role } = req.session;
  const admin = await getAdmin(userId);
  const reports = await getAllReports();
  console.log(reports);
  res.render("adminReportDashboard", { admin, reports });
};

const deleteReport = async (req, res) => {
  const { id } = req.params;
  await reportDelete(id);
  res.redirect("/admin/reports");
};

const getVehicle = async (req, res) => {
  const { userId, role } = req.session;
  const vehicles = await getAllVehicles();
  const admin = await getAdmin(userId);
  res.render("adminVehicleDashboard", { admin, vehicles });
};

const getAddVehicle = async (req, res) => {
  const { userId } = req.session;
  const admin = getAdmin(userId);
  res.render("add-vehicles", { admin });
};

const addVehicle = async (req, res) => {
  const {
    vehicleNumber,
    makeYear,
    model,
    color,
    pollutionCertificateNumber,
    pollutionValidity,
    registrationDate,
  } = req.body;

  const vehicle = {
    vehicleNumber,
    makeYear,
    model,
    color,
    pollutionCertificateNumber,
    pollutionValidity,
    registrationDate,
  };
  await createVehicle(vehicle);
  res.redirect("/admin/vehicles");
};

const getEditVehicle = async (req, res) => {
  const { userId } = req.session;
  const { id } = req.params;
  const admin = getAdmin(userId);
  const vehicle = await getVehicleById(parseInt(id));
  res.render("edit-vehicle", { admin, vehicle });
};

const editVehicle = async (req, res) => {
  const {
    id,
    vehicleNumber,
    makeYear,
    model,
    color,
    pollutionCertificateNumber,
    pollutionValidity,
    registrationDate,
  } = req.body;

  const vehicle = {
    id,
    vehicleNumber,
    makeYear,
    model,
    color,
    pollutionCertificateNumber,
    pollutionValidity,
    registrationDate,
  };
  await editVeh(vehicle);
  res.redirect("/admin/vehicles");
};

const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  await delVehicle(parseInt(id));
  res.redirect("/admin/vehicles");
};

const getAdminEvents = async (req, res) => {
  const { userId, role } = req.session;
  const events = await getAllEvents();
  const admin = await getAdmin(userId);
  res.render("adminEventDashboard", { admin, events });
};

const getAddEvent = async (req, res) => {
  const { userId, role } = req.session;
  const { id } = req.params;
  const admin = getAdmin(userId);
  res.render("add-event", { admin });
};

const getEditEvent = async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.session;
  const admin = getAdmin(userId);
  const event = await getEventById(parseInt(id));
  res.render("edit-event", { admin, event });
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',  // SMTP server address
  port: 587,                 // Port for SMTP (usually 587 for TLS or 465 for SSL)
  secure: false,             // true for 465, false for other ports
  auth: {
    user: 'Campusconnectsoftware@gmail.com',
    pass: 'nhdn mpwa fqpn ckvq'
  }
});

const addEvent = async (req, res) => {
  const { title, description, startDate, endDate, location, type } = req.body;
  const event = { title, description, startDate, endDate, location, type };
  const users = await prisma.user.findMany()
  console.log(event)
  const addedEvent = await createEvent(event)
  const mailOptions = {
    subject: `New Event: ${event.title}`,
    text: `You're invited to ${event.title}!\n\nDescription: ${event.description}\nLocation: ${event.location}\nStarts: ${event.startDate}\nEnds: ${event.endDate}`
  };
  for (const user of users) {
    await transporter.sendMail({
      ...mailOptions,
      to: user.email,
    });
  }
  res.redirect('/admin/events')
};

const deleteEvent = async(req, res)=>{
  const {id} = req.params;
  await delEvent(parseInt(id))
  res.redirect('/admin/events')

}

const getAdminSubjects = async (req, res) => {
  const { userId, role } = req.session;
  const admin = await getAdmin(userId);
  const subjects = await getAllSubjects();
  console.log(subjects);
  res.render("adminSubjectDashboard", { admin, subjects });
};

const getAddSubject = async (req, res) => {
  const { userId, role } = req.session;
  const admin = await getAdmin(userId);
  const teachers = await getAllStaffs();
  const departments = await getAllDepartments();
  res.render("add-subject", { admin, teachers, departments });
}

const addSubject = async (req, res) => {
  const { name, code, department, teacher, semester } = req.body;
  console.log(req.body);
  const subject = {
    name,
    code,
    departmentId: parseInt(department),
    staffProfileId: parseInt(teacher),
    semester: parseInt(semester),
  };
  console.log(subject);
  await createSubject(subject);
  res.redirect("/admin/subjects");
}

const deleteSubject = async (req, res) => {
  const { id } = req.params;
  await delSubject(parseInt(id));
  res.redirect("/admin/subjects");
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
  getEditDepartment,
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
  deleteSubject
};
