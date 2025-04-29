const prisma = require("../prisma/client");

module.exports = {
  async getAllMessages() {
    return await prisma.message.findMany({
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async getMessageById(id) {
    return await prisma.message.findUnique({
      where: {
        id,
      },
    });
  },

  async createMessage(content, userId) {
    if (content.trim()) {
      await prisma.message.create({
        data: {
          content,
          userId: userId,
        },
      });
    }
  },
  async delMessage(id) {
    await prisma.message.delete({ where: { id } });
  },
};
