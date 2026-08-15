"use client"
import { useUser } from '@clerk/nextjs'
import React, { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { AvatarImage } from './ui/avatar'
import { Avatar } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { ImageIcon, LoaderIcon , SendIcon} from 'lucide-react'
import { createPost } from '@/actions/post.action'
import toast from 'react-hot-toast'


const CreatePost = () => {
    const {user} = useUser()
    const [content, setContent] = useState("")
    const [imageUrl , setImageUrl] = useState("")
    const [showImageUpload , setShowImageUpload] = useState(false)
    const [isPosting, setIsPosting] = useState(false)


    const handleSubmit =async ()=>{
        if(!content.trim()) return
        setIsPosting(true)
        try {
        const result =  await createPost(content , imageUrl)
        if(result?.success){
          setContent("")
          setImageUrl("")
          setShowImageUpload(false)

          toast.success("Post Created Succesfully")
        }
        } catch (error) {
          console.error(error)
          toast.error("failed to create post")
        }finally{
          setIsPosting(false)
        }
    }
  return (
    <Card className={"mb-6"}>
        <CardContent className={"pt-2"}>
            <div className='space-y-4'></div>
            <div className='flex space-x-4 dark:bg-input/90 p-2 rounded-lg dark:focus-within:ring-2 dark:focus-within:ring-ring'>
                <Avatar className={"w-10 h-10 mb-2"}>
                    <AvatarImage src={user?.imageUrl}/>
                </Avatar>
               <Textarea
              placeholder="What's on your mind ?"
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0  text-base "
              value={content}
              onChange = {(e)=>setContent(e.target.value)}
              disabled={isPosting}
            />
            </div>
          

            {
                (showImageUpload || imageUrl) && (
                    <div className='border rounded-lg p-4'>
                    </div>

                )
            }
            <div className='flex items-center justify-between pt-4'>
               <div className="flex space-x-2">
                 <Button
                   type="button"
                   variant= "ghost"
                   size="sm"
                   className="text-muted-foreground hover:text-primary"
                   onClick={()=> setShowImageUpload(!showImageUpload)}
                   disabled={isPosting}
                 >
                    <ImageIcon className="size-4 mr-2"/>
                    Photo
                 </Button>
               </div>
               <Button
                 className="flex items-center"
                 onClick={handleSubmit}
                 disabled={(!content.trim() && !imageUrl) || isPosting}

               >
                {
                    isPosting ? (
                       <>
                          <LoaderIcon className="size-4 mr-2 animate-spin"/>
                          Posting.....
                       </>
                    ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
                  Post
                </>

                    )
                }

               </Button>
            </div>
        </CardContent>
    </Card>
  )
}

export default CreatePost
