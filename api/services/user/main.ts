import prisma from "../../db/prisma";

export class UserService{
    async findUser(email:string){
        try {
            const user = await prisma.user.findUnique({
                where:{email}
            })
            return user;
        } catch (error) {
            throw error;
        }
    }
    async UserById(id:string){
        try {
            const user = await prisma.user.findUnique({
                where:{id}
            })
            return user;
        } catch (error) {
            throw error;
        }
    }
    
}