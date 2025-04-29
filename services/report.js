
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
    },

    async getComplaintByUserId (userId) {
        return await prisma.complaint.findMany({
            where: {
                userId: userId,
            },
        });

    },
    async createComplaint(com){
        const user = await prisma.user.findUnique({
            where:{
                id:com.studentId
            }
        })
        console.log(user)
        const reports = await prisma.complaint.create({
            data:{
                title:com.title,
                description:com.description,
                category:com.category,
                userId:com.studentId,
            }
        })
    },
}