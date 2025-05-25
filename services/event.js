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
   return await prisma.event.create({
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
  async latestEvents(){
     return await prisma.event.findFirst({
      where: {
        isPublished: true,
        startDatetime: {
          gte: new Date(), 
        },
      },
      orderBy: {
        startDatetime: 'asc', 
      },
    });
  }

,
async addEventComment(
  eventId,
  comment,
  rating,
  createdBy
) {
  try {
    const feedback = await prisma.eventFeedback.create({
      data: {
        eventId,
        comment,
        rating,
        createdById: createdBy,
      },
    });
    console.log(comment)
    return feedback;
  } catch (error) {
    console.error('Error adding event feedback:', error);
    throw new Error('Failed to add feedback');
  }
},
 async getEventFeedback(eventId) {
  return await prisma.eventFeedback.findMany({
    where: {
      eventId,
    },
    include: {
      createdBy: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
}