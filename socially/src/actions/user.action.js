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

export async function toggleFollow(targetUserId) {
  try {
    // Step 1: Find the currently logged-in user from Clerk and convert it to the DB user ID.
    // Example: auth() gives Clerk userId, then getDbUserId() fetches the matching row in the users table.
    const userId = await getDbUserId();

    // Step 2: If there is no logged-in user, reject the action.
    if (!userId) return { success: false, error: "Unauthorized" };

    // Step 3: Prevent a user from following themselves.
    if (userId === targetUserId) {
      return { success: false, error: "You cannot follow yourself" };
    }

    // Step 4: Check whether a follow row already exists.
    // It looks for a row where:
    // - followerId = current logged-in user
    // - followingId = target user
    const existingFollow = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, userId),
        eq(follows.followingId, targetUserId)
      ),
    });

    if (existingFollow) {
      // Step 5A: If the relationship already exists, this means the user is already following them.
      // So we remove that row to unfollow the user.
      await db
        .delete(follows)
        .where(
          and(
            eq(follows.followerId, userId),
            eq(follows.followingId, targetUserId)
          )
        );
    } else {
      // Step 5B: If no relation exists, we create the follow relationship.
      // This is wrapped in a database transaction so both inserts happen together or not at all.
      await db.transaction(async (tx) => {
        // Insert into follows table: current user follows target user.
        await tx.insert(follows).values({
          followerId: userId,
          followingId: targetUserId,
        });

        // Insert notification so the target user knows they were followed.
        await tx.insert(notifications).values({
          type: "FOLLOW",
          userId: targetUserId,
          creatorId: userId,
        });
      });
    }

    // Step 6: Refresh the page cache so the UI reflects the new follow/unfollow state immediately.
    revalidatePath("/");

    // Step 7: Return success so the frontend can handle the UI update.
    return { success: true };
  } catch (error) {
    // Step 8: If anything fails anywhere above, log it and return an error object.
    console.error("Error in toggleFollow:", error);
    return { success: false, error: "Error toggling follow" };
  }
}