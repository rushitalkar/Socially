"use server"

import { db } from "@/db"
import { eq, notInArray } from "drizzle-orm";
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
        const dbUser = await db.insert(users).values({
            clerkId: userId,
            name: `${user.firstName || ""} ${user.lastName || ""}`,
            username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
            email: user.emailAddresses[0].emailAddress,
            image: user.imageUrl,
        })

        return { success: true, status: 200, data: dbUser }
    } catch (error) {
        console.log(error);

    }
}

export async function getUserByClerkId(clerkId) {
    const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
        with: {
            posts: { columns: { id: true } },
            followers: { columns: { followerId: true } },
            following: { columns: { followingId: true } }
        }
    })

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
        // 1. Get IDs of users you already follow

        const userFollows = await db.query.follows.findMany({
            where: eq(follows.followerId, userId),
            columns: { followingId: true }
        })

        const excludeIds = [userId, ...userFollows.map((f) => f.followingId)]

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
    }
}

