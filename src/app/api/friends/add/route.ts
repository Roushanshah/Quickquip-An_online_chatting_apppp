import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
    try{
        const body = await req.json();

        const { sendInvite } = body;

        const {email: emailToAdd} = addFriendValidator.parse(body.email)

        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string

        console.log("val", sendInvite)

        if(!idToAdd) {
            if(sendInvite) {
                await sendInviteEmail(emailToAdd)
                return new Response('Request sent', {status:200})
            }
            //return new Response('This person does not exist.', {status:400})
        }

        const session = await getServerSession(authOptions)

        if(!session) {
            return new Response('Unauthorized', {status:401})
        }

        if(idToAdd === session.user.id) {
            return new Response('You cannot add yourself as a friend', {status: 400})
        }
        
        //check if user is already added
        const isAlreadyAdded = (await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id)) as 0 | 1

        if(isAlreadyAdded) {
            return new Response('Already added this user', {status: 400})
        }

        //check if user is already friend
        const isAlreadyFriends = (await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)) as 0 | 1

        if(isAlreadyFriends) {
            return new Response('Already friends with this user', {status: 400})
        }

        //valid request
        await pusherServer.trigger(
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`), 'incoming_friend_requests', {
                senderId: session.user.id,
                senderEmail: session.user.email
            }
        )

        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')
    } catch(error) {
        if(error instanceof z.ZodError){
            return new Response('Invalid request payload1', {status: 422})
        }

        return new Response('Invalid Requests', {status: 400})
    }
}