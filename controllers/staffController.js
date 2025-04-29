const prisma = require("../prisma/client");
const { getAdmin } = require("../services/admin");
const { getAllDepartments } = require("../services/department");
const { getAllEvents } = require("../services/event");
const { getStaffById, getStaffByUserId } = require("../services/staff");
const { getAllStudents, createStudent, studentDelete } = require("../services/student");
const { getAllVehicles } = require("../services/vehicles");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',  // SMTP server address
  port: 587,                 // Port for SMTP (usually 587 for TLS or 465 for SSL)
  secure: false,             // true for 465, false for other ports
  auth: {
    user: 'Campusconnectsoftware@gmail.com',
    pass: 'nhdn mpwa fqpn ckvq'
  }
});
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

  async addLate(req, res){
    const {studentId, date} = req.body
    const id = parseInt(studentId)
    const { userId } = req.session;
    const staff = await getStaffByUserId(userId);
    const student = await getAdmin(id);
    const attendanceDate = new Date(date);
    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: parseInt(studentId),
          date: attendanceDate
        }
      },
      update: {
        isLate: true
      },
      create: {
        userId: parseInt(studentId),
        date: attendanceDate,
        isLate: true,
        status:"present",
        recordedBy: staff.userId, 
        // remarks: remarks || null,
        // subjectId: subjectId ? parseInt(subjectId) : null
      }
    });
    try {
      const mailOptions = {
        from: '"Campus Connect" <Campusconnectsoftware@gmail.com>',
        to: student.email,
        subject: 'Notice of Late Attendance',
        text: `Dear Student,\n\nWe hope this message finds you well. This is to inform you that you have been marked as late on ${attendanceDate.toDateString()}.\n\nIf you have any concerns, please feel free to reach out to the administration.\n\nBest regards,\nCampus Connect Team`,
        html: `
          <p>Dear <strong>${student.name}</strong>,</p>
          <p>We hope this message finds you well. This is to inform you that you have been marked as <strong>late</strong> on <strong>${attendanceDate.toDateString()}</strong>.</p>
          <p>If you have any concerns, please feel free to reach out to the administration.</p>
          <p>Best regards,</p>
        `
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.error('Error:', error);
        }
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
      });
    } catch (error) {
      console.log("Error sending email:", error);
    }
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
