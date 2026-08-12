"use server"

import { db } from "@/db"
import { eq } from "drizzle-orm";
import { auth , currentUser } from "@clerk/nextjs/server";
import { users , notifications , likes , posts ,comments, follows } from "@/db/schema";

export const syncUser = async ()=>{
    try {
        const {userId} =await  auth()
        const user = await currentUser()

        if (!user || !userId) return


        const existingUser = await db.query.users.findFirst({where : eq(users.clerkId , userId)})
        
        if (existingUser) {
           return { error : "user already exist" , status : 500}
        }
        const dbUser = await db.insert(users).values({
            clerkId : userId,
            name : `${user.firstName || ""} ${user.lastName || ""}`,
            username : user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
            email : user.emailAddresses[0].emailAddress,
            image : user.imageUrl,
        })

        return { success: true, status: 200, data: dbUser }
    } catch (error) {
        console.log(error);
        
    }
}
