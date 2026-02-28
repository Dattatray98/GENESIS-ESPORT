import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAxios } from "@/hooks/useAxios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    MapPin,
    Timer,
    Lock,
    Key,
    Crosshair,
    ChevronLeft,
    Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
    _id: string;
    seasonId: { _id: string, title: string };
    matchNumber: number;
    gameName: string;
    mapName: string;
    dateTime: string;
    status: 'upcoming' | 'live' | 'completed';
    roomId?: string;
    password?: string;
    results?: any[];
}

export default function MatchIntel() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { request: fetchMatch, loading } = useAxios<Match>();
    const [match, setMatch] = useState<Match | null>(null);
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [overlayCountdown, setOverlayCountdown] = useState<number | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!matchId) return;
            try {
                const data = await fetchMatch({
                    url: `matches/${matchId}`,
                    method: 'GET'
                });
                if (data) setMatch(data);
            } catch (error) {
                console.error("Failed to load match details", error);
            }
        };
        loadData();
    }, [matchId, fetchMatch]);

    useEffect(() => {
        if (!match) return;

        let hasStartedCountdown = false;

        const calculateTimeLeft = () => {
            const difference = new Date(match.dateTime).getTime() - new Date().getTime();
            if (difference > 0) {
                hasStartedCountdown = true;
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                if (hasStartedCountdown) {
                    setIsTransitioning(true);
                    hasStartedCountdown = false;

                    setOverlayCountdown(3);

                    let count = 3;
                    const interval = setInterval(() => {
                        count -= 1;
                        if (count >= 0) {
                            setOverlayCountdown(count);
                        } else {
                            clearInterval(interval);
                            setIsTransitioning(false);
                        }
                    }, 1000);
                }
                setTimeLeft(null);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [match]);

    if (loading || !match) {
        return (
            <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-8 text-center overflow-hidden">
                <div className="w-24 h-24 border-8 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                <p className="text-yellow-500 font-teko text-4xl tracking-[0.2em] animate-pulse uppercase">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950 h-screen w-screen overflow-hidden text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black flex flex-col justify-center items-center relative">
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.8 } }}
                        className="fixed inset-0 z-9999 bg-black flex flex-col justify-center items-center overflow-hidden"
                    >
                        {/* Radar Sweep Background */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute w-[150vw] h-[150vw] md:w-[200vw] md:h-[200vw] rounded-full"
                            style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(239,68,68,0.3) 100%)' }}
                        />

                        {/* Scope/Crosshair Overlay */}
                        <motion.div
                            initial={{ scale: 3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                            className="relative z-10 flex flex-col items-center"
                        >
                            <Crosshair className="w-48 h-48 md:w-64 md:h-64 text-red-500/80 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse" />
                            <motion.h1
                                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-7xl md:text-[8rem] font-teko font-black text-transparent bg-clip-text bg-linear-to-b from-red-400 to-red-600 tracking-[0.2em] uppercase leading-none drop-shadow-[0_0_40px_rgba(239,68,68,0.8)] text-center italic"
                            >
                                Match Starting<br /> With In
                            </motion.h1>
                            <motion.div
                                key={overlayCountdown}
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.2 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6 md:mt-10 text-6xl md:text-[8rem] font-teko font-bold text-red-500 tracking-[0.2em] uppercase py-2 px-8"
                            >
                                {overlayCountdown === 0 || overlayCountdown === null ? "MATCH STARTED" : overlayCountdown.toString()}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tactical Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[60px_60px]"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05)_0%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full p-6 lg:p-8 xl:p-12 overflow-hidden relative flex flex-col z-10"
            >

                {/* Subtle Back Button for user navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-8 left-8 lg:top-12 lg:left-12 p-3 lg:p-4 text-yellow-500  z-100 flex items-center justify-center backdrop-blur-md group"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    title="Go Back"
                >
                    <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8 group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="flex flex-col gap-6 lg:gap-10 xl:gap-12 flex-1 overflow-hidden">
                    {/* Header */}
                    <div className="text-center space-y-4 lg:space-y-6 shrink-0">
                        <div className="px-6 py-2 rounded-2xl bg-yellow-500/10 text-yellow-500 text-xl font-black uppercase tracking-[0.3em] inline-flex items-center gap-3 mb-2 border border-yellow-500/20">
                            <Timer className="w-6 h-6" />
                            Pre-Match Status
                        </div>
                        <h1 className="text-6xl md:text-7xl lg:text-9xl font-teko font-black text-white uppercase tracking-tight leading-none drop-shadow-2xl">
                            Match #{match.matchNumber} <span className="text-yellow-500">Details</span>
                        </h1>
                        <p className="text-zinc-400 uppercase tracking-[0.4em] font-bold text-xl md:text-2xl lg:text-3xl">
                            {match.seasonId?.title || "Classified Operation"}
                        </p>
                    </div>

                    <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 min-h-0 items-center">
                        {/* Timer Panel */}
                        <div className="lg:col-span-7 flex flex-col justify-center items-center relative h-full w-full">
                            <Crosshair className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 lg:w-xl lg:h-144 text-yellow-500 opacity-[0.03] animate-[spin_60s_linear_infinite] pointer-events-none" />

                            <div className="relative z-10 flex items-center justify-center gap-4 mb-10 lg:mb-16">
                                <div className="h-px w-12 bg-yellow-500/30"></div>
                                <h4 className="text-yellow-500/80 text-lg lg:text-2xl font-black uppercase tracking-[0.4em]">Time to Deployment</h4>
                                <div className="h-px w-12 bg-yellow-500/30"></div>
                            </div>

                            {match.status === 'upcoming' ? (
                                <>
                                    {timeLeft ? (
                                        <div className="flex justify-center gap-6 md:gap-10 lg:gap-16 relative z-10 w-full mb-8">
                                            {[
                                                { label: 'Hours', value: timeLeft.hours },
                                                { label: 'Minutes', value: timeLeft.minutes },
                                                { label: 'Seconds', value: timeLeft.seconds }
                                            ].map((unit, i) => (
                                                <div key={i} className="flex flex-col items-center">
                                                    <div className="flex items-center justify-center mb-3">
                                                        <span className="text-5xl md:text-6xl lg:text-7xl xl:text-[6.5rem] font-teko font-bold text-white tracking-widest leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                                            {unit.value.toString().padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] md:text-xs lg:text-sm font-black text-yellow-500/70 uppercase tracking-[0.3em]">{unit.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-6 relative z-10 w-full text-center mb-6">
                                            <h2 className="text-5xl md:text-7xl lg:text-[7rem] font-teko font-black text-yellow-500 tracking-[0.2em] uppercase leading-none animate-pulse drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                                                Match Started
                                            </h2>
                                        </div>
                                    )}

                                    <div className="relative z-10 flex gap-4 text-center mt-2 mb-8">
                                        <div className="px-5 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg backdrop-blur-sm">
                                            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Game Mode</span>
                                            <span className="text-sm md:text-base font-bold text-white uppercase tracking-wider">{match.gameName}</span>
                                        </div>
                                        <div className="px-5 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg backdrop-blur-sm">
                                            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Operation</span>
                                            <span className="text-sm md:text-base font-bold text-white uppercase tracking-wider">Match #{match.matchNumber}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="py-8 relative z-10 w-full text-center mb-8">
                                    <h2 className={cn(
                                        "text-6xl md:text-7xl lg:text-[7rem] font-teko font-black tracking-[0.2em] uppercase leading-none animate-pulse",
                                        match.status === 'completed' ? "text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]" : "text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                                    )}>
                                        {match.status === 'completed' ? 'MATCH COMPLETED' : 'MATCH STARTED'}
                                    </h2>
                                </div>
                            )}

                            {/* View Leaderboard Button */}
                            <div className="relative z-10 mt-2">
                                <button
                                    onClick={() => navigate(`/leaderboard?matchId=${match._id}`)}
                                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-teko text-xl md:text-2xl font-bold uppercase tracking-wider rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                                >
                                    <Trophy className="w-5 h-5 mb-1" />
                                    View Match Standings
                                </button>
                            </div>
                        </div>

                        {/* Match Intel & Credentials Panel */}
                        <div className="lg:col-span-5 flex flex-col gap-10 lg:gap-14 justify-center h-full relative z-10 w-full">
                            <div className="px-6 lg:px-8 flex flex-col justify-center relative flex-1">
                                <div className="absolute top-0 right-10 p-8 opacity-5 pointer-events-none">
                                    <Lock className="w-24 h-24 lg:w-32 lg:h-32 text-yellow-500" />
                                </div>

                                <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
                                    <h4 className="text-yellow-500/70 text-sm lg:text-base font-black uppercase tracking-[0.4em]">Match Access Control</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-6 lg:gap-10 relative z-10">
                                    <div className="flex flex-col gap-2 relative pl-5 lg:pl-6">
                                        <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-zinc-800"></div>
                                        <span className="text-[10px] lg:text-3xl font-black text-zinc-500 uppercase flex items-center gap-2 lg:gap-3 mb-1 tracking-[0.3em]">
                                            <Lock className="w-5 h-5 lg:w-7 lg:h-7 text-yellow-500/50" /> Room ID
                                        </span>
                                        <div className="font-mono text-white text-3xl md:text-xl lg:text-[2.5rem] xl:text-5xl tracking-widest opacity-90 wrap-break-word">
                                            {match.roomId || <span className="text-zinc-700/80 italic text-xl lg:text-2xl font-rajdhani">ENCRYPTED</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 relative pl-5 lg:pl-6">
                                        <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-zinc-800"></div>
                                        <span className="text-[10px] lg:text-3xl font-black text-zinc-500 uppercase flex items-center gap-2 lg:gap-3 mb-1 tracking-[0.3em]">
                                            <Key className="w-5 h-5 lg:w-7 lg:h-7 text-yellow-500/50" /> Password
                                        </span>
                                        <div className="font-mono text-white text-3xl md:text-4xl lg:text-[2.5rem] xl:text-5xl tracking-widest opacity-90 wrap-break-word">
                                            {match.password || <span className="text-zinc-700/80 italic text-xl lg:text-2xl font-rajdhani">ENCRYPTED</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 lg:mt-10 flex justify-start z-10">
                                    <div className="text-[9px] lg:text-[10px] text-yellow-500/40 uppercase tracking-[0.4em] font-black inline-flex items-center gap-2 lg:gap-3">
                                        <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-yellow-500/30"></span>
                                        Strictly Confidential - Do not share outside squad
                                    </div>
                                </div>
                            </div>
                            {/* Intel */}
                            <div className="grid grid-cols-2 gap-6 lg:gap-12 flex-1 items-center">
                                <div className="px-6 lg:px-8 py-4 flex flex-col justify-center relative">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-1/2 bg-yellow-500/30"></div>
                                    <div className="flex items-center gap-3 text-zinc-500 mb-2 lg:mb-4">
                                        <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500/70" />
                                        <span className="text-xs lg:text-sm font-black uppercase tracking-[0.4em] text-yellow-500/60">Map Area</span>
                                    </div>
                                    <p className="text-4xl lg:text-5xl xl:text-6xl font-teko font-bold text-white tracking-wider uppercase opacity-90 leading-none wrap-break-word">
                                        {match.mapName}
                                    </p>
                                </div>
                                <div className="flex flex-col justify-center relative pl-5 lg:pl-6 border-l-[3px] border-yellow-500/40">
                                    <div className="flex items-center gap-2 md:gap-3 text-zinc-500 mb-2">
                                        <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500/70" />
                                        <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] text-yellow-500/60">Schedule</span>
                                    </div>
                                    <p className="text-4xl lg:text-5xl xl:text-6xl font-teko font-bold text-white tracking-wider pb-1 opacity-90 leading-none wrap-break-word">
                                        {new Date(match.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-[10px] lg:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 lg:mt-2">
                                        {new Date(match.dateTime).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Credentials */}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
