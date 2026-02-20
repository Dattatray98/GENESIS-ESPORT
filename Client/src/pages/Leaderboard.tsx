import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import { type Team } from "@/constants/leaderboardData";
import { Trophy, Crosshair, Users, Target, Shield, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Footer from "@/components/layout/Footer";

export default function Leaderboard() {
    const { user } = useAuth();
    const { teams, loading, refreshTeams } = useLeaderboard();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    // Auto-refresh standings every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading) refreshTeams();
        }, 60000);
        return () => clearInterval(interval);
    }, [refreshTeams, loading]);

    const verifiedTeams = useMemo(() =>
        teams.filter((team: Team) => team.isVerified)
        , [teams]);

    const filteredTeams = useMemo(() =>
        verifiedTeams.filter((team: Team) =>
            team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        , [verifiedTeams, searchQuery]);

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black">
            <main className="pt-24 pb-16 section-container relative">

                <ScrollReveal>
                    <div className="text-center mb-16 relative">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-red-500 font-bold text-xs tracking-[0.3em] uppercase">Live Standings</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-teko font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 mb-4 tracking-tighter drop-shadow-2xl uppercase">
                            Tournament <span className="text-yellow-500">Standings</span>
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
                            Live rankings of the top teams battling for glory. Points are calculated based on kills and placement.
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-b border-zinc-800 pb-8">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full md:w-80 group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter by team name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-yellow-500/50 outline-none transition-all backdrop-blur-sm"
                                />
                            </div>
                            <button
                                onClick={() => refreshTeams()}
                                disabled={loading}
                                className={cn(
                                    "p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all",
                                    loading && "opacity-50 cursor-not-allowed"
                                )}
                                title="Refresh Standings"
                            >
                                <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                            </button>
                        </div>
                        {user?.role === 'admin' && (
                            <Button
                                variant="neonOutline"
                                size="lg"
                                className="flex items-center gap-2 w-full md:w-auto font-teko text-lg tracking-wider"
                                onClick={() => navigate("/admin/leaderboard/update")}
                            >
                                <Shield className="w-5 h-5" />
                                UPDATE STANDINGS
                            </Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full"
                            />
                            <p className="text-zinc-500 font-teko text-xl tracking-widest animate-pulse uppercase">Syncing Leaderboard...</p>
                        </div>
                    ) : filteredTeams.length > 0 ? (
                        <>
                            {/* Header Row (Desktop Only) */}
                            <div className="hidden md:grid grid-cols-[80px_1fr_100px_120px_120px_100px] gap-4 px-6 py-4 bg-zinc-900/80 border border-zinc-800 rounded-xl mb-4 text-zinc-400 font-teko text-xl tracking-wider uppercase">
                                <div className="text-center">Rank</div>
                                <div>Team Name</div>
                                <div className="text-center flex items-center justify-center gap-2"><Target className="w-4 h-4 text-yellow-500" /> Kills</div>
                                <div className="text-center flex items-center justify-center gap-2"><Users className="w-4 h-4 text-yellow-500" /> Pos Pts</div>
                                <div className="text-center flex items-center justify-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Total</div>
                                <div className="text-center flex items-center justify-center gap-2"><Crosshair className="w-4 h-4 text-yellow-500" /> Wins</div>
                            </div>

                            {/* Team Cards List with Wave and Sliding Animation */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05
                                        }
                                    }
                                }}
                                className="flex flex-col gap-2"
                            >
                                {filteredTeams.map((team: Team) => {
                                    const originalIndex = teams.findIndex((t: Team) => t.teamName === team.teamName);
                                    return (
                                        <motion.div
                                            key={team.teamName}
                                            layout
                                            variants={{
                                                hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
                                                visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                                            }}
                                            transition={{
                                                layout: { type: "spring", stiffness: 300, damping: 30 },
                                                opacity: { duration: 0.4 },
                                                y: { duration: 0.4 }
                                            }}
                                            className={cn(
                                                "grid grid-cols-[50px_1fr_70px] md:grid-cols-[80px_1fr_100px_120px_120px_100px] items-center gap-2 md:gap-4 p-3 md:p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl group transition-all duration-300 hover:border-yellow-500/50 hover:bg-zinc-800/40 backdrop-blur-sm",
                                                originalIndex < 3 && team.totalPoints > 0 ? "border-yellow-500/20 bg-yellow-500/5" : ""
                                            )}
                                        >
                                            {/* Rank */}
                                            <div className="flex justify-center">
                                                <span className={cn(
                                                    "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-teko text-xl md:text-2xl transition-transform group-hover:scale-110",
                                                    team.totalPoints > 0 ? (
                                                        originalIndex === 0 ? "bg-yellow-500 text-black font-bold shadow-[0_0_15px_rgba(234,179,8,0.4)]" :
                                                            originalIndex === 1 ? "bg-zinc-400 text-black font-bold" :
                                                                originalIndex === 2 ? "bg-orange-700 text-white font-bold" :
                                                                    "text-zinc-500 bg-zinc-800/50"
                                                    ) : "text-zinc-700 bg-zinc-900/50"
                                                )}>
                                                    {team.totalPoints > 0 ? originalIndex + 1 : "-"}
                                                </span>
                                            </div>

                                            {/* Team Name */}
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-teko text-zinc-600 group-hover:border-yellow-500/50 group-hover:text-yellow-500 transition-all shrink-0">
                                                    {team.teamName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col truncate">
                                                    <span className="font-bold text-sm md:text-lg text-white group-hover:text-yellow-400 transition-colors uppercase tracking-wide truncate">
                                                        {team.teamName}
                                                    </span>
                                                    {originalIndex === 0 && team.totalPoints > 0 && (
                                                        <span className="text-[10px] text-yellow-500 font-teko tracking-widest flex items-center gap-1 animate-pulse">
                                                            <Trophy className="w-2 h-2" /> REIGNING CHAMPIONS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Kills (Desktop) */}
                                            <div className="hidden md:block text-center font-rajdhani font-bold text-zinc-400">
                                                {team.totalKills}
                                            </div>

                                            {/* Position Pts (Desktop) */}
                                            <div className="hidden md:block text-center font-rajdhani font-bold text-zinc-400">
                                                {team.placementPoints}
                                            </div>

                                            {/* Total Points */}
                                            <div className="text-center">
                                                <span className="font-teko text-xl md:text-3xl font-bold text-yellow-500 group-hover:scale-110 block transition-transform">
                                                    {team.totalPoints}
                                                </span>
                                                <span className="text-[8px] md:hidden text-zinc-600 block uppercase font-bold tracking-widest">Points</span>
                                            </div>

                                            {/* Wins (Desktop/Tablet) */}
                                            <div className="hidden sm:block text-center font-rajdhani font-bold text-zinc-400">
                                                {team.wins}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/20 border border-zinc-800 rounded-3xl">
                            <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4 opacity-20" />
                            <h2 className="text-2xl font-teko text-zinc-500 uppercase tracking-widest">No Standings Available Yet</h2>
                            <p className="text-zinc-600 text-sm uppercase tracking-wider mt-2">Rankings will appear once matches begin and teams are verified.</p>
                        </div>
                    )}
                </ScrollReveal>

            </main>

            <Footer />
        </div>
    );
}