'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { formatIdentity } from '@/lib/utils'

interface Notification {
    id: string
    actor_id: string
    type: 'like' | 'comment'
    post_id: string
    created_at: string
    read: boolean
    actor?: {
        username?: string
        email: string
    }
}

export default function NotificationPanel({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select(`
          *,
          actor:actor_id (
            username,
            email
          )
        `)
                .eq('recipient_id', userId)
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) {
                // cast to any because actor relation might return array or object depending on layout
                // usually returns object with single relation
                setNotifications(data as any)
            }
            setLoading(false)
        }

        fetchNotifications()

        // Realtime subscription
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${userId}`,
                },
                (payload) => {
                    // Verify we have actor data, simpler to just refetch top to get joined data
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const markAsRead = async (id: string) => {
        await supabase.from('notifications').update({ read: true }).eq('id', id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    if (loading) return <div className="p-4 text-xs font-mono text-slate-500">Scanning frequency...</div>

    if (notifications.length === 0) {
        return <div className="p-4 text-xs font-mono text-slate-500">No signals detected.</div>
    }

    return (
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-sky-500/5' : ''}`}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                >
                    <Link href={`/post/${notif.post_id}`} className="block">
                        <div className="flex items-start gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full ${!notif.read ? 'bg-sky-400 animate-pulse' : 'bg-slate-700'}`}></div>
                            <div>
                                <p className="text-xs text-slate-300 font-mono mb-1">
                                    <span className="text-sky-400 font-bold">
                                        {notif.actor?.username || formatIdentity(notif.actor?.email)}
                                    </span>
                                    {' '}
                                    {notif.type === 'like' ? 'endorsed your signal' : 'responded to frequency'}
                                </p>
                                <p className="text-[10px] text-slate-600 font-mono uppercase">
                                    {new Date(notif.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    )
}
