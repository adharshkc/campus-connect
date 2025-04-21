const prisma = require("../prisma/client");

module.exports = {
  async vehicleDel(id) {
    await prisma.vehicleRecord.delete({
      where: { id },
    });
  },
  async getAllVehicles() {
    const vehicles = await prisma.vehicleRecord.findMany();
    return vehicles;
  },
  async createVehicle(vehicle) {
    const {
      vehicleNumber,
      makeYear,
      model,
      color,
      pollutionCertificateNumber,
      pollutionValidity,
      registrationDate,
    } = vehicle;

    function parseDate(dateStr) {
      if (!dateStr) return null;
      // Accepts "dd-mm-yyyy" and converts to ISO Date
      const [day, month, year] = dateStr.split("-");
      return new Date(`${year}-${month}-${day}`);
    }

    await prisma.vehicleRecord.create({
      data: {
        vehicleNumber,
        makeYear,
        model,
        color,
        pollutionCertificateNumber,
        pollutionValidity: parseDate(pollutionValidity),
        registrationDate: parseDate(registrationDate),
      },
    });
  },

  async getVehicleById(id) {
    const vehicle = await prisma.vehicleRecord.findUnique({
      where: {
        id,
      },
    });
    return vehicle;
  },

  async editVeh(vehicle){
    const {
        id,
        vehicleNumber,
        makeYear,
        model,
        color,
        pollutionCertificateNumber,
        pollutionValidity,
        registrationDate,
      } = vehicle;
      function parseDate(dateStr) {
        if (!dateStr) return null;
        // Accepts "dd-mm-yyyy" and converts to ISO Date
        const [day, month, year] = dateStr.split("-");
        return new Date(`${year}-${month}-${day}`);
      }
      await prisma.vehicleRecord.update({
        where: {
          id: parseInt(id),
        },
        data: {
          vehicleNumber,
          makeYear,
          model,
          color,
          pollutionCertificateNumber,
          pollutionValidity: parseDate(pollutionValidity),
          registrationDate: parseDate(registrationDate),
          updatedAt: new Date(), 
        },
  })
},

async delVehicle(id){
    await prisma.vehicleRecord.delete({
        where:{id}
    })
}
};
