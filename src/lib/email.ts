import { getServerSession } from 'next-auth';
import nodemailer from 'nodemailer';
import { authOptions } from './auth';

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

export const sendInviteEmail = async (email: string) => {
    const session = await getServerSession(authOptions)
    await transporter.sendMail({
        from: "Quickquip",
        to: email,
        subject: "You're invited to Quickquip!",
        text: `Hi there! ${session?.user.email} invited you to join our platform. Click the link below to sign up.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <div style="text-align: center;">
                    <img src="https://i.ibb.co/fGk8grV/logo.png" alt="Quickquip Logo" style="max-width: 150px;">
                </div>
                <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
                    <h1 style="color: #333; font-size: 24px; text-align: center;">You're Invited to Join Quickquip!</h1>
                    <p style="color: #555; font-size: 16px; line-height: 1.5;">
                        Hi there! ${session?.user.email} invited you to join our platform. Quickquip is a great place to connect and chat with friends. 
                        Click the link below to sign up and start chatting!
                    </p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="https://quickquip-an-online-chatting-apppp.vercel.app" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                            Sign Up
                        </a>
                    </div>
                    <p style="color: #999; font-size: 14px; text-align: center;">
                        If you did not request this invitation, please ignore this email.
                    </p>
                </div>
            </div>
        `
    });
};