// db/schema.ts
import { pgTable, serial, text, timestamp ,defaultRandom , uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
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

export const post = pgTable("post",{
   id : uuid("id").defaultRandom(),
   authorId : text("authorId").notNull().references(()=> users.id , {onDelete : "cascade"}),
   content : text("content").notNull(),
   image : text("image"),
   createdAt: timestamp("created_at").defaultNow().notNull(),
   updatedAt: timestamp("updated_at").defaultNow().notNull(),

})