const prisma = require('../prisma/client')


module.exports = {
    async getAllStudents() {
      const user = await prisma.studentProfile.findMany({
        include: {
          user: true,
          department: true,
        },
      });
      
    
      return user;
    },

    async createStudent(student) {
      try {
        const {  email,
          username,
          password,
          name,
          gender,
          phone,
          semesterInt,
          enrollmentNumber,
          emergencyContact,
          department, } = student;
          // const departmentRecord = await prisma.department.findUnique({
          //   where: {
          //     code: department, // or code: department, if using code
          //   },
          // });
          // console.log(departmentRecord)
          const user = await prisma.user.create({
            data: {
              email,
              username,
              passwordHash: password,
              userType: 'student',
              studentProfile: {
                create: {
                  fullName: name,
                  contactNumber: phone,
                  semester: semesterInt,
                  enrollmentNumber: enrollmentNumber,
                  emergencyContact: emergencyContact,
                  departmentId: department,
                  // joiningDate: new Date(),0
                }
              }
            },
            include: {
              studentProfile: true
            }
          });
        return user;
      } catch (error) {
        console.log(error)
      }
    },

    async studentDelete(id) {
      await prisma.studentProfile.delete({
        where: {
          userId: id,
        },
      });
    
      // Step 2: Delete the user
      const deletedUser = await prisma.user.delete({
        where: {
          id: id,
        },
      });
    
      return deletedUser;
    },

    async getAttendanceById(id) {
      const attendance = await prisma.attendance.findMany({
        where: {
          userId: id,
        },
        include: {
          user: true,
        },
      });
      return attendance;
    },
    async getStudentById(id) {
      const student = await prisma.studentProfile.findUnique({
        where: {
          userId: id,
        },
        include: {
          user: true,
          department: true,
        },
      });
      return student;
    }

}