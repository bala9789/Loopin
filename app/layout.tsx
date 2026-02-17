import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
    subsets: ["latin"],
    display: "swap",
    weight: ["300", "400", "600", "700", "900"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    title: "LOOPIN. | THE PULSE OF HUMAN DISCOURSE",
    description: "A premium, futuristic community forum.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${outfit.variable} scroll-smooth`}>
            <body className="font-outfit antialiased selection:bg-sky-400/30 selection:text-white bg-slate-950 overflow-x-hidden text-slate-200">

                {/* Uniform Cool Background */}
                <div className="fixed inset-0 z-[-1] pointer-events-none bg-slate-950">
                    {/* subtle unified ambient glow from bottom-center */}
                    <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-[radial-gradient(ellipse_100%_100%_at_50%_100%,rgba(56,189,248,0.08),transparent)]"></div>

                    {/* Subtle Grid Overlay */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center"></div>
                </div>

                {/* Top Accent Line - Cool Gradient */}
                <div className="fixed top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 z-[100] shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>

                <Navbar />

                <main className="relative z-10 pt-24 pb-12 px-6 container mx-auto max-w-7xl animate-fade-in">
                    {children}
                </main>
            </body>
        </html>
    );
}
