"use server"
import { db } from "@/db"
import { eq } from "drizzle-orm";
import { auth , currentUser } from "@clerk/nextjs/server";
import { users , notifications , likes , posts ,comments, follows } from "@/db/schema";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { asc, desc } from "drizzle-orm";

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

export const getPosts = async()=>{
    try {
      const posts = await db.query.posts.findMany({
         orderBy : (posts , {desc})=>[desc(posts.createdAt)],
         // 2. Fetch nested relations using `with`
         with : {
         // Fetch post author details

            author : {
               columns : {
                  id: true,
            name: true,
            image: true,
            username: true,

               }
            },
            // Fetch comments along with comment authors
            comments : {
               orderBy : (comments , {asc})=>[asc(comments.createdAt)] ,
               with : {
                 author :{
                  columns : {
                      id: true,
                      username: true,
                      image: true,
                      name: true,
                     }
                  }
               }
            },
            // Fetch array of user IDs who liked the post
            likes : {
               columns : {
                  userId : true
               }
            }
         },
      })
      // 3. Map over results to attach comment and like count aggregations
      const postWithCounts =  posts.map((post)=>({
         ...post,
         _count : {
            likes : post.likes.length,
            comments : post.comments.length
         }

      }))
      return postWithCounts

    } catch (error) {
       console.log(error);
        return []; // Return empty array so .map() in UI doesn't crash       
    }
}