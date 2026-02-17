'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { formatIdentity } from '@/lib/utils'

export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
        }
        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
                {/* Brand */}
                <Link
                    href="/"
                    className="text-2xl font-black italic tracking-tighter text-white hover:text-sky-400 transition-all duration-300 uppercase group"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">Loopin</span>
                    <span className="text-white group-hover:text-sky-400">.</span>
                </Link>

                {/* Navigation */}
                <div className="flex items-center space-x-8">
                    {user ? (
                        <>
                            <div className="hidden md:flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                                <span className="text-xs text-slate-400 font-mono tracking-wide uppercase">
                                    ID: {formatIdentity(user.email)}
                                </span>
                            </div>

                            <Link
                                href="/create"
                                className="bg-zinc-100 hover:bg-sky-400 hover:text-black text-black text-sm font-bold uppercase tracking-wide px-5 py-2.5 rounded-sm transition-all duration-200 shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_-5px_rgba(56,189,248,0.6)]"
                            >
                                + Initialize
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="text-slate-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors duration-200 hover:scale-105"
                            >
                                Exit
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-wide transition-colors duration-200"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="bg-transparent border border-white/20 text-white hover:border-sky-400 hover:text-sky-400 text-sm font-bold uppercase tracking-wide px-6 py-2.5 rounded-sm transition-all duration-200 backdrop-blur-sm hover:bg-sky-400/10 hover:shadow-[0_0_15px_-5px_rgba(56,189,248,0.5)]"
                            >
                                Join Network
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
