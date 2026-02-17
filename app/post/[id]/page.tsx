import { supabase } from '@/lib/supabaseClient'
import PostDetail from '@/components/PostDetail'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PostPage({ params }: PageProps) {
    const { id } = await params

    // 1. Fetch Post
    const { data: post, error: postError } = await supabase
        .from('posts')
        .select(`
      *,
      profiles (email)
    `)
        .eq('id', id)
        .single()

    if (postError || !post) {
        notFound()
    }

    // 2. Fetch Comments
    const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
      *,
      profiles (email)
    `)
        .eq('post_id', id)
        .order('created_at', { ascending: true })

    return (
        <PostDetail
            post={post}
            initialComments={comments || []}
        />
    )
}
