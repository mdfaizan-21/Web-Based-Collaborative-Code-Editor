import React from 'react'
import { LogoutButtonProps } from '../types'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react';

const LogoutButton = ({children}:LogoutButtonProps) => {
    const router = useRouter();
    const onLogout = async()=>{
        // Call NextAuth's signOut function to clear the user's session cookie
        await signOut()
        // Refresh the page so the UI updates to show the logged-out state
        router.refresh()
    }
  return (
    <span className='cursor-pointer' onClick={onLogout}>
        {children}
    </span>
  )
}

export default LogoutButton