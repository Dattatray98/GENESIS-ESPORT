import React, { useEffect, useMemo } from 'react';
import { useLeaderboard } from '@/context/LeaderboardContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Zap, TrendingUp, Shield } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function ObsOverlay() {
    const { seasonId } = useParams<{ seasonId: string }>();
    const { teams, loading, refreshTeams, setSeasonId } = useLeaderboard();
    const [tickerIndex, setTickerIndex] = React.useState(0);

    // Sync season ID with context
    useEffect(() => {
        if (seasonId) {
            setSeasonId(seasonId);
        }
    }, [seasonId, setSeasonId]);

    // Filter verified teams only and ensure they match the season
    const verifiedTeams = useMemo(() => {
        return teams.filter(t => {
            const matchesSeason = !seasonId ||
                (typeof t.seasonId === 'string' ? t.seasonId === seasonId : t.seasonId?._id === seasonId);
            return t.isVerified && matchesSeason;
        });
    }, [teams, seasonId]);

    // Refresh teams periodically
    useEffect(() => {
        const interval = setInterval(() => {
            refreshTeams();
        }, 3000); // 3s refresh for real-time live feel
        return () => clearInterval(interval);
    }, [refreshTeams]);

    const stats = useMemo(() => {
        const squadsInGame = verifiedTeams.filter(t => (t.alivePlayers ?? 4) > 0).length;
        const totalSurvivors = verifiedTeams.reduce((acc, t) => acc + (t.alivePlayers ?? 0), 0);
        return { squadsInGame, totalSurvivors };
    }, [verifiedTeams]);

    // Bottom Ticker messages
    const tickerMessages = useMemo(() => {
        if (verifiedTeams.length === 0) return ["WAITING FOR SQUAD DEPLOYMENT...", "STAY TUNED!"];

        const topTeam = verifiedTeams[0];
        const secondTeam = verifiedTeams[1];
        const mostKills = [...verifiedTeams].sort((a, b) => b.totalKills - a.totalKills)[0];

        return [
            `TOURNAMENT LEAD: ${topTeam.teamName.toUpperCase()} WITH ${topTeam.totalPoints} PTS`,
            `SURVIVORS ON FIELD: ${stats.totalSurvivors} PLAYERS`,
            `MOST LETHAL TEAM: ${mostKills.teamName.toUpperCase()} (${mostKills.totalKills} KILLS)`,
            `CHASE IS ON: ${secondTeam?.teamName?.toUpperCase() || 'N/A'} AT #${secondTeam?.rank || 2}`,
            "BATTLEGROUNDS MOBILE INDIA TOURNAMENT LIVE"
        ];
    }, [verifiedTeams, stats.totalSurvivors]);

    // Cycle ticker messages
    useEffect(() => {
        const interval = setInterval(() => {
            setTickerIndex((prev) => (prev + 1) % tickerMessages.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [tickerMessages.length]);

    if (loading && verifiedTeams.length === 0) {
        return <div className="fixed inset-0 flex items-center justify-center text-yellow-500 font-teko text-4xl animate-pulse">LOADING TACTICAL OVERLAY...</div>;
    }

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden font-rajdhani bg-transparent">
            {/* Right Sidebar - Persistent Teams List */}
            <div className="absolute right-8 top-12 bottom-58 w-80 pointer-events-auto flex flex-col gap-2 ">
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 bg-zinc-950/90 border-2 border-yellow-500 p-4 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                >
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-teko text-white uppercase tracking-widest">Live <span className="text-yellow-500">Standings</span></h2>
                </motion.div>

                {/* Sidebar Header Navbar */}
                <div className="bg-zinc-950/90 border border-zinc-800/50 rounded-xl p-3 px-4 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[13px] font-bold text-zinc-400  uppercase tracking-widest w-6">#</span>
                        <span className="text-[11px] font-bold text-zinc-400  uppercase tracking-widest">Team Name</span>
                    </div>
                    <div className="flex items-center gap-5.5">
                        <span className="text-[11px] font-bold text-zinc-400 text-center  uppercase tracking-widest">Pts</span>
                        <span className="text-[11px] font-bold text-zinc-400 text-center  uppercase tracking-widest">Kills</span>
                        <span className="text-[11px] font-bold text-zinc-400 text-center  uppercase tracking-widest">Live</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1 pr-1" style={{ perspective: "1000px" }}>
                    <AnimatePresence>
                        {verifiedTeams.map((team, index) => (
                            <motion.div
                                key={team.teamName}
                                initial={{ opacity: 0, rotateX: -90, y: -20 }}
                                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                                transition={{
                                    delay: index * 0.05,
                                    duration: 0.5,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 15
                                }}
                                className="relative overflow-hidden rounded-xl bg-zinc-950/80 border border-zinc-800/50 backdrop-blur-md group origin-top"
                            >
                                {/* Rank Stripe */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1",
                                    index === 0 ? "bg-yellow-500 shadow-[0_0_10px_#facc15]" : "bg-zinc-700"
                                )} />

                                <div className="p-3 pl-4 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <span className="text-xl font-teko font-black text-white leading-none w-6">#{index + 1}</span>
                                        <h3 className="text-lg font-bold text-zinc-100 uppercase truncate tracking-tight max-w-[120px]">{team.teamName}</h3>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-teko font-bold text-yellow-500 w-6 text-center">{team.totalPoints}</div>

                                        <div className="flex items-center gap-1 w-8 justify-end">
                                            <span className="text-sm font-bold text-zinc-400 leading-none">{team.totalKills}</span>
                                        </div>

                                        {/* Player Status Dots (Alive) */}
                                        <div className="flex gap-1" title={`${team.alivePlayers ?? 4} Players Alive`}>
                                            {[1, 2, 3, 4].map((dot, dotIdx) => (
                                                <div
                                                    key={dot}
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                                        dotIdx < (team.alivePlayers ?? 4)
                                                            ? "bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.4)]"
                                                            : "bg-zinc-800"
                                                    )}
                                                />
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Overlay Bar */}
            <motion.div
                initial={{ y: 200 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="absolute bottom-0 left-0 right-0 h-[25vh] pointer-events-auto"
            >
                {/* Main Glass Morphic Bar */}
                <div className="relative h-full bg-zinc-950/95 border-t-2 border-yellow-500 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex items-center px-8">

                    {/* Left Side: Tournament Logo / Info */}
                    <div className="flex items-center gap-6 border-r border-zinc-800 pr-8 h-12">
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center -rotate-6 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                            >
                                <Zap className="w-6 h-6 text-black fill-black" />
                            </motion.div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-black" />
                        </div>
                        <div className="leading-none">
                            <h2 className="text-2xl font-teko font-black text-white uppercase tracking-tighter">GENESIS <span className="text-yellow-500">ESPORTS</span> S-1</h2>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-1">RISE OF COMPETITORS LIVE</p>
                        </div>
                    </div>

                    {/* Middle: Live Stats Ticker */}
                    <div className="flex-1 px-12 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tickerIndex}
                                initial={{ y: 40, opacity: 0, filter: "blur(5px)" }}
                                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                exit={{ y: -40, opacity: 0, filter: "blur(5px)" }}
                                className="flex items-center gap-4"
                            >
                                <div className="bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                                    LIVE INTEL
                                </div>
                                <span className="text-2xl font-teko font-bold text-zinc-100 uppercase tracking-wider">
                                    {tickerMessages[tickerIndex]}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Side: Map & Phase Info */}
                    <div className="flex items-center gap-8 border-l border-zinc-800 pl-8 h-12">
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Combat Zone</span>
                            <span className="text-xl font-teko font-bold text-white uppercase">ERANGEL</span>
                        </div>

                        <div className="relative w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center group overflow-hidden">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-yellow-500/20"
                            />
                            <Target className="w-6 h-6 text-yellow-500 relative z-10" />
                        </div>
                    </div>
                </div>

                {/* Bottom-most Detail Strip */}
                <div className="h-6 bg-yellow-500 flex items-center justify-between px-10">
                    <div className="flex gap-4">
                        <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">PHASE 04</span>
                        <span className="text-[9px] font-black text-black uppercase tracking-[0.2em] opacity-50">/</span>
                        <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">SQUADS ACTIVE: {stats.squadsInGame}</span>
                        <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">SURVIVORS: {stats.totalSurvivors}</span>
                    </div>
                    <div className="flex gap-8">
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-black" />
                            <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">ANTIGRAVITY SYNC ACTIVE</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-black" />
                            <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">LATENCY 14MS</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tactical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)', backgroundSize: '30px 30px' }}
            />
        </div>
    );
}

