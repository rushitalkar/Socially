"use server"
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { and, eq, notInArray } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { users, notifications, likes, posts, comments, follows } from "@/db/schema";

export const syncUser = async () => {
    try {
        const { userId } = await auth()
        const user = await currentUser()

        if (!user || !userId) return


        const existingUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })

        if (existingUser) {
            return { error: "user already exist", status: 500 }
        }
        const [dbUser] = await db.insert(users).values({
            clerkId: userId,
            name: `${user.firstName || ""} ${user.lastName || ""}`,
            username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
            email: user.emailAddresses[0].emailAddress,
            image: user.imageUrl,
        }).returning()

        
        return { success: true, status: 200, data: dbUser }
    } catch (error) {
        console.log(error);

    }
}

export async function getUserByClerkId(clerkId) {

    let user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
        with: {
            posts: { columns: { id: true } },
            followers: { columns: { followerId: true } },
            following: { columns: { followingId: true } }
        }
    })
     
    if (!user) {
    await syncUser();

    // Re-query database after sync
    user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      with: {
        posts: { columns: { id: true } },
        followers: { columns: { followerId: true } },
        following: { columns: { followingId: true } },
      },
    });
  }

    if (!user) return null

    const { posts, followers, following, ...userData } = user;

    return {
        ...userData,
        _count: {
            posts: posts.length,
            followers: followers.length,
            following: following.length,
        },
    };
}


export async function getDbUserId() {
    const { userId: clerkId } = await auth()

    if (!clerkId) throw new Error("unauthenticated")

    const user = await getUserByClerkId(clerkId)

    if (!user) throw new Error("User Not Found")

    return user.id

}

export async function getRandomUsers() {
    try {
        const userId = await getDbUserId()

        if (!userId) return [];
        // 1. Get IDs of users you already follow

        const userFollows = await db.query.follows.findMany({
            where: eq(follows.followerId, userId),
            columns: { followingId: true }
        })

        const excludeIds = [userId , ...userFollows.map((f) => f.followingId)]

        const getRandomUsers = await db.query.users.findMany({
            where: notInArray(users.id, excludeIds),
            columns: {
                id: true,
                name: true,
                username: true,
                image: true,
            },
            with: {
                followers: {
                    columns: {
                        followerId: true
                    }
                }
            },
            limit: 3,
        })


        return getRandomUsers.map(({ followers, ...user }) => ({
            ...user,
            _count: { followers: followers.length },
        }))
    } catch (error) {
        console.log(error)
        return {status : 500 , error : error.message}
        return [];
    }
}

export async function toggleLike(postId) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Fetch post author to verify existence and notification target
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: { authorId: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // 2. Check if the user already liked this post
    const existingLike = await db.query.likes.findFirst({
      where: and(
        eq(likes.userId, userId),
        eq(likes.postId, postId)
      ),
    });

    if (existingLike) {
      // 3. Unlike: Delete like record and associated LIKE notification atomically
      await db.transaction(async (tx) => {
        await tx
          .delete(likes)
          .where(
            and(
              eq(likes.userId, userId),
              eq(likes.postId, postId)
            )
          );

        // Delete existing LIKE notification if liking someone else's post
        if (post.authorId !== userId) {
          await tx
            .delete(notifications)
            .where(
              and(
                eq(notifications.userId, post.authorId),
                eq(notifications.creatorId, userId),
                eq(notifications.postId, postId),
                eq(notifications.type, "LIKE")
              )
            );
        }
      });
    } else {
      // 4. Like: Create like record and notification atomically
      await db.transaction(async (tx) => {
        await tx.insert(likes).values({
          userId,
          postId,
        });

        // Send notification only if liking another user's post
        if (post.authorId !== userId) {
          await tx.insert(notifications).values({
            type: "LIKE",
            userId: post.authorId, // recipient (post author)
            creatorId: userId,     // actor (person who liked)
            postId,
          });
        }
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}
