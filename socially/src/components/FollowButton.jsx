"use client"
import React from 'react'
import {useState} from 'react'
import { Button } from './ui/button'
import { Loader2Icon } from 'lucide-react'
import { toggleFollow } from '@/actions/user.action'
import toast from 'react-hot-toast'
const FollowButton = ({userId}) => {
  const [isLoading, setIsLoading] = useState(false)
  console.log(userId);
  
  const handleFollow = async()=>{
       try {
          await toggleFollow(userId)
          toast.success("User Folllwed  Sucessfully")
       } catch (error) {
          toast.error("Error Folllwing User")
       }finally{
        setIsLoading(false)
       }
  }



  return (
    <Button
    size="sm"
    variant={"secondary"}
    onClick={handleFollow}
    disabled = {isLoading}
    className ={"w-20 dark:bg-[#161616] cursor-pointer hover:bg-[#535658]"}
    
    >
      {isLoading ? <Loader2Icon className='size-4 animate-spin'/> : "Follow"}
    </Button>
  )
}

export default FollowButton
