import Link from 'next/link'
import { formatIdentity } from '@/lib/utils'

interface PostProps {
    post: {
        id: string
        title: string
        content: string
        created_at: string
        profiles?: {
            email: string
        } | null
        [key: string]: any
    }
}

export default function PostCard({ post }: PostProps) {
    const authorEmail = post.profiles?.email || 'Unknown User'
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    // Hash ID for visual uniqueness
    const shortId = post.id.substring(0, 6).toUpperCase();

    return (
        <Link href={`/post/${post.id}`} className="group block h-full">
            <article className="h-full relative overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-white/5 hover:border-sky-400/40 transition-all duration-300 rounded-sm p-6 flex flex-col justify-between group-hover:bg-slate-900/60 group-hover:shadow-[0_0_40px_-15px_rgba(56,189,248,0.15)] group-hover:-translate-y-1">

                {/* Glow Element - Cool Blue */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-400/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div>
                    {/* Meta Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-mono font-bold text-sky-400/80 uppercase tracking-widest">
                                Thread_ID_{shortId}
                            </span>
                        </div>
                        <time className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">{date}</time>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-sky-300 transition-colors duration-200 line-clamp-2 tracking-tight">
                        {post.title}
                    </h3>

                    {/* Content Preview */}
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                        {post.content}
                    </p>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between group-hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-[8px] font-bold text-slate-400">
                            {formatIdentity(post.profiles?.email).charAt(0)}
                        </div>
                        <span className="text-xs font-mono text-slate-500 group-hover:text-slate-300 transition-colors truncate max-w-[120px]">
                            User_{formatIdentity(post.profiles?.email)}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 group-hover:text-sky-400/80 transition-colors tracking-widest">
                        Read &rarr;
                    </span>
                </div>
            </article>
        </Link>
    )
}
