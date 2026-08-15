"use server"
import { db } from "@/db"
import { eq } from "drizzle-orm";
import { auth , currentUser } from "@clerk/nextjs/server";
import { users , notifications , likes , posts ,comments, follows } from "@/db/schema";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export const createPost =async (content , imageUrl)=>{
     try {
        const userId = await getDbUserId()

        const [post] = await db.insert(posts).values({
            content,
            image : imageUrl,
            authorId : userId
        }).returning()
        
        revalidatePath("/")
        return {success : true , status : 200 ,  post}

     } catch (error) {
        console.error("failed to create post" , error);
        return {success : false , status : 500 , error : error.message}
     }
}