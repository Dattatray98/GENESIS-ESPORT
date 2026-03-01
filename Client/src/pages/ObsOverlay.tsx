import React, { useEffect, useMemo, useRef } from 'react';
import { useLeaderboard } from '@/context/LeaderboardContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Zap } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAxios } from '@/hooks/useAxios';

export default function ObsOverlay() {
    const { seasonId } = useParams<{ seasonId: string }>();
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('matchId');
    const { teams, loading, refreshTeams, setSeasonId } = useLeaderboard();
    const { request: fetchMatch } = useAxios();
    const [matchData, setMatchData] = React.useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Notification State
    const [activeNotification, setActiveNotification] = React.useState<{ message: string; rank?: number; submessage?: string } | null>(null);
    const [isBarVisible, setIsBarVisible] = React.useState(false);
    const notificationQueue = useRef<{ message: string; rank?: number }[]>([]);
    const isProcessingQueue = useRef(false);
    const prevTeamsRef = useRef<any[]>([]);

    // Sync season ID with context
    useEffect(() => {
        if (seasonId) {
            setSeasonId(seasonId);
        }
    }, [seasonId, setSeasonId]);



    // Refresh everything periodically
    useEffect(() => {
        const interval = setInterval(async () => {
            refreshTeams();
            if (matchId) {
                try {
                    const data = await fetchMatch({
                        url: `matches/${matchId}`,
                        method: 'GET'
                    });
                    if (data) setMatchData(data);
                } catch (error) {
                    console.error("Match refresh failed", error);
                }
            }
        }, 3000); // 3s refresh for real-time live feel
        return () => clearInterval(interval);
    }, [refreshTeams, matchId, fetchMatch]);

    // Combined Standings Logic
    const displayTeams = useMemo(() => {
        // CASE 1: Match Specific Mode
        if (matchId && matchData && matchData.results) {
            return matchData.results.map((res: any) => {
                const teamId = res.teamId?._id || res.teamId;
                const baseTeam = teams.find(t => String(t._id) === String(teamId));

                return {
                    ...baseTeam,
                    teamName: res.teamId?.teamName || baseTeam?.teamName || "UNIT UNKNOWN",
                    totalKills: Number(res.kills || 0),
                    placementPoints: Number(res.placementPoints || 0),
                    totalPoints: Number(res.totalPoints || 0),
                    rank: res.rank || 0,
                    alivePlayers: Number(res.alivePlayers ?? baseTeam?.alivePlayers ?? 4),
                    isVerified: true
                };
            }).sort((a: any, b: any) => {
                // Initial sort by points, if points are 0 use alphabetical/base order
                if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                return (a.teamName || "").localeCompare(b.teamName || "");
            });
        }

        // CASE 2: Global Season Mode (Fallback)
        return teams.filter(t => {
            const matchesSeason = !seasonId ||
                (typeof t.seasonId === 'string' ? t.seasonId === seasonId : t.seasonId?._id === seasonId);
            return t.isVerified && matchesSeason;
        });
    }, [teams, seasonId, matchId, matchData]);

    const stats = useMemo(() => {
        const squadsInGame = displayTeams.filter((t: any) => (t.alivePlayers ?? 4) > 0).length;
        const totalSurvivors = displayTeams.reduce((acc: number, t: any) => acc + (t.alivePlayers ?? 0), 0);
        return { squadsInGame, totalSurvivors };
    }, [displayTeams]);



    // Auto-scroll standings
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || displayTeams.length === 0) return;

        let scrollInterval: any;
        let pauseTimeout: any;

        const startScrolling = () => {
            if (!scrollContainer) return;

            // Only scroll if content exceeds container height
            if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) return;

            scrollInterval = setInterval(() => {
                if (scrollContainer) {
                    scrollContainer.scrollTop += 0.5;

                    // Check if reached bottom (with small buffer)
                    if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 1) {
                        clearInterval(scrollInterval);
                        pauseTimeout = setTimeout(() => {
                            // Smooth scroll back to top
                            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                            // Wait at top before restarting
                            pauseTimeout = setTimeout(startScrolling, 4000);
                        }, 3000); // Wait at bottom
                    }
                }
            }, 30);
        };

        const initialTimeout = setTimeout(startScrolling, 3000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(scrollInterval);
            clearTimeout(pauseTimeout);
        };
    }, [displayTeams.length]);

    // Notification Logic
    const processQueue = React.useCallback(function processNext() {
        if (isProcessingQueue.current || notificationQueue.current.length === 0) return;

        isProcessingQueue.current = true;
        const msgObj = notificationQueue.current.shift();
        setActiveNotification(msgObj || null);
        setIsBarVisible(true);

        setTimeout(() => {
            setIsBarVisible(false);
            setTimeout(() => {
                setActiveNotification(null);
                isProcessingQueue.current = false;
                processNext();
            }, 1000); // exit anim wait
        }, 5000); // visible duration
    }, []);

    const addNotification = React.useCallback((message: string, rank?: number) => {
        notificationQueue.current.push({ message, rank });
        processQueue();
    }, [processQueue]);

    // Change Detection
    useEffect(() => {
        if (displayTeams.length === 0) return;

        if (prevTeamsRef.current.length > 0) {
            displayTeams.forEach((team: any, index: number) => {
                const prevTeam = prevTeamsRef.current.find((t: any) => String(t._id || t.teamName) === String(team._id || team.teamName));
                const currentRank = index + 1;

                if (prevTeam) {
                    // 1. Kills Update
                    if (team.totalKills > prevTeam.totalKills) {
                        const diff = team.totalKills - prevTeam.totalKills;
                        addNotification(`${team.teamName.toUpperCase()} SECURED ${diff} ELIMINATION${diff > 1 ? 'S' : ''}!`, currentRank);
                    }
                    // 2. Points Update (Placement change or similar without kill change)
                    if (team.totalPoints > prevTeam.totalPoints && team.totalKills === prevTeam.totalKills) {
                        addNotification(`${team.teamName.toUpperCase()} EARNED PLACEMENT POINTS!`, currentRank);
                    }
                    // 3. Survival Status Changes
                    const prevAlive = prevTeam.alivePlayers ?? 4;
                    const currAlive = team.alivePlayers ?? 4;

                    if (prevAlive > 0 && currAlive === 0) {
                        // Team Wipe
                        addNotification(`${team.teamName.toUpperCase()} HAS BEEN WIPED OUT!`, currentRank);
                    } else if (currAlive < prevAlive && currAlive > 0) {
                        // Player Lost
                        const diff = prevAlive - currAlive;
                        addNotification(`${team.teamName.toUpperCase()} LOST ${diff} PLAYER${diff > 1 ? 'S' : ''}!`, currentRank);
                    } else if (currAlive > prevAlive) {
                        // Player Recalled/Revived
                        const diff = currAlive - prevAlive;
                        addNotification(`${team.teamName.toUpperCase()} REINFORCED: ${diff} PLAYER${diff > 1 ? 'S' : ''} BACK!`, currentRank);
                    }
                }
            });
        }

        prevTeamsRef.current = displayTeams;
    }, [displayTeams, addNotification]);

    if (loading && displayTeams.length === 0) {
        return <div className="fixed inset-0 flex items-center justify-center text-yellow-500 font-teko text-4xl animate-pulse">LOADING TACTICAL OVERLAY...</div>;
    }

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden font-rajdhani bg-transparent">
            {/* Right Sidebar - Persistent Teams List */}
            <div className="absolute right-8 top-12 bottom-[28vh] w-80 pointer-events-auto flex flex-col gap-2 ">
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 bg-zinc-950/90 border-2 border-yellow-500 p-4 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                >
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-teko text-white uppercase tracking-widest">{matchId ? 'Match' : 'Live'} <span className="text-yellow-500">Standings</span></h2>
                </motion.div>

                {/* Sidebar Header Navbar */}
                <div className="bg-zinc-950/90 border border-red-800 rounded-xl p-3 px-4 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[13px] font-bold text-zinc-400  uppercase tracking-widest w-6">#</span>
                        <span className="text-[11px] font-bold text-zinc-400  uppercase tracking-widest">Team Name</span>
                    </div>
                    <div className="flex items-center gap-5.5">
                        <span className="text-[11px] font-bold text-zinc-400 text-center  uppercase tracking-widest">Pts</span>
                        <span className="text-[11px] font-bold text-zinc-400 text-center  uppercase tracking-widest">Kills</span>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-scroll max-h-[60vh] p-1  custom-scrollbar flex flex-col gap-1 pr-1"
                    style={{ perspective: "1000px" }}
                >
                    <AnimatePresence>
                        {displayTeams.map((team: any, index: number) => (
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
                                className="relative rounded-l-sm rounded-r-xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-md group origin-top"
                            >
                                {/* Rank Stripe */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 rounded-l-xl w-1",
                                    index === 0 ? "bg-yellow-500 shadow-[0_0_10px_#facc15]" : "bg-zinc-700"
                                )} />

                                <div className="p-3 pl-4 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <span className="text-xl font-teko font-black text-white leading-none w-6">#{index + 1}</span>
                                        <h3 className="text-lg font-bold text-zinc-100 uppercase truncate tracking-tight max-w-[120px]">{team.teamName}</h3>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-teko font-bold text-yellow-500 w-6 text-center">{team.totalPoints}</div>

                                        <div className="flex items-center gap-1 w-8 justify-end pr-3">
                                            <span className="text-sm font-bold text-zinc-400 leading-none">{team.totalKills}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Notification Bar */}
            <AnimatePresence>
                {false && isBarVisible && activeNotification && (
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-auto overflow-hidden"
                    >
                        {/* Tactical Background Layer */}
                        <div className="absolute inset-0 bg-zinc-950/95 border-t-4 border-yellow-500 shadow-[0_-15px_50px_rgba(0,0,0,0.9)]">
                            {/* Scanning Animation */}
                            <motion.div
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute top-0 bottom-0 w-1/3 bg-linear-to-r from-transparent via-yellow-500/10 to-transparent skew-x-12"
                            />

                            {/* Grid Detail */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#facc15_1px,transparent_1px)] bg-size-[20px_20px]" />
                        </div>

                        <div className="relative h-full flex items-center px-12 gap-12">
                            {/* Left Badge */}
                            <div className="flex flex-col items-center">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center rotate-45 shadow-[0_0_30px_rgba(234,179,8,0.5)] border-4 border-white/20"
                                >
                                    <Zap className="w-8 h-8 text-black -rotate-45 fill-black" />
                                </motion.div>
                                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] mt-4">LIVE INTEL</span>
                            </div>

                            {/* Message Center */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-4">
                                    <div className="h-[2px] w-12 bg-yellow-500" />
                                    <span className="text-xs font-black text-yellow-500 uppercase tracking-[0.5em]">OPERATIONAL UPDATE</span>
                                    {activeNotification?.rank && (
                                        <div className="bg-yellow-500 text-black px-2 py-0.5 rounded-sm font-black text-[10px] tracking-tighter">
                                            RANK #{activeNotification?.rank}
                                        </div>
                                    )}
                                    <div className="h-[2px] flex-1 bg-yellow-500/20" />
                                </div>
                                <motion.h2
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="text-5xl font-teko font-black text-white uppercase tracking-tighter italic"
                                >
                                    {activeNotification?.message}
                                </motion.h2>
                            </div>

                            {/* Right Status */}
                            <div className="flex items-center gap-6 border-l border-zinc-800 pl-12">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SQUADS ALIVE</p>
                                    <p className="text-3xl font-teko font-black text-white">{stats.squadsInGame}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full border-2 border-yellow-500 flex items-center justify-center relative shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                    <Target className="w-6 h-6 text-yellow-500" />
                                    <motion.div
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full border border-yellow-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Detail Strip */}
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-yellow-500">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="h-full bg-white/50"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tactical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)', backgroundSize: '30px 30px' }}
            />
        </div>
    );
}

