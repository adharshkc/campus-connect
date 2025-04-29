const prisma = require("../prisma/client");

module.exports = {
    async getAllSubjects() {
        const subjects = await prisma.subject.findMany({include:{department:true,teacher:true}});
        return subjects;
    },
    
    async getSubjectById(id) {
        const subject = await prisma.subject.findUnique({
        where: { id },include:{department:true,teacher:true}
        });
        return subject;
    },
    async createSubject(subjectData) {
        const subject = await prisma.subject.create({
            data: subjectData,
        });
        return subject;
    },
    async delSubject(id) {
        const subject = await prisma.subject.delete({
            where: { id },
        });
        return subject;
    }
}