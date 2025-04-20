const prisma = require('../prisma/client')

module.exports = {
    async getAdmin(userId) {
      const staff = await prisma.user.findUnique({where:{id:userId}});
      
    
      return staff;
    },

}