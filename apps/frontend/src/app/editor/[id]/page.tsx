'use client'

import { useParams } from 'next/navigation'
import { VideoEditor } from '@/components/editor/VideoEditor'

export default function EditorPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <div className="h-screen overflow-hidden bg-telegram-bg">
      <VideoEditor projectId={projectId} />
    </div>
  )
}



