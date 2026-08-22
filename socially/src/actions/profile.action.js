"use server";

import { db } from "@/db";
import { follows, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { getDbUserId } from "./user.action";
export async function getProfileByUsername(username) {
  try {
    if (!username) return {message : "username is required"};
   const user = await db.query.users.findFirst({
      where  : eq(users.username , username),
      columns :{
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        website: true,
        createdAt: true,
      },
     with: {
        followers : {
            columns : { followerId : true }
        },
        following: {
          columns: { followingId: true },
        },
        posts: {
          columns: { id: true },
        },
    }

   })
   
   if(!user) return null


   return {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      image: user.image,
      location: user.location,
      website: user.website,
      createdAt: user.createdAt,
      _count: {
        followers: user.followers?.length ?? 0,
        following: user.following?.length ?? 0,
        posts: user.posts?.length ?? 0,
      },
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function getUserLikedPosts(userId) {
  try {
    // 1. Fetch likes and pull full post details automatically via schema relations
    const userLikes = await db.query.likes.findMany({
      where: eq(likes.userId, userId),
      with: {
        post: {
          with: {
            author: true,
            comments: true,
            likes: true,
          },
        },
      },
    });

    // 2. Extract posts and calculate counts
    return userLikes
      .filter((like) => like.post !== null)
      .map(({ post }) => ({
        ...post,
        _count: {
          likes: post.likes.length,
          comments: post.comments.length,
        },
      }));
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
}

export async function getUserPosts(userId) {
  try {
    // 1. Fetch user posts with nested relations using Drizzle Relational Query API
    const userPosts = await db.query.posts.findMany({
      where: eq(posts.authorId, userId),
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          orderBy: (comments, { asc }) => [asc(comments.createdAt)],
          with: {
            author: {
              columns: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        likes: {
          columns: {
            userId: true,
          },
        },
      },
    });

    // 2. Format response to include _count to match Prisma's output shape
    return userPosts.map((post) => ({
      ...post,
      _count: {
        likes: post.likes.length,
        comments: post.comments.length,
      },
    }));
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return []; // Safe fallback prevents UI crashes
  }
}

export const updateProfile =async()=>{
    try {
      const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const name = formData.get("name");
    const bio = formData.get("bio");
    const location = formData.get("location");
    const website = formData.get("website");

    const user = await db.update(users).set({
      name,
      bio,
      location,
      website
    }).where(eq(users.clerkId, clerkId));

    revalidatePath("/profile");
    return { success: true, status: 200, user: user };

    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
    }
}

export const isFollowing = async()=>{
  try {
    const currentUserId = await getDbUserId(userID)

    if(!currentUserId) return false

    const follow = await db.query.follows.findFirst({
        where : and(
          eq(follows.followerId , currentUserId),
          eq(follows.followingId , userId)
        )
    })

    return !!follow
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}