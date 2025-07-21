import { db } from '@/server/db';
import { auth, clerkClient } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation';
import React from 'react'

const SyncUser = async() => {

    const { userId } = await auth();
    if(!userId){
        throw new Error('User Not Found');
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    if(!user.emailAddresses[0]?.emailAddress){
        return notFound()
    }

    await db.user.upsert({
        where:{
            emailAddress: user.emailAddresses[0]?.emailAddress ?? ""
        }, 
        update: {
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        create: {
            id: userId,
            imageUrl: user.imageUrl, 
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
        },
    })

    return redirect('/dashboard');
}

export default SyncUser