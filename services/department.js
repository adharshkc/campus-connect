const prisma = require("../prisma/client");

module.exports = {
  async getAllDepartments() {
    const department = await prisma.department.findMany({
      include: {
        headStaff: true,
      },
    });

    //   if (!user) {
    //     throw new Error('User not found');
    //   }
    return department;
  },

  async getDepById(id) {
    const dep = await prisma.department.findUnique({
      where: {
        id: id,
      },
    });
    return dep;
  },

  async createDepartment(name, code) {
    const department = await prisma.department.create({
      data: {
        name: name,
        code: code,
      },
    });
    return department;
  },
  async departmentEdit(name, code, id) {
    const dep = await prisma.department.update({
      where: { id: id },
      data: {
        name: name,
        code: code,
      },
    });
  },

  async depDelete(id) {
    await prisma.department.delete({
      where: { id: id },
    });
  },
};
