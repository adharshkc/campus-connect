const { parse } = require("dotenv");
const prisma = require("../prisma/client");

module.exports = {
  async getAllStaffs() {
    const staff = await prisma.staffProfile.findMany({
      include:{
        user:true,
        department:true
      }
    });

    return staff;
  },

  async createStaff(staff) {
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
    } = staff;
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash:password,
        userType: "staff",
      },
    });
    const dep = parseInt(department)
    // let departmentRecord = null;
    // if (department) {
    //   departmentRecord = await prisma.department.upsert({
    //     where: {
    //       code: department,
    //     },
    //     update: {},
    //     create: {
    //       name: department,
    //       code:department
    //     },
    //   });
    // }
    // console.log(departmentRecord)
    const parsedDate = joiningDate
  ? new Date(joiningDate.split('-').reverse().join('-')) 
  : null;
    const newStaffProfile = await prisma.staffProfile.create({
      data: {
        userId: newUser.id,
        fullName: name,
        gender,
        contactNumber: phone,
        joiningDate: parsedDate,
        subjectSpecialization: subject,
        designation,
        departmentId: dep,
      },
      include: {
        user: true,
        department: true,
      },
    });
    return newStaffProfile;
  },
  async editStaff(staff) {
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
    } = staff;
    const userId = parseInt(id);
    let departmentRecord = null;
    if (department) {
      departmentRecord = await prisma.department.upsert({
        where: { code: department.toLowerCase() },
        update: {},
        create: {
          name: department,
          code: department.toLowerCase()
        }
      });
    }
    await prisma.staffProfile.update({
      where: { id:userId },
      data: {
        fullName: name,
        gender,
        contactNumber: phone,
        subjectSpecialization: subject,
        designation,
        departmentId: departmentRecord?.id || null
      }
    });
    return { success: true };
  },
  async deleteStaff(id){
    try {
      
      const staff= await prisma.staffProfile.delete({
        where: {
          userId: parseInt(id),
        },
      });
      console.log(staff)
      // Then delete the associated user
      const user = await prisma.user.delete({
        where: {
          id: parseInt(id),
        },
      });
      return user
    } catch (error) {
      console.log(error)
    }
  },

  async getStaffById(id){
    const staff = await prisma.staffProfile.findUnique({
      where:{
        id:parseInt(id)
      },include:{
        user:true,
        department:true
      }
    })
    return staff
  },
  async getStaffByUserId(id){
    const staff = await prisma.staffProfile.findUnique({
      where:{
        userId:parseInt(id)
      },include:{
        user:true,
        department:true
      }
    })
    return staff
  },
};
