"use server";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getDbUserId } from "./user.action";

export async function getNotifications() {
  try {
   const userId = await getDbUserId();

   const userNotifications = await db.query.notifications.findMany({
     where :  eq(notifications.userId , userId),
        // Select specific fields for creator
        with :{
        creator: {
          columns: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        // Select specific fields for post
        post: {
          columns: {
            id: true,
            content: true,
            image: true,
          },
        },
        // Select specific fields for comment
        comment: {
          columns: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    return userNotifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return []; // Return empty array to prevent UI crashes
  }
}

export async function markNotificationsAsRead(notificationIds) {
  try {
    if (!notificationIds || notificationIds.length === 0) {
      return { success: true };
    }

    // Update read status for all provided notification IDs in a single query
    await db.update(notifications).set({read : true}).where(inArray(notificationIds.id , notificationIds))
    
    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false, error: "Failed to mark notifications as read" };
  }
}