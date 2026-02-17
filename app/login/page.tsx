'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            router.push('/')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md relative">
                {/* Glow Element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-sky-400/5 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="relative bg-slate-950/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 shadow-2xl shadow-black/50">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                            Identify <span className="text-sky-400">Self</span>
                        </h2>
                        <p className="text-slate-500 text-sm font-mono tracking-wide">
                            ENTER CREDENTIALS TO ACCESS NETWORK
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border-l-2 border-red-500 text-red-300 p-4 mb-8 text-xs font-mono">
                            ERROR:: {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                User ID / Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 p-4 text-white placeholder-slate-700 text-sm font-mono focus:outline-none focus:border-sky-400/50 focus:bg-slate-900 transition-all focus:shadow-[0_0_20px_-5px_rgba(56,189,248,0.3)]"
                                placeholder="agent@loopin.net"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Passcode
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 p-4 text-white placeholder-slate-700 text-sm font-mono focus:outline-none focus:border-sky-400/50 focus:bg-slate-900 transition-all focus:shadow-[0_0_20px_-5px_rgba(56,189,248,0.3)]"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-sky-400 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(56,189,248,0.5)] active:scale-[0.98]"
                        >
                            {loading ? 'Authenticating...' : 'Establish Connection'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-xs text-slate-600 font-mono uppercase tracking-wide">
                            New Signal Source?{' '}
                            <Link href="/register" className="text-white hover:text-sky-400 underline decoration-1 underline-offset-4 transition-colors">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
