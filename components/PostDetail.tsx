'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { formatIdentity } from '@/lib/utils'

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles?: {
        email: string
    }
}

interface PostDetailProps {
    post: {
        id: string
        title: string
        content: string
        created_at: string
        user_id: string
        profiles: {
            email: string
        }
    }
    initialComments: Comment[]
}

export default function PostDetail({ post, initialComments }: PostDetailProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [newComment, setNewComment] = useState('')
    const [user, setUser] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()
    const commentsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
        }
        getUser()

        const channel = supabase
            .channel(`comments:post_id=eq.${post.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `post_id=eq.${post.id}`,
                },
                async (payload) => {
                    const { data: newCommentData, error } = await supabase
                        .from('comments')
                        .select('*, profiles(email)')
                        .eq('id', payload.new.id)
                        .single()

                    if (!error && newCommentData) {
                        setComments((prev) => [...prev, newCommentData])
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [post.id])

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [comments])

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return router.push('/login')

        setSubmitting(true)
        try {
            const { error } = await supabase
                .from('comments')
                .insert([{ post_id: post.id, user_id: user.id, content: newComment }])

            if (error) throw error
            setNewComment('')
        } catch (err: any) {
            alert('Error: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeletePost = async () => {
        if (!confirm('CONFIRM DELETE? This action is permanent.')) return
        try {
            const { error } = await supabase.from('posts').delete().eq('id', post.id)
            if (error) throw error
            router.push('/')
            router.refresh()
        } catch (err: any) {
            alert('Error: ' + err.message)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Post Context */}
            <article className="mb-16">
                <header className="mb-8 pl-6 border-l-2 border-sky-400/50">
                    <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest mb-4">
                        <span>Signal_Source</span>
                        <span className="w-1 h-1 bg-sky-400 rounded-full"></span>
                        <span>ID_{formatIdentity(post.profiles?.email)}</span>
                        <span className="text-slate-600">//</span>
                        <span className="text-slate-500">{new Date(post.created_at).toLocaleString()}</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-[0.9] uppercase mb-6 drop-shadow-lg">
                        {post.title}
                    </h1>

                    {user && user.id === post.user_id && (
                        <button
                            onClick={handleDeletePost}
                            className="text-red-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/30 px-3 py-1 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                        >
                            Terminate Signal
                        </button>
                    )}
                </header>

                <div className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium whitespace-pre-wrap pl-6 md:pl-8 border-l border-white/5">
                    {post.content}
                </div>
            </article>

            {/* Comments System */}
            <section className="relative">
                <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                        Response Stream
                    </h3>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-white/5 px-2 py-1 rounded">
                        COUNT: {comments.length}
                    </span>
                </div>

                <div className="space-y-8 mb-16 relative">
                    {/* Timeline Line - Gradient Blue */}
                    <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-sky-500/30 to-transparent md:block hidden"></div>

                    {comments.map((comment, index) => (
                        <div key={comment.id} className="relative md:pl-12 group animate-fade-in delay-75">
                            {/* Dot */}
                            <div className="hidden md:block absolute left-[13px] top-6 w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-sky-400 transition-colors z-10 box-content border-4 border-slate-950"></div>

                            <div className="bg-slate-900/30 border border-white/5 p-6 rounded-sm hover:bg-slate-900/60 hover:border-sky-500/30 transition-all duration-300 hover:shadow-[0_0_20px_-10px_rgba(56,189,248,0.15)]">
                                <div className="flex justify-between items-baseline mb-3">
                                    <span className="font-mono text-xs font-bold text-sky-400/80 uppercase tracking-wider">
                                        USER_{formatIdentity(comment.profiles?.email)}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-600">
                                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-slate-300 leading-relaxed text-sm font-medium">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={commentsEndRef} />
                </div>

                {/* Comment Form */}
                <div className="bg-slate-950 border-t border-white/10 pt-8 mt-12 sticky bottom-0 backdrop-blur-md pb-8">
                    {user ? (
                        <form onSubmit={handleSubmitComment} className="relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 p-4 pr-32 text-white font-medium focus:outline-none focus:border-sky-400 focus:bg-slate-800 transition-all resize-none h-24 rounded-sm shadow-inner"
                                placeholder="Append response to stream..."
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="absolute right-3 bottom-3 bg-white text-black px-5 py-2 font-bold uppercase text-[10px] tracking-widest hover:bg-sky-400 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
                            >
                                {submitting ? 'Sending...' : 'Transmit'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-8 bg-slate-900/30 border border-dashed border-white/10 rounded-sm">
                            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-4">Read-Only Mode</p>
                            <button
                                onClick={() => router.push('/login')}
                                className="text-white hover:text-sky-400 font-bold uppercase text-sm border-b border-transparent hover:border-sky-400 transition-all pb-0.5"
                            >
                                Login to Respond &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
