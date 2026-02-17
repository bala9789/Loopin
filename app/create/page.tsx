'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CreatePostPage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
            }
        }
        checkUser()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('posts')
                .insert([{ title, content, user_id: user.id }])

            if (error) throw error

            router.push('/')
            router.refresh()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter mb-4">
                    Open <span className="text-sky-400">Channel</span>
                </h1>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                    Initiate secure transmission to network
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm border border-white/10 p-8 md:p-10 rounded-sm relative overflow-hidden group">
                {/* Glow - Cool Blue */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/5 blur-[80px] pointer-events-none rounded-full"></div>

                <div className="relative z-10 space-y-8">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Subject Header
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900/50 border-b border-white/10 py-4 text-2xl md:text-3xl text-white font-bold placeholder-slate-800 focus:outline-none focus:border-sky-400 transition-all"
                            placeholder="TITLE_GOES_HERE..."
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Data Payload
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-transparent border border-white/5 p-6 text-slate-300 font-medium focus:outline-none focus:border-white/20 focus:bg-slate-900/50 transition-all h-64 resize-none leading-relaxed text-lg rounded-sm"
                            placeholder="Start your transmission..."
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-slate-600 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-sky-400 text-slate-950 px-10 py-3 font-bold uppercase tracking-widest text-xs hover:bg-sky-300 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(56,189,248,0.6)] active:scale-95"
                        >
                            {loading ? 'Transmitting...' : 'Broadcast'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
