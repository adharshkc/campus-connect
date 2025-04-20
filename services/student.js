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

}