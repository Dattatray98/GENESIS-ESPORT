import { Button } from "@/components/ui/Button";
import { TOURNAMENT_INFO } from "@/constants/data";
import { MapPin, Calendar, Clock, Crosshair, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function calculateTimeLeft() {
    // Set target date to March 15, 2026 10:30 AM
    const targetDate = new Date("2026-02-28T10:30:00").getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
}

export default function Hero() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents: JSX.Element[] = [];

    const intervals: Array<keyof typeof timeLeft> = ["days", "hours", "minutes", "seconds"];
    intervals.forEach((interval) => {
        if (timeLeft[interval] !== undefined) {
            timerComponents.push(
                <div key={interval} className="flex flex-col items-center bg-zinc-900/80 border border-yellow-500/30 p-4 rounded-lg backdrop-blur-sm min-w-[80px]">
                    <span className="text-4xl font-teko font-bold text-yellow-400">
                        {String(timeLeft[interval]).padStart(2, '0')}
                    </span>
                    <span className="text-xs uppercase text-gray-400 tracking-wider">{interval}</span>
                </div>
            );
        }
    });

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80')] bg-cover bg-center opacity-30 transform scale-105" />
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1 border border-yellow-500/30 rounded-full bg-yellow-500/10 mb-6 backdrop-blur-md">
                        <Crosshair className="w-4 h-4 text-yellow-500 animate-pulse" />
                        <span className="text-yellow-500 font-bold tracking-widest text-sm font-teko uppercase">
                            {TOURNAMENT_INFO.subtitle}
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 mb-1 tracking-tighter drop-shadow-2xl">
                        {TOURNAMENT_INFO.name}
                    </h1>
                    <p className="text-2xl md:text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 mb-6 tracking-tighter drop-shadow-2xl">{TOURNAMENT_INFO.subheading}</p>

                    <div className="flex flex-wrap justify-center gap-6 mb-12 text-lg md:text-xl font-medium text-gray-300">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-yellow-500" />
                            <span>{TOURNAMENT_INFO.date}</span>
                        </div>
                        <div className="hidden md:block w-px h-6 bg-gray-700" />
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-yellow-500" />
                            <span>{TOURNAMENT_INFO.location}</span>
                        </div>
                    </div>

                    {/* Countdown */}
                    <div className="flex justify-center gap-4 mb-12">
                        {timerComponents.length ? timerComponents :
                            <span className="text-2xl text-yellow-500 font-teko">TOURNAMENT LIVE!</span>}
                    </div>

                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        {user?.role === 'admin' && (
                            <Button size="xl" variant="neon" className="gap-2 group" onClick={() => navigate("/admin/entry")}>
                                REGISTER SQUAD
                                <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </Button>
                        )}
                        <Button size="xl" variant="neonOutline" className="gap-2 group" onClick={() => navigate("/leaderboard")}>
                            VIEW LEADERBOARD
                            <Trophy className="w-5 h-5 group-hover:rotate-45 transition-transform text-yellow-500" />
                        </Button>
                        <Button size="xl" variant="neonOutline" className="gap-2" onClick={() => {
                            const element = document.getElementById("schedule");
                            if (element) element.scrollIntoView({ behavior: "smooth" });
                        }}>
                            <Clock className="w-5 h-5" />
                            SCHEDULE
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-black to-transparent pointer-events-none" />
        </section>
    );
}
