const prisma = require('../prisma/client')


module.exports = {
    async loginUser(username, password) {
      const user = await prisma.user.findUnique({ where: { username } });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      
      if (user.passwordHash!== password) {
        throw new Error('Invalid password');
      }
      
      return user;
    },
}