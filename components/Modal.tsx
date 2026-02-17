'use client'

import React, { useEffect } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
    onCancel?: () => void
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onCancel || onClose} />

            {/* Modal Content */}
            <div className="relative bg-slate-900 border border-white/10 rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all scale-100 opacity-100 animate-fade-in-up">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white font-mono text-xl">&times;</button>
                </div>

                {/* Body */}
                <div className="text-slate-300 mb-6 font-medium leading-relaxed">
                    {children}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    {cancelText && (
                        <button
                            onClick={onCancel || onClose}
                            className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}
                    {confirmText && (
                        <button
                            onClick={onConfirm}
                            className="px-6 py-2 bg-sky-500 text-white font-bold uppercase tracking-wider text-sm hover:bg-sky-400 transition-colors rounded-sm shadow-lg hover:shadow-sky-500/20"
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
