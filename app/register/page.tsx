'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [usernameError, setUsernameError] = useState<string | null>(null)
    const [usernameAvailable, setUsernameAvailable] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    // Debounce username check
    useEffect(() => {
        const checkUsername = async () => {
            if (username.length < 3) {
                setUsernameError('Username must be at least 3 chars')
                setUsernameAvailable(false)
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username)
                .single()

            if (data) {
                setUsernameError('Username already taken')
                setUsernameAvailable(false)
            } else {
                setUsernameError(null)
                setUsernameAvailable(true)
            }
        }

        const timer = setTimeout(() => {
            if (username) checkUsername()
        }, 500)

        return () => clearTimeout(timer)
    }, [username])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!usernameAvailable) return

        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                    },
                },
            })
            if (error) throw error

            // Manually update profile just in case trigger doesn't handle metadata
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ username: username })
                    .eq('id', data.user.id)

                if (profileError) {
                    // Ignore RLS errors if insert happened via trigger, but log it
                    console.warn('Profile update warning:', profileError)
                }
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-green-500/10 border border-green-500 text-green-400 p-8 rounded-lg text-center shadow-lg backdrop-blur-md">
                    <h3 className="text-2xl font-bold mb-2">Registration Successful</h3>
                    <p className="font-mono text-sm">Redirecting to login...</p>
                </div>
            </div>
        )
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
                                Unique Handle (Username)
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                                }}
                                className={`w-full bg-slate-900/50 border p-4 text-white placeholder-slate-700 text-sm font-mono focus:outline-none transition-all ${usernameError
                                        ? 'border-red-500 focus:border-red-500'
                                        : usernameAvailable
                                            ? 'border-green-500/50 focus:border-green-500'
                                            : 'border-white/10 focus:border-cyan-400/50'
                                    }`}
                                placeholder="neo_user_01"
                                required
                                minLength={3}
                            />
                            {usernameError && (
                                <p className="text-red-400 text-xs font-mono mt-1">{usernameError}</p>
                            )}
                            {usernameAvailable && !usernameError && username && (
                                <p className="text-green-400 text-xs font-mono mt-1">✓ Handle Available</p>
                            )}
                        </div>

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
                            disabled={loading || !usernameAvailable}
                            className="w-full mt-4 bg-cyan-400 text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-cyan-300 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(34,211,238,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
