"use client"

import { Loader2Icon , Trash2Icon } from "lucide-react"
import { Button } from "./ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DeleteAlertDialog = ({
  isDeleting,
  onDelete,
  title = "Delete Post",
  description = "This action cannot be undone.",
})=>{

   return(
      <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button
              variant= "ghost"
              size="sm"
              className = "text-muted-foreground hover:text-red-500 -mr-2"
            >
                {
                    isDeleting ?(
                        <Loader2Icon className="size-4 animate-spin"/>
                    ):(
                       <Trash2Icon className="size-4"/>
                    )
                }

            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    {title}
                </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                   className="bg-red-500 hover:bg-red-600"
                   disabled={isDeleting}
                >
                {isDeleting ? "Deleting..." : "Delete"}


                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
   )
}

export default DeleteAlertDialog;