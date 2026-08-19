import React from 'react'
import Link from 'next/link'
const NotFound = () => {
  return (
    <div>
      <h1>Not Found Your Requested Resource</h1>
      <p>404</p>
      <p>Go Back To Home</p>
      <Link rel="stylesheet" href="/">Go Back</Link>
    </div>
  )
}

export default NotFound
