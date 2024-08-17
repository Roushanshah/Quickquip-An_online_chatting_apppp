'use client'
import { addFriendValidator } from '@/lib/validations/add-friend'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from './ui/Button'


interface AddFriendButtonProps {
  
}

type FormData = z.infer<typeof addFriendValidator>

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
        const [showSuccessfulState, setShowSuccessfulState] = useState<boolean>(false)
        const [invitePrompt, setInvitePrompt] = useState<boolean>(false)
        const [isRegistered, setIsRegistered] = useState<boolean>(true);
        const [emailToInvite, setEmailToInvite] = useState<string>('')
        const [isLoading, setIsLoading] = useState<boolean>(false)

        const {register, handleSubmit, setError, formState:{errors}} = useForm<FormData>({
            resolver: zodResolver(addFriendValidator),
        })

        const checkIfRegistered = async (email: string) => {
            try{
                const validatedEmail = addFriendValidator.parse({email}) 

                const response = await axios.post('/api/friends/check', {email: validatedEmail});

                return response.data.isRegistered

            } catch(error) {
                setError('email', {message: 'Error checking resistration status'});
                return true;
            }
        };

        const addFriend = async (email:string, sendInvite: boolean) => {
            try{
                const validatedEmail = addFriendValidator.parse({email})

                await axios.post('/api/friends/add', {
                    email: validatedEmail,
                    sendInvite,
                })

                setShowSuccessfulState(true)
            } catch(error) {
                if(error instanceof z.ZodError){
                    setError('email', {message: error.message})
                    return
                }

                if(error instanceof AxiosError){
                    setError('email', {message: error.response?.data})
                    return
                }
                setError('email', {message: 'Something went wrong.'})
            }
        }

        const onSubmit = async (data: FormData) => {
            const registered = await checkIfRegistered(data.email)
            setIsRegistered(registered)
            setEmailToInvite(data.email)
            if(!registered) {
                setInvitePrompt(true)
            } else{
                addFriend(data.email, false)
            }
        };

        const handleConfirmInvite = async (sendInvite: boolean) => {
            setIsLoading(true)
            await addFriend(emailToInvite, sendInvite);
            setIsLoading(false)
            setInvitePrompt(false);
        }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
                <label htmlFor='email' className='block text-sm  font-medium leading-6 text-gray-900'>
                    Add a friend by E-Mail
                </label>
                <div className='mt-2 flex gap-4'>
                    <input 
                        type='text' 
                        className='block w-full rounded-md border0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                        placeholder='you@example.com'
                        {...register('email')}
                    />
                    <Button>Add</Button>
                </div>
                <p className='mt-1 text-sm text-red-600'>{errors.email?.message}</p>
                {showSuccessfulState ? (
                    <p className='mt-1 text-sm text-green-600'>Friend request sent</p>
                ) : null}
            </form>
            {
                invitePrompt && !isRegistered && (
                    <div className='mt-4 p-4 bg-gray-200 rounded-md'>
                        <p className='mb-4'>This email is not registered. Do you want to send an invitation email?</p>
                        <div className='flex gap-2'>
                            <Button
                            isLoading={isLoading}
                            onClick={() => handleConfirmInvite(true)} 
                            >
                                Yes, Send Invite
                            </Button>
                            <Button
                            onClick={() => handleConfirmInvite(false)} 
                            >
                                No
                            </Button>
                        </div>
                    </div>
                )
            }
        </div>
        
    )    
}

export default AddFriendButton