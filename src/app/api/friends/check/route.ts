import { fetchRedis } from "@/helpers/redis";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { z } from "zod";

export async function POST(req: Request) {
    try{
        const body = await req.json();

        const {email: emailToCheck} = addFriendValidator.parse(body.email);

        const idToCheck = await fetchRedis('get', `user:email:${emailToCheck}`) as string

        if(!idToCheck) {
            return new Response(JSON.stringify({ isRegistered: false }), { status: 200 });
        }

        return new Response(JSON.stringify({ isRegistered: true }), { status: 200 });

    } catch(error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload2', { status: 422 });
        }

        return new Response('Error checking registration status', { status: 400 });
    }
}