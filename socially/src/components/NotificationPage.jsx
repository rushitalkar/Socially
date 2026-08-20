"use client"
import React from 'react'
import { getNotifications } from '@/actions/notifications.action'
import { Button } from './ui/button'
const NotificationPage = () => {
     const hanndleNotication =async()=>{
         const result = await getNotifications()
         console.log(result);
         
        }
  return (
    <div>
      <Button onClick={hanndleNotication}>Get Notification</Button>
    </div>
  )
}

export default NotificationPage
