import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import { type Team } from "@/constants/leaderboardData";
import { Trophy, Crosshair, Users, Target, RefreshCw, LayoutGrid, List, ChevronDown, Calendar, ShieldCheck, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LEADERBOARD_DATA } from "@/constants/leaderboardData";
import apiClient from "@/api/apiClient";

// Table Header Component
const TableHeader = () => (
    <div className="grid grid-cols-[50px_1fr_60px_70px_80px_60px] md:grid-cols-[60px_1fr_60px_80px_90px_60px] gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl mb-5 text-zinc-400 font-teko text-base tracking-wider uppercase">
        <div className="text-center text-lg">#</div>
        <div className="text-lg">Team</div>
        <div className="text-center flex items-center justify-center"><Target className="w-5 h-5 text-yellow-500" /></div>
        <div className="text-center flex items-center justify-center"><Users className="w-5 h-5 text-yellow-500" /></div>
        <div className="text-center flex items-center justify-center"><Trophy className="w-5 h-5 text-yellow-500" /></div>
        <div className="text-center flex items-center justify-center"><Crosshair className="w-5 h-5 text-yellow-500" /></div>
    </div>
);

// Team Row Component
const TeamRow = ({ team, rankToDisplay, isTop3 }: { team: Team, rankToDisplay: number, isTop3: boolean }) => (
    <motion.div
        layout
        variants={{
            hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
        }}
        className={cn(
            "grid grid-cols-[50px_1fr_60px_70px_80px_60px] md:grid-cols-[60px_1fr_60px_80px_90px_60px] items-center gap-2 py-2 px-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl group transition-all duration-300 hover:border-yellow-500/50 hover:bg-zinc-800/40 backdrop-blur-sm",
            isTop3 && team.totalPoints > 0 ? "border-yellow-500/20 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.05)]" : ""
        )}
    >
        <div className="flex justify-center">
            <span className={cn(
                "flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full font-teko text-3xl transition-transform group-hover:scale-110",
                rankToDisplay === 1 ? "bg-yellow-500 text-black font-bold" :
                    rankToDisplay === 2 ? "bg-zinc-400 text-black font-bold" :
                        rankToDisplay === 3 ? "bg-orange-700 text-white font-bold" :
                            "text-zinc-500 bg-zinc-800/50"
            )}>
                {rankToDisplay}
            </span>
        </div>
        <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[20px] font-teko text-zinc-600 group-hover:border-yellow-500/50 group-hover:text-yellow-500 transition-all shrink-0">
                {team.teamName.substring(0, 2).toUpperCase()}
            </div>
            <span className="font-bold text-lg md:text-xl text-white group-hover:text-yellow-400 transition-colors uppercase tracking-tight truncate">
                {team.teamName}
            </span>
        </div>
        <div className="text-center font-rajdhani text-2xl font-bold text-zinc-400">{team.totalKills}</div>
        <div className="text-center font-rajdhani text-2xl font-bold text-zinc-400">{team.placementPoints}</div>
        <div className="text-center">
            <span className="font-teko text-xl md:text-2xl font-bold text-yellow-500 group-hover:scale-110 block transition-transform">
                {team.totalPoints}
            </span>
        </div>
        <div className="text-center font-rajdhani text-2xl font-bold text-zinc-400">{team.wins}</div>
    </motion.div>
);

export default function Leaderboard() {
    const { user } = useAuth();
    const { teams, loading, refreshTeams, currentSeasonId, setSeasonId } = useLeaderboard();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('matchId');
    const seasonIdFromUrl = searchParams.get('seasonId');
    const [seasons, setSeasons] = useState<any[]>([]);
    const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

    const [isSplitView, setIsSplitView] = useState(true);
    const [currentMatch, setCurrentMatch] = useState<any>(null);
    const [matchLoading, setMatchLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    const isPublicMatchView = !!(matchId && (!user || user.role !== 'admin'));

    // Countdown Logic
    useEffect(() => {
        if (!currentMatch || currentMatch.status !== 'upcoming' || !currentMatch.dateTime) {
            setTimeLeft(null);
            return;
        }

        const target = new Date(currentMatch.dateTime).getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft(null);
                clearInterval(timer);
                refreshTeams(); // Trigger refresh to get new status
                return;
            }

            setTimeLeft({
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentMatch?.status, currentMatch?.dateTime, refreshTeams]);

    // Auto-set split view for public match
    useEffect(() => {
        if (isPublicMatchView) setIsSplitView(true);
    }, [isPublicMatchView]);

    // Fetch match data if matchId is present
    useEffect(() => {
        const fetchMatchData = async () => {
            if (!matchId) {
                setCurrentMatch(null);
                return;
            }
            setMatchLoading(true);
            try {
                const response = await apiClient.get(`matches/${matchId}`);
                setCurrentMatch(response.data);
                if (response.data.seasonId?._id && response.data.seasonId._id !== currentSeasonId) {
                    setSeasonId(response.data.seasonId._id);
                }
            } catch (error) {
                console.error("Error fetching match data:", error);
            } finally {
                setMatchLoading(false);
            }
        };

        fetchMatchData();

        // // Polling for match status if upcoming (every 10s)
        // let interval: any;
        // if (matchId) {
        //     interval = setInterval(() => {
        //         fetchMatchData();
        //     }, 10000);
        // }

        // return () => {
        //     if (interval) clearInterval(interval);
        // };
    }, [matchId, setSeasonId, currentSeasonId]);

    // Derived filtered seasons: All active + Last one completed
    const filteredSeasons = useMemo(() => {
        const active = seasons
            .filter(s => s.status === 'active')
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        const completed = seasons
            .filter(s => s.status === 'Completed')
            .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

        return [...active, ...completed.slice(0, 1)];
    }, [seasons]);

    const selectedSeason = useMemo(() =>
        seasons.find(s => s._id === currentSeasonId)
        , [seasons, currentSeasonId]);

    // Fetch all available seasons
    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await apiClient.get(`seasons`);
                setSeasons(response.data);

                // Priority 1: URL Param (if exists and different)
                if (seasonIdFromUrl && seasonIdFromUrl !== currentSeasonId) {
                    setSeasonId(seasonIdFromUrl);
                }
                // Priority 2: Fallback to most recent active if NOTHING selected
                else if (!currentSeasonId && !seasonIdFromUrl && response.data.length > 0) {
                    const activeSeason = response.data.find((s: any) => s.status === 'active') || response.data[0];
                    setSeasonId(activeSeason._id);
                }
            } catch (error) {
                console.error("Error fetching seasons:", error);
            }
        };
        fetchSeasons();
    }, [currentSeasonId, setSeasonId, seasonIdFromUrl]);

    // Auto-refresh standings every 60 seconds (Disabled)
    useEffect(() => {
        // const interval = setInterval(() => {
        //     if (!loading) refreshTeams();
        // }, 60000);
        // return () => clearInterval(interval);
    }, [refreshTeams, loading]);

    const navLinks = [
        { name: "Teams", href: "/admin/teams", type: "link", protected: true },
    ];

    const filteredLinks = navLinks.filter(link => !link.protected || (user && user.role === 'admin'));

    const handleNavigation = (href: string, type: string) => {
        if (type === "link") {
            navigate(href);
            window.scrollTo(0, 0);
        } else {
            if (location.pathname === "/") {
                const elementId = href.replace("/#", "");
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            } else {
                navigate(href);
            }
        }
    };

    const verifiedTeams = useMemo(() =>
        teams.filter((team: Team) => team.isVerified)
        , [teams]);

    const displayedTeams = useMemo(() => {
        // CASE 1: Specific Match View
        if (currentMatch) {
            const matchTeamIds = (currentMatch.results || []).map((r: any) => r.teamId?._id || r.teamId);

            // If match has results (live or completed), show them
            if (currentMatch.results?.length > 0) {
                return currentMatch.results.map((res: any) => ({
                    _id: String(res.teamId?._id || res.teamId),
                    teamName: res.teamId?.teamName || "Deleted Team",
                    totalKills: res.kills,
                    placementPoints: res.placementPoints,
                    totalPoints: res.totalPoints || (Number(res.kills) + Number(res.placementPoints)),
                    wins: res.rank === 1 ? 1 : 0,
                    isVerified: true
                })).sort((a: any, b: any) => b.totalPoints - a.totalPoints);
            }

            // Fallback: If no results saved yet, show teams with 0 points
            return verifiedTeams
                .filter((t: any) => matchTeamIds.includes(t._id || t.teamName))
                .map((team: Team) => ({
                    ...team,
                    totalKills: 0,
                    placementPoints: 0,
                    totalPoints: 0,
                    wins: 0
                }));
        }

        // CASE 2: Global Season Leaderboard
        let dataToUse = verifiedTeams;

        // Fallback for demo/empty state
        if (dataToUse.length === 0 && !currentSeasonId) {
            dataToUse = LEADERBOARD_DATA;
        }

        return dataToUse;
    }, [verifiedTeams, currentSeasonId, currentMatch]);

    const teamColumns = useMemo(() => {
        if (!isSplitView) return [displayedTeams];
        const midPoint = Math.ceil(displayedTeams.length / 2);
        return [
            displayedTeams.slice(0, midPoint),
            displayedTeams.slice(midPoint)
        ];
    }, [displayedTeams, isSplitView]);


    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black">
            <main className={`pt-5 pb-5 section-container relative transition-all duration-700 mx-auto ${isSplitView ? "max-w-[1600px]" : "max-w-[1300px]"}`}>

                <ScrollReveal>
                    <div className="text-center mb-5 relative">
                        {!isPublicMatchView && (
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="relative flex h-3 w-3">
                                    <span className={cn(
                                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                        currentMatch ? (currentMatch.status === 'live' ? "bg-red-400" : "bg-green-400") : "bg-red-400"
                                    )}></span>
                                    <span className={cn(
                                        "relative inline-flex rounded-full h-3 w-3",
                                        currentMatch ? (currentMatch.status === 'live' ? "bg-red-500" : "bg-green-500") : "bg-red-500"
                                    )}></span>
                                </span>
                                <span className={cn(
                                    "font-bold text-xs tracking-[0.3em] uppercase",
                                    currentMatch ? (currentMatch.status === 'live' ? "text-red-500" : "text-green-500") : "text-red-500"
                                )}>
                                    {currentMatch ? `${currentMatch.status} Stats` : "Live Season Standings"}
                                </span>
                            </div>
                        )}
                        <h1 className="text-xl md:text-6xl font-teko font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 tracking-tighter drop-shadow-2xl uppercase mb-2">
                            {currentMatch ? (
                                <>Match #{currentMatch.matchNumber} <span className="text-yellow-500">{currentMatch.mapName}</span></>
                            ) : (
                                <>Tournament <span className="text-yellow-500">Standings</span></>
                            )}
                        </h1>

                        <h2 className="text-xl md:text-3xl font-teko font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 tracking-tighter drop-shadow-2xl uppercase mb-2">In-Game Leaderboard</h2>


                        {!isPublicMatchView && currentMatch?.status === 'upcoming' && (
                            <p className="text-zinc-500 font-teko text-xl uppercase tracking-widest mt-2">Player Roster (Match Pending)</p>
                        )}
                    </div>
                </ScrollReveal>

                {/* Unified Control Bar */}
                {!isPublicMatchView && (
                    <div className="relative z-50 mb-6">
                        <ScrollReveal delay={0.1}>
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-2 border-b border-zinc-800 rounded-sm backdrop-blur-sm shadow-2xl relative z-40">

                                {/* Left Side: Season Selection Dropdown & Group Filters */}
                                <div className="flex flex-1 flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-4 px-4 py-2 md:py-0">

                                    {/* Season Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border rounded-xl transition-all group relative z-50",
                                                isSeasonDropdownOpen ? "border-yellow-500 bg-zinc-800" : "border-zinc-800 hover:border-yellow-500/50"
                                            )}
                                        >
                                            <div className="flex flex-col items-start leading-none gap-1">
                                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-yellow-500 transition-colors">Current Operation</span>
                                                <span className="text-sm font-teko font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                    {selectedSeason?.title || "Initializing..."}
                                                    {selectedSeason?.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                                </span>
                                            </div>
                                            <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform duration-500", isSeasonDropdownOpen ? "rotate-180 text-yellow-500" : "")} />
                                        </button>

                                        <AnimatePresence>
                                            {isSeasonDropdownOpen && (
                                                <div className="absolute top-full left-0 z-50">
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[-1]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsSeasonDropdownOpen(false);
                                                        }}
                                                    />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                                        className="mt-3 w-72 md:w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10"
                                                    >
                                                        <div className="p-2 space-y-1">
                                                            <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800/50 mb-1 flex justify-between items-center">
                                                                <span>Available Operations</span>
                                                                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[8px]">{filteredSeasons.length}</span>
                                                            </div>
                                                            {filteredSeasons.map((season) => (
                                                                <button
                                                                    key={season._id}
                                                                    onClick={() => {
                                                                        setSeasonId(season._id);
                                                                        setIsSeasonDropdownOpen(false);
                                                                    }}
                                                                    className={cn(
                                                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group/item",
                                                                        currentSeasonId === season._id
                                                                            ? "bg-yellow-500 text-black shadow-lg"
                                                                            : "hover:bg-zinc-800 text-zinc-400"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-3 overflow-hidden text-left">
                                                                        <div className={cn(
                                                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                                                            currentSeasonId === season._id ? "bg-black/20" : "bg-zinc-950 border border-zinc-800"
                                                                        )}>
                                                                            {season.status === 'active' ? <Calendar className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                                                        </div>
                                                                        <div className="overflow-hidden">
                                                                            <div className={cn("text-sm font-bold uppercase tracking-tight truncate", currentSeasonId === season._id ? "text-black" : "text-white")}>
                                                                                {season.title}
                                                                            </div>
                                                                            <div className={cn("text-[9px] font-black uppercase tracking-widest flex items-center gap-1", currentSeasonId === season._id ? "text-black/60" : "text-zinc-500")}>
                                                                                {season.status === 'active' ? (
                                                                                    <>
                                                                                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                                                                        Live Standings
                                                                                    </>
                                                                                ) : 'Archived Results'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {currentSeasonId === season._id && <ShieldCheck className="w-4 h-4 shrink-0" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="bg-zinc-950/50 p-2 border-t border-zinc-800/50">
                                                            <p className="text-[8px] text-zinc-600 text-center uppercase font-black tracking-widest">End-to-End Encrypted Standings</p>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {user?.role === 'admin' && filteredLinks.length > 0 && (
                                        <div className="w-px h-8 bg-zinc-800 hidden md:block" />
                                    )}

                                    {/* Admin Links */}
                                    {user?.role === 'admin' && filteredLinks.map((link) => (
                                        <button
                                            key={link.name}
                                            onClick={() => handleNavigation(link.href, link.type)}
                                            className={cn(
                                                "text-[12px] font-black uppercase tracking-[0.2em] transition-colors relative group cursor-pointer bg-transparent border-none p-0 whitespace-nowrap",
                                                location.pathname === link.href ? "text-yellow-500" : "text-zinc-500 hover:text-yellow-500"
                                            )}
                                        >
                                            {link.name}
                                            <span className={cn(
                                                "absolute -bottom-1 left-0 h-0.5 bg-yellow-500 transition-all duration-300",
                                                location.pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                                            )} />
                                        </button>
                                    ))}
                                </div>

                                {/* Right Side: Actions & View Toggle */}
                                <div className="flex items-center justify-center md:justify-end gap-3 px-1 border-t md:border-t-0 md:border-l border-zinc-800/50 pt-3 md:pt-0 pl-0 md:pl-4">
                                    {/* Layout Toggle */}
                                    <button
                                        onClick={() => setIsSplitView(!isSplitView)}
                                        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-yellow-500 hover:border-yellow-500/50 transition-all cursor-pointer font-teko tracking-widest uppercase text-sm"
                                        title={isSplitView ? "Switch to List View" : "Switch to Split View"}
                                    >
                                        {isSplitView ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                                        <span className="hidden xl:inline">{isSplitView ? "Single Column" : "Split View"}</span>
                                    </button>

                                    <button
                                        onClick={() => refreshTeams()}
                                        disabled={loading}
                                        className={cn(
                                            "flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-yellow-500 hover:border-yellow-500/50 transition-all cursor-pointer group/refresh",
                                            loading && "opacity-50 cursor-not-allowed"
                                        )}
                                        title="Refresh Standings"
                                    >
                                        <RefreshCw className={cn("w-4 h-4 group-hover/refresh:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                )}

                <ScrollReveal delay={0.2}>
                    {(loading || matchLoading) ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full"
                            />
                            <p className="text-zinc-500 font-teko text-xl tracking-widest animate-pulse uppercase">
                                {matchLoading ? "Deploying Match Intel..." : "Updating Leaderboard..."}
                            </p>
                        </div>
                    ) : (isPublicMatchView && currentMatch?.status === 'upcoming' && timeLeft) ? (
                        /* Pre-Match Intel Screen for Public View */
                        <div className="flex flex-col items-center justify-center py-12 md:py-20 bg-zinc-900/10 border border-zinc-800/50 rounded-[40px] backdrop-blur-md relative overflow-hidden shadow-2xl">
                            {/* Tactical Background Elements */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_70%)]" />
                                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
                                <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative z-10 flex flex-col items-center text-center"
                            >
                                <div className="mb-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-4">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Operational Readiness Status: PRE-MATCH</span>
                                    </div>
                                    <h2 className="text-6xl md:text-8xl font-teko font-black text-white tracking-tighter uppercase leading-none italic">
                                        GENESIS <span className="text-yellow-500">ESPORT</span>
                                    </h2>
                                    <p className="text-zinc-500 font-teko text-xl md:text-2xl uppercase tracking-[0.4em] mt-2">The Beginning of a New Legend</p>
                                </div>

                                {/* Countdown Grill */}
                                <div className="grid grid-cols-4 gap-4 md:gap-8 mb-12">
                                    {[
                                        { label: 'Days', value: timeLeft.d },
                                        { label: 'Hours', value: timeLeft.h },
                                        { label: 'Mins', value: timeLeft.m },
                                        { label: 'Secs', value: timeLeft.s }
                                    ].map((unit) => (
                                        <div key={unit.label} className="flex flex-col items-center">
                                            <div className="w-16 h-20 md:w-24 md:h-28 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-4xl md:text-6xl font-teko font-black text-white z-10">
                                                    {String(unit.value).padStart(2, '0')}
                                                </span>
                                                <div className="absolute bottom-1 w-8 h-[2px] bg-yellow-500/30" />
                                            </div>
                                            <span className="mt-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest">{unit.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Match Intel Card */}
                                <div className="max-w-md w-full p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-sm">
                                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                                        <div className="text-left">
                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Current Sector</p>
                                            <p className="font-teko text-xl text-white uppercase">{currentMatch.mapName || "ERANGEL"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Deployment</p>
                                            <p className="font-teko text-xl text-yellow-500 uppercase">MATCH #{currentMatch.matchNumber}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-wider">
                                        System initialized for {selectedSeason?.title}. All teams confirmed for deployment. Standings will activate automatically on match commencement.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    ) : displayedTeams.length > 0 ? (
                        <div className={cn(
                            "grid gap-6",
                            isSplitView ? "lg:grid-cols-2" : "grid-cols-1"
                        )}>
                            {teamColumns.map((columnTeams, colIdx) => (
                                <div key={colIdx} className="flex flex-col">
                                    <TableHeader />
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            visible: {
                                                transition: { staggerChildren: 0.05 }
                                            }
                                        }}
                                        className={cn(
                                            "flex flex-col gap-3",
                                            !isSplitView && "max-h-[61vh] overflow-y-scroll hide-scrollbar"
                                        )}
                                    >
                                        {columnTeams.map((team: any, idx: number) => {
                                            const absoluteIdx = isSplitView && colIdx === 1
                                                ? Math.ceil(displayedTeams.length / 2) + idx
                                                : idx;
                                            return (
                                                <TeamRow
                                                    key={team.teamName}
                                                    team={team}
                                                    rankToDisplay={absoluteIdx + 1}
                                                    isTop3={absoluteIdx < 3}
                                                />
                                            );
                                        })}
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/20 border border-zinc-800 rounded-3xl">
                            <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4 opacity-20" />
                            <h2 className="text-2xl font-teko text-zinc-500 uppercase tracking-widest">No Standings Available Yet</h2>
                            <p className="text-zinc-600 text-sm uppercase tracking-wider mt-2">Rankings will appear once matches begin and teams are verified.</p>
                        </div>
                    )}
                </ScrollReveal>
            </main>
        </div>
    );
}
