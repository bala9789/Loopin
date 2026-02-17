import { supabase } from '@/lib/supabaseClient'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
      *,
      profiles (email)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching posts:', error)
        return (
            <div className="mt-20 p-8 border border-red-500/20 bg-red-500/5 backdrop-blur-sm rounded-sm text-center">
                <h3 className="text-red-400 font-mono text-sm uppercase tracking-widest mb-2">System Failure</h3>
                <p className="text-red-200/60 text-sm">Could not retrieve data stream.</p>
            </div>
        )
    }

    return (
        <div className="min-h-[80vh] flex flex-col justify-start pt-10">
            {/* Hero Section */}
            <header className="mb-20 text-center relative max-w-4xl mx-auto">
                {/* Decorative elements - Cool Blue */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-sky-400/5 blur-[100px] rounded-full pointer-events-none z-[-1]"></div>

                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 mb-6 tracking-tighter uppercase leading-[0.9]">
                    The Signal <br /> <span className="text-stroke-blue text-sky-400/20">Network</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                    A decentralized hub for raw discourse. <br />
                    <span className="text-white font-semibold">No algorithms.</span> Just pure signal.
                </p>

                <div className="flex justify-center gap-4">
                    <Link
                        href="/create"
                        className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-slate-950 transition-all duration-200 bg-sky-400 font-mono text-sm uppercase tracking-widest hover:bg-sky-300 hover:scale-105 hover:shadow-[0_0_30px_-10px_rgba(56,189,248,0.6)]"
                    >
                        Broadcast
                        <span className="absolute inset-0 border border-white/20 group-hover:border-white/40 pointer-events-none"></span>
                    </Link>
                    <a
                        href="#feed"
                        className="inline-flex items-center justify-center px-8 py-3 font-bold text-slate-400 transition-all duration-200 border border-white/5 bg-white/5 font-mono text-sm uppercase tracking-widest hover:bg-white/10 hover:text-white backdrop-blur-sm"
                    >
                        Explore
                    </a>
                </div>
            </header>

            {/* Content Feed */}
            <section id="feed" className="w-full">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <h2 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-widest">
                        Latest Transmissions
                    </h2>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        LIVE_FEED :: ONLINE
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {posts && posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center border border-dashed border-white/10 bg-white/[0.02] rounded-sm">
                            <h2 className="text-2xl font-bold text-slate-700 mb-2 uppercase tracking-wide">Void Detected</h2>
                            <p className="text-slate-600 mb-8 font-mono text-sm">No signals found in this sector.</p>
                            <Link
                                href="/create"
                                className="text-sky-400 hover:text-sky-300 font-mono text-sm uppercase tracking-widest underline decoration-1 underline-offset-4"
                            >
                                Initiate First Post
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
