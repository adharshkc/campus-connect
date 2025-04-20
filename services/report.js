const prisma = require("../prisma/client")

module.exports={
    async reportDelete(id){
        await prisma.complaint.delete({
            where:{id}
        })
    },
    async getAllReports(){
        const reports = await prisma.complaint.findMany()
        return reports
    }
}