"use client"
import { toggleLike } from "@/actions/user.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
const PostCard = ({post, dbUser}) => {
  const {user} = useUser()
  const [newComment , setNewComment] = useState()
  const [isCommenting , setIsCommenting] = useState(false)
  const [isLinking , setIsLinking] = useState(false)
  const [isDeleting , setIsDeleting] = useState(false)
  const [hasLiked , setHasLiked] = useState(post.likes.some((like)=> like.userId === dbUser))
  const [optimisticLikes , setOptimisticLikes] = useState(post._count.likes)
  
  console.log(post);

  const handleLikes = async()=>{
    if(isLinking) return
    
    try {
      setIsLinking(true)
      setHasLiked(prev => !prev)
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);

    } catch (error) {
      setOptimisticLikes(post._count.likes)
      setHasLiked(post.likes.some((like)=> like.userId === dbUser))
    }finally{
      setIsLinking(false)
    }
  }
  return (
    <div>
      <h1 >Post</h1>
    </div>
  )
}

export default PostCard
