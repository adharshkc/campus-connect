const prisma = require("../prisma/client");

module.exports = {
  async getAllEvents() {
    return await prisma.event.findMany();
  },

  async getEventById(id) {
    return await prisma.event.findUnique({
      where: {
        id,
      },
    });
  },

  async createEvent(event) {
    const { title, description, startDate, endDate, location, type } = event;
    function parseDate(dateStr) {
      if (!dateStr) return null;
      // Accepts "dd-mm-yyyy" and converts to ISO Date
      const [day, month, year] = dateStr.split("-");
      return new Date(`${year}-${month}-${day}`);
    }
    await prisma.event.create({
      data: {
        title,
        description,
        startDatetime: parseDate(startDate),
        endDatetime: parseDate(endDate),
        location,
        type,
      },
    });
  },

  async delEvent(id) {
    await prisma.event.delete({ where: { id } });
  },
};
