'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { formatIdentity } from '@/lib/utils'
import Modal from '@/components/Modal'
import NotificationPanel from '@/components/NotificationPanel'

export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const router = useRouter()
    const notifRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
        }
        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setProfile(null)
        })

        // Click outside for notifications
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            subscription.unsubscribe()
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', userId)
            .single()
        if (data) setProfile(data)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setShowLogoutModal(false)
        router.refresh()
    }

    return (
        <>
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
                                {/* Notifications */}
                                <div className="relative" ref={notifRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {/* TODO: Add unread count logic here if desired, requires extra query */}
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-sm shadow-xl z-50 overflow-hidden animate-fade-in-up">
                                            <div className="p-3 border-b border-white/5 bg-slate-950/50">
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Signals</h4>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                <NotificationPanel userId={user.id} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Identity Badge */}
                                <div className="hidden md:flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                                    <span className="text-xs text-slate-400 font-mono tracking-wide uppercase">
                                        ID: {profile?.username || formatIdentity(user.email)}
                                    </span>
                                </div>

                                <Link
                                    href="/create"
                                    className="bg-zinc-100 hover:bg-sky-400 hover:text-black text-black text-sm font-bold uppercase tracking-wide px-5 py-2.5 rounded-sm transition-all duration-200 shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_-5px_rgba(56,189,248,0.6)]"
                                >
                                    + Initialize
                                </Link>

                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="text-slate-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors duration-200 hover:scale-105"
                                >
                                    Logout
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

            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Terminate Session"
                confirmText="OK"
                cancelText="Cancel"
                onConfirm={handleLogout}
            >
                Are you sure you want to logout? This will terminate your secure connection.
            </Modal>
        </>
    )
}
