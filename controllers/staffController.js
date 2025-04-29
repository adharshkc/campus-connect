const prisma = require("../prisma/client");
const { getAdmin } = require("../services/admin");
const { getAllDepartments } = require("../services/department");
const { getAllEvents } = require("../services/event");
const { getStaffById, getStaffByUserId } = require("../services/staff");
const { getAllStudents, createStudent, studentDelete } = require("../services/student");
const { getAllVehicles } = require("../services/vehicles");

module.exports = {
  async getDashboard(req, res) {
    const { userId, role } = req.session;
    const staff = await getAdmin(userId);
    console.log(userId);
    console.log(staff);
    const students = await getAllStudents();
    const events = await getAllEvents();
    const totalStudents = students.length;

    res.render("staffDashboard", { staff, totalStudents, students, events });
  },

  async getStudentDashboard(req, res) {
    const { userId } = req.session;
    const staff = await getAdmin(userId);
    const students = await getAllStudents();
    res.render("staffStudentDashboard", { staff, students, });
  },
  
  async getAddStudent(req, res) {
    const { userId } = req.session;
    const staff = await getAdmin(userId);
    const departments = await getAllDepartments()
    res.render("add-student", { staff, departments });
  },

  async addStudent(req, res) {
    const {
      email,
      username,
      password,
      name,
      gender,
      phone,
      semester,
      enrollmentNumber,
      emergencyContact,
      department,
    } = req.body;
    const semesterInt = parseInt(semester)
    const student = {
      name,
      email,
      username,
      password,
      gender,
      phone,
      semesterInt,
      enrollmentNumber,
      emergencyContact,
      department:parseInt(department),
    };
    
    await createStudent(student);  

    res.redirect("/staff/studentDashboard");
  },

  async deleteStudent(req, res) {
    const { id } = req.params;
    console.log(id);  
    await studentDelete(parseInt(id));
    res.redirect("/staff/studentDashboard");
  },

  async getAttendance(req, res) {
    const { userId } = req.session;
    const staff = await getAdmin(userId);
    const students = await getAllStudents();

    res.render("StaffAttendanceDashboard", { staff, students });
  },

  async addPresentAttendance(req, res) {
    const {studentId, date} = req.body
    const { userId } = req.session;
    console.log("userId",req.body);
    const staff = await getStaffByUserId(userId);
    console.log(typeof studentId);
    const attendanceDate = new Date(date);
    try {
      const attendance = await prisma.attendance.upsert({
        where: {
          userId_date: {
            userId: parseInt(studentId),
            date: attendanceDate
          }
        },
        update: {
          status: "present",
          // remarks: remarks || null,
          // subjectId: subjectId ? parseInt(subjectId) : null
        },
        create: {
          userId: parseInt(studentId),
          date: attendanceDate,
          status: "present",
          recordedBy: staff.userId, 
          // remarks: remarks || null,
          // subjectId: subjectId ? parseInt(subjectId) : null
        }
      });
    } catch (error) {
      console.error("Error adding attendance:", error);
    }
    res.redirect("/staff/attendance");
  },
  async addAbsentAttendance(req, res) {
    const {studentId, date} = req.body
    const { userId } = req.session;
    const staff = await getStaffByUserId(userId);
    console.log("staff",staff);
    const attendanceDate = new Date(date);
    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: parseInt(studentId),
          date: attendanceDate
        }
      },
      update: {
        status: "absent",
        // remarks: remarks || null,
        // subjectId: subjectId ? parseInt(subjectId) : null
      },
      create: {
        userId: parseInt(studentId),
        date: attendanceDate,
        status: "absent",
        recordedBy: staff.userId, 
        // remarks: remarks || null,
        // subjectId: subjectId ? parseInt(subjectId) : null
      }
    });
    res.redirect("/staff/attendance");
  },

  async getDepartment(req, res) {
    const { userId } = req.session;
    const staff = await getAdmin(userId);
    const departments = await getAllDepartments();
    res.render("staffDepartmentDashboard", { staff, departments });
  },

  async getVehicle(req, res) {
    const { userId } = req.session;
    const staff = await getAdmin(userId);
    const vehicles = await getAllVehicles()
    res.render("staffVehicleDashboard", { staff, vehicles });
  },
  async getEvent(req, res) {
    const { userId } = req.session;
    const staff = await getAdmin(userId);
    const events = await getAllEvents();
    res.render("staffEventDashboard", { staff, events });
  },
};
