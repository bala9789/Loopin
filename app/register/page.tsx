'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })
            if (error) throw error
            alert('Registration successful! Please login.')
            router.push('/login')
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-400/5 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="relative bg-slate-950/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 shadow-2xl shadow-black/50">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                            New <span className="text-cyan-400">Entry</span>
                        </h2>
                        <p className="text-slate-500 text-sm font-mono tracking-wide">
                            CREATE SECURE IDENTITY FOR ACCESS
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border-l-2 border-red-500 text-red-300 p-4 mb-8 text-xs font-mono">
                            ERROR:: {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Email Protocol
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 p-4 text-white placeholder-slate-700 text-sm font-mono focus:outline-none focus:border-cyan-400/50 focus:bg-slate-900 transition-all focus:shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)]"
                                placeholder="new_user@sc.net"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Secure Key (Min 6 chars)
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 p-4 text-white placeholder-slate-700 text-sm font-mono focus:outline-none focus:border-cyan-400/50 focus:bg-slate-900 transition-all focus:shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)]"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-cyan-400 text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-cyan-300 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(34,211,238,0.5)] active:scale-[0.98]"
                        >
                            {loading ? 'Processing...' : 'Generate Identity'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-xs text-slate-600 font-mono uppercase tracking-wide">
                            Already verified?{' '}
                            <Link href="/login" className="text-white hover:text-cyan-400 underline decoration-1 underline-offset-4 transition-colors">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
