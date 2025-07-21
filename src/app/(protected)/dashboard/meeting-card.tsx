'use client'
import { Card } from '@/components/ui/card'
import { useDropzone } from 'react-dropzone'
import React, { useState } from 'react'
import { Presentation, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { uploadFile } from '@/lib/supabase/upload'
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const MeetingCard = () => {
    const { project } = useProject()
    const processMeeting = useMutation({mutationFn: async (data: {meetingUrl: string, meetingId: string, projectId: string}) => {
        const {meetingUrl, meetingId, projectId} = data
        const response = await axios.post('/api/process-meeting', {meetingUrl, meetingId, projectId})
        return response.data
    }})
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()
    const uploadMeeting = api.project.uploadMeeting.useMutation()
    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a']
        },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async acceptedFiles => {
            if(!project) return;
            if (!acceptedFiles || acceptedFiles.length === 0) {
                console.error('No files accepted.')
                alert('No file was selected. Please try again.')
                return
            }

            const file = acceptedFiles[0]
            if (!file) {
                console.error('File is undefined.')
                alert('Something went wrong with the file upload.')
                return
            }

            setIsUploading(true)
            try {
                const downloadUrl = await uploadFile(file)
                uploadMeeting.mutate({
                    projectId: project.id,
                    meetingUrl: downloadUrl,
                    name: file.name
                }, {
                    onSuccess: (meeting) => {
                        toast.success("Meeting uploaded successfully")
                        router.push('/meetings')
                        processMeeting.mutateAsync({meetingUrl: downloadUrl, meetingId: meeting.id, projectId: project.id})
                    },
                    onError: () => {
                        toast.error("Failed to upload meeting")
                    }
                })
                window.alert(`Uploaded successfully! File URL: ${downloadUrl}`)
            } catch (err) {
                console.error('Upload failed:', err)
                alert('Upload failed. Please try again.')
            } finally {
                setIsUploading(false)
            }
        }
    })
  return (
    <Card className='col-span-2 flex flex-col items-center justify-center p-10' {...getRootProps()} >
        {!isUploading && (
            <>
                <Presentation className='h-10 w-10 animate-bounce'/>
                <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                    Create a new meeting
                </h3>
                <p className='mt-1 text-center text-sm text-gray-500'>
                    Analyse your meeting with CodeMate.
                    <br />
                    Powered by AI
                </p>
                <div className='mt-6'>
                    <Button disabled={isUploading}>
                        <Upload className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden="true"/>
                        Upload Meeting
                        <input className='hidden' {...getInputProps()} />
                    </Button>
                </div>
            </>
        )}
        {isUploading && (
            <div>
                <p className='text-sm text-gray-500 text-center'>Uploading your meeting...</p>
            </div>
        )}
    </Card>
  )
}

export default MeetingCard