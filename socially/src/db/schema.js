// db/schema.ts
import { pgTable, serial, text, timestamp ,defaultRandom , uuid  } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { index, primaryKey } from "drizzle-orm/gel-core";
import { Table } from "lucide-react";
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(()=>createId()),
  email: text("email").notNull().unique(),
  username : text("username").notNull().unique(),
  clerkId : text("clerk_id").unique(),
  name : text("name").notNull(),
  bio : text("bio"),
  image : text("image"),
  location : text("location"),
  website : text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("post",{
   id: text("id").primaryKey().$defaultFn(()=>createId()),
   authorId : text("authorId").notNull().references(()=> users.id , {onDelete : "cascade"}),
   content : text("content").notNull(),
   image : text("image"),
   createdAt: timestamp("created_at").defaultNow().notNull(),
   updatedAt: timestamp("updated_at").defaultNow().notNull(),
   
})


export const postRelations = relations(posts , ({one,many})=>({
  author : one(users ,{
    fields : [posts.authorId],
    references : [users.id]
  }),
  comments : many(comments),
  likes : many(likes),
  notifications : many(notifications)

}))

export const comments = pgTable(comments ,{
    id: text("id").primaryKey().$defaultFn(()=>createId()),
    content : text("content").notNull(),
    authorId : text("authorId").notNull().references(()=> users.id , {onDelete : "cascade"} ),
    postId : text("postId").notNull().references(()=> posts.id , {onDelete : "cascade"}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

})

export const commentsRelations = relations(comments , ({one,many})=>({
  author : one(users , {
    fields : [comments.authorId],
    references  : [users.id]
  }),
  post : one(posts , {
    fields : [comments.postId],
    references : [posts.id]
  }),
  notifications: many(notifications),
}))

export const likes = pgTable("likes" , {
  id: text("id").primaryKey().$defaultFn(()=>createId()),
  userId : text("userId").notNull().references(()=>users.id ,{onDelete : "cascade"} ),
  postId : text("postId").notNull().references(()=>posts.id ,{onDelete : "cascade"}),
  createdAt: timestamp("created_at").defaultNow().notNull(),


})

export const likesRelations = relations(likes , ({one})=>({
   user : one(users , {
    fields : [likes.userId],
    references : [users.id]
   }),
   post : one(posts , {
    fields : [likes.postId],
    references : [posts.id]
   })
}))

export const follows = pgTable("follows" , {
  followerId : text("followerId").notNull().references(()=>users.id , {onDelete : "cascade"}),
  followingId : text("followingId").notNull().references(()=> users.id , {onDelete : "cascade"}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, 
  (table)=>[
     primaryKey({columns : [table.followerId , table.followingId]}),
     index("follows_follower_following_idx").on(
      table.followerId,
      table.followingId
     ),
    //  we write this way also
    //  primaryKey({ columns: [table.followerId, table.followingId] }),
  ]
)

