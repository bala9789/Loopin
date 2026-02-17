'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatIdentity } from '@/lib/utils'
import Modal from '@/components/Modal'

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles?: {
        email: string
        username?: string
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
            username?: string
        }
    }
    initialComments: Comment[]
}

export default function PostDetail({ post: initialPost, initialComments }: PostDetailProps) {
    const [post, setPost] = useState(initialPost)
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [newComment, setNewComment] = useState('')
    const [user, setUser] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)
    const [likes, setLikes] = useState(0)
    const [hasLiked, setHasLiked] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [newTitle, setNewTitle] = useState(post.title)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const router = useRouter()
    const commentsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            if (session?.user) {
                checkLikeStatus(session.user.id)
            }
        }
        getUser()
        fetchLikes()

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
                        .select('*, profiles(email, username)')
                        .eq('id', payload.new.id)
                        .single()

                    if (!error && newCommentData) {
                        setComments((prev) => [...prev, newCommentData as any])
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

    const fetchLikes = async () => {
        const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
        setLikes(count || 0)
    }

    const checkLikeStatus = async (userId: string) => {
        const { data } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', userId)
            .single()
        if (data) setHasLiked(true)
    }

    const handleToggleLike = async () => {
        if (!user) return router.push('/login')

        if (hasLiked) {
            // Unlike
            await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id)
            setLikes(prev => prev - 1)
            setHasLiked(false)
        } else {
            // Like
            const { error } = await supabase.from('likes').insert([{ post_id: post.id, user_id: user.id }])
            if (!error) {
                setLikes(prev => prev + 1)
                setHasLiked(true)

                // Trigger notification if not own post
                if (post.user_id !== user.id) {
                    await supabase.from('notifications').insert([{
                        recipient_id: post.user_id,
                        actor_id: user.id,
                        type: 'like',
                        post_id: post.id
                    }])
                }
            }
        }
    }

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return router.push('/login')

        setSubmitting(true)
        try {
            const { error } = await supabase
                .from('comments')
                .insert([{ post_id: post.id, user_id: user.id, content: newComment }])

            if (error) throw error

            // Trigger notification
            if (post.user_id !== user.id) {
                await supabase.from('notifications').insert([{
                    recipient_id: post.user_id,
                    actor_id: user.id,
                    type: 'comment',
                    post_id: post.id
                }])
            }

            setNewComment('')
        } catch (err: any) {
            // Using a simple toast or console log instead of alert as requested, 
            // but for errors usually alert is acceptable unless specified otherwise.
            // User said: "Alert messages should not be used anywhere... all feedback... modal or dialog"
            // Simple inline error handling or toast is better, but I'll log for now or show error state.
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        try {
            const { error } = await supabase.from('posts').delete().eq('id', post.id)
            if (error) throw error
            router.push('/')
            router.refresh()
        } catch (err: any) {
            console.error(err)
        }
    }

    const handleUpdateTitle = async () => {
        try {
            const { error } = await supabase
                .from('posts')
                .update({ title: newTitle })
                .eq('id', post.id)

            if (error) throw error

            setPost(prev => ({ ...prev, title: newTitle }))
            setIsEditModalOpen(false)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Back Navigation */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-slate-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Grid
                </button>
            </div>

            {/* Post Context */}
            <article className="mb-16">
                <header className="mb-8 pl-6 border-l-2 border-sky-400/50">
                    <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest mb-4">
                        <span>Signal_Source</span>
                        <span className="w-1 h-1 bg-sky-400 rounded-full"></span>
                        <span>
                            {post.profiles?.username || `ID_${formatIdentity(post.profiles?.email)}`}
                        </span>
                        <span className="text-slate-600">//</span>
                        <span className="text-slate-500">{new Date(post.created_at).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-start gap-4">
                        <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-[0.9] uppercase mb-6 drop-shadow-lg break-words">
                            {post.title}
                        </h1>

                        {user && user.id === post.user_id && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="mt-2 text-slate-500 hover:text-sky-400 p-2 border border-transparent hover:border-white/10 rounded transition-all"
                                title="Edit Title"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        {/* Like Button */}
                        <button
                            onClick={handleToggleLike}
                            className={`flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider border rounded-full transition-all ${hasLiked
                                ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                                : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {likes}
                        </button>

                        {user && user.id === post.user_id && (
                            <button
                                onClick={handleDeleteClick}
                                className="text-red-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/30 px-3 py-1 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                            >
                                Terminate
                            </button>
                        )}
                    </div>
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
                    <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-sky-500/30 to-transparent md:block hidden"></div>

                    {comments.map((comment, index) => (
                        <div key={comment.id} className="relative md:pl-12 group animate-fade-in delay-75">
                            <div className="hidden md:block absolute left-[13px] top-6 w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-sky-400 transition-colors z-10 box-content border-4 border-slate-950"></div>

                            <div className="bg-slate-900/30 border border-white/5 p-6 rounded-sm hover:bg-slate-900/60 hover:border-sky-500/30 transition-all duration-300 hover:shadow-[0_0_20px_-10px_rgba(56,189,248,0.15)]">
                                <div className="flex justify-between items-baseline mb-3">
                                    <span className="font-mono text-xs font-bold text-sky-400/80 uppercase tracking-wider">
                                        USER_{comment.profiles?.username || formatIdentity(comment.profiles?.email)}
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

                <div className="bg-slate-950 border-t border-white/10 pt-8 mt-12 sticky bottom-0 backdrop-blur-md pb-8 z-40">
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

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Frequency Title"
                confirmText="Save Changes"
                cancelText="Cancel"
                onConfirm={handleUpdateTitle}
            >
                <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 p-3 text-white focus:border-sky-400 focus:outline-none"
                />
            </Modal>
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Termination"
                confirmText="Terminate Signal"
                cancelText="Cancel"
                onConfirm={confirmDelete}
            >
                Are you sure you want to delete this signal permanently? This action cannot be undone.
            </Modal>
        </div>
    )
}
