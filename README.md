# Socially

Here is a high-impact, professional README template tailored for your repository:

🚀 Socially — Full-Stack Social Media Platform
A modern, high-performance social media web application built with Next.js 14/15 App Router, Drizzle ORM, PostgreSQL, and Clerk Auth. Built from scratch in 13 days, focusing on server-side rendering, type safety, and blazing-fast performance.

✨ Features
🔐 Authentication & User Management: Secure authentication powered by Clerk with sync routines to PostgreSQL.

📝 Posts & Feed: Create, read, and render real-time posts with nested relations (authors, likes, and comments).

👤 User Profiles: Dynamic profile pages featuring user stats (followers, following, post count), bio edits, and tabbed feed views.

❤️ Interactions: Like/unlike posts and comment on feeds with instant optimistic updates.

👥 Follow System: Follow/unfollow users with database relationship checks.

🎨 Modern UI/UX: Responsive layout built with Tailwind CSS and Radix UI/Shadcn UI.

🛠️ Tech Stack
Framework: Next.js (App Router, Server Actions, Server Components)

Language: JavaScript / TypeScript

Database: PostgreSQL

ORM: Drizzle ORM (Pure Relational API & SQL joins)

Auth: Clerk

Styling: Tailwind CSS & Lucide React

⚡ Performance Highlights & Engineering Achievements
Pure Drizzle ORM Migration: Successfully migrated the data layer from Prisma to pure Drizzle ORM, drastically reducing cold-start latency and bundle size.

Optimized Server Render Cycle: Removed async navigation blocks in layouts and leveraged Promise.all for parallelized database fetching on server components.

Type-Safe Relational Queries: Structured complex relational queries (users, posts, comments, likes, follows) using pure Drizzle schema relations.

🚀 Getting Started
