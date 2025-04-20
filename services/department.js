const prisma = require("../prisma/client");

module.exports = {
    async getAllDepartments() {
      const department = await prisma.department.findMany({
        include:{
          headStaff:true
        }
      });
      
    //   if (!user) {
    //     throw new Error('User not found');
    //   }
      return department ;
    },

    async createDepartment(name, code){
      const department = await prisma.department.create({
        data:{
          name:name,
          code:code
        }
      })
      return department
    }

}