import { useLeaderboard } from "@/context/LeaderboardContext";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
    Users,
    ShieldCheck,
    ShieldAlert,
    LayoutDashboard,
    PlusCircle,
    Edit,
    Eye,
    Calendar,
    X,
    AlertTriangle,
    Check,
    Zap,
    ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Admin() {
    const { seasonId } = useParams<{ seasonId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { setSeasonId, teams } = useLeaderboard();
    const [season, setSeason] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showEndSeasonModal, setShowEndSeasonModal] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isEnding, setIsEnding] = useState(false);

    // Reset confirmation when modal closes
    useEffect(() => {
        if (!showEndSeasonModal) {
            setIsConfirmed(false);
        }
    }, [showEndSeasonModal]);

    useEffect(() => {
        const loadSeasonData = async () => {
            if (!seasonId) return;
            setLoading(true);
            try {
                // Fetch season info
                const seasonRes = await axios.get(`${import.meta.env.VITE_API_URL}/seasons`);
                const currentSeason = seasonRes.data.find((s: any) => s._id === seasonId);

                if (!currentSeason) {
                    navigate('/admin');
                    return;
                }

                // If season is not active, don't show this page (as per user request)
                if (currentSeason.status !== 'active') {
                    alert("This season is not active and cannot be managed.");
                    navigate('/admin');
                    return;
                }

                setSeason(currentSeason);
                setSeasonId(seasonId);

                // Fetch teams for this season (already handled by context but we can keep it for explicit check or just rely on context)
            } catch (error) {
                console.error("Failed to load season data", error);
            } finally {
                setLoading(false);
            }
        };
        loadSeasonData();
    }, [seasonId, setSeasonId, navigate]);

    const handleEndSeason = async () => {
        if (!isConfirmed || !seasonId) return;

        setIsEnding(true);
        try {
            const url = `${import.meta.env.VITE_API_URL}/seasons/${seasonId}`;
            console.log("Terminating season at:", url);

            await axios.put(url,
                {
                    status: 'Completed',
                    endDate: new Date().toISOString()
                },
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`
                    }
                }
            );

            // Redirect back to main admin dashboard
            navigate('/admin');
        } catch (error: any) {
            console.error("Failed to end season:", error);
            const detail = error.response?.data?.message || error.message || "Unknown communication failure";
            alert(`Strategic Error: Failed to terminate operation. Details: ${detail}`);
        } finally {
            setIsEnding(false);
        }
    };

    const filteredTeams = teams.filter(t => {
        const matchesSeason = !seasonId ||
            (typeof t.seasonId === 'string' ? t.seasonId === seasonId : t.seasonId?._id === seasonId);
        return matchesSeason;
    });

    const stats = [
        {
            label: "Total Squads",
            value: filteredTeams.length,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            sub: "Registered teams"
        },
        {
            label: "Verified",
            value: filteredTeams.filter(t => t.isVerified).length,
            icon: ShieldCheck,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            sub: "Active in leaderboard"
        },
        {
            label: "Pending",
            value: filteredTeams.filter(t => !t.isVerified).length,
            icon: ShieldAlert,
            color: "text-red-500",
            bg: "bg-red-500/10",
            sub: "Awaiting review"
        }
    ];

    const quickActions = [
        {
            title: "Manage Teams",
            desc: "View roster details, verify documents, and edit teams.",
            icon: Edit,
            href: `/admin/teams?seasonId=${seasonId}`,
            color: "from-blue-500/20 to-transparent"
        },
        {
            title: "Manual Entry",
            desc: "Register a new team directly from the panel.",
            icon: PlusCircle,
            href: `/admin/entry?seasonId=${seasonId}`,
            color: "from-green-500/20 to-transparent"
        },
        {
            title: "Season Overview",
            desc: "View historical data and statistics for this season.",
            icon: Calendar,
            href: `/admin/seasons`,
            color: "from-orange-500/20 to-transparent"
        },
        {
            title: "Global Leaderboard",
            desc: "Comprehensive standings for all matches this season.",
            icon: Eye,
            href: `/leaderboard?seasonId=${seasonId}`,
            color: "from-purple-500/20 to-transparent"
        },
        {
            title: "OBS Overlay",
            desc: "Open the tactical browser source for OBS/streaming.",
            icon: Zap,
            href: `/overlay/${seasonId}`,
            color: "from-yellow-400/20 to-transparent"
        },
        {
            title: "Manage Matches",
            desc: "View, schedule, and filter matches for this season.",
            icon: Calendar,
            href: `/matches?seasonId=${seasonId}`,
            color: "from-red-500/20 to-transparent"
        }
    ];

    const recentTeams = teams
        .filter(t => {
            const matchesSeason = !seasonId ||
                (typeof t.seasonId === 'string' ? t.seasonId === seasonId : t.seasonId?._id === seasonId);
            return matchesSeason;
        })
        .reverse()
        .slice(0, 5);

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="section-container max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <ScrollReveal>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3 text-zinc-500 mb-2">
                                    <LayoutDashboard className="w-5 h-5 text-yellow-500" />
                                    <span className="text-xs font-black uppercase tracking-[0.3em]">Season Command Center</span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-teko font-black text-white uppercase tracking-tighter">
                                    {season?.title || "Season"} <span className="text-yellow-500 font-black">Management</span>
                                </h1>
                                <p className="text-zinc-400 text-lg uppercase tracking-wider">
                                    {season?.subtitle || "Tactical Operations"} | Commander <span className="text-white font-bold">{user?.name || "Admin"}</span>
                                </p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.1}>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowEndSeasonModal(true)}
                                    className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-bold uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                >
                                    End Season
                                </button>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* End Season Modal */}
                    <AnimatePresence>
                        {showEndSeasonModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => !isEnding && setShowEndSeasonModal(false)}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-4xl p-8 shadow-2xl overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-red-500 to-transparent" />

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                                            <AlertTriangle className="w-6 h-6 text-red-500" />
                                        </div>
                                        {!isEnding && (
                                            <button
                                                onClick={() => setShowEndSeasonModal(false)}
                                                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <h3 className="text-3xl font-teko font-black text-white uppercase tracking-wider leading-none">
                                            Terminate <span className="text-red-500">Operation</span>
                                        </h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed font-rajdhani">
                                            You are about to end <span className="text-white font-bold">{season?.title}</span>. This action will archive all records and transition the status to <span className="text-green-500 font-bold italic">Completed</span>. This cannot be undone.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <label className="flex items-start gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl cursor-pointer group">
                                            <div className="relative flex items-center pt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isConfirmed}
                                                    onChange={(e) => setIsConfirmed(e.target.checked)}
                                                    className="peer sr-only"
                                                />
                                                <div className="w-5 h-5 border-2 border-zinc-700 rounded-md peer-checked:bg-red-500 peer-checked:border-red-500 transition-all flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" />
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase leading-tight">
                                                I understand that ending this season is irreversible and all team standings will be finalized.
                                            </span>
                                        </label>

                                        <div className="flex gap-4">
                                            <button
                                                disabled={!isConfirmed || isEnding}
                                                onClick={handleEndSeason}
                                                className={cn(
                                                    "flex-1 h-14 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                                                    isConfirmed
                                                        ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-600"
                                                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                                )}
                                            >
                                                {isEnding ? (
                                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    "END SEASON NOW"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {stats.map((stat, index) => (
                            <ScrollReveal key={stat.label} delay={index * 0.1}>
                                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5 transition-transform group-hover:scale-110", stat.color)}>
                                        <stat.icon size={128} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
                                            <stat.icon className={cn("w-6 h-6", stat.color)} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest">{stat.label}</h3>
                                            <div className="text-4xl font-teko font-bold text-white tracking-wider">
                                                {loading ? "..." : stat.value}
                                            </div>
                                            <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{stat.sub}</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Quick Actions */}
                        <div className="lg:col-span-2 space-y-8">
                            <ScrollReveal>
                                <h3 className="text-2xl font-teko text-white uppercase tracking-wider mb-6 border-l-4 border-yellow-500 pl-4">Tactical Operations</h3>
                            </ScrollReveal>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {quickActions.map((action, index) => (
                                    <ScrollReveal key={action.title} delay={index * 0.1}>
                                        <button
                                            onClick={() => navigate(action.href)}
                                            className="w-full text-left p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-yellow-500/50 transition-all duration-300 group relative overflow-hidden"
                                        >
                                            <div className={cn("absolute inset-y-0 left-0 w-1 bg-linear-to-b", action.color)} />
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center group-hover:border-yellow-500/50 group-hover:text-yellow-500 transition-all">
                                                    <action.icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-teko font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                                                        {action.title}
                                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </h4>
                                                    <p className="text-sm text-zinc-500 leading-relaxed font-rajdhani">
                                                        {action.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity / Feed */}
                        <div className="space-y-8">
                            <ScrollReveal>
                                <h3 className="text-2xl font-teko text-white uppercase tracking-wider mb-6 border-l-4 border-yellow-500 pl-4">Intel Feed</h3>
                            </ScrollReveal>

                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative">
                                <ScrollReveal delay={0.2}>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Recent Registrations</span>
                                            <button
                                                onClick={() => navigate('/admin/teams')}
                                                className="text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:text-yellow-400 underline underline-offset-4"
                                            >
                                                View All
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {recentTeams.map((team, idx) => (
                                                <motion.div
                                                    key={team.teamName}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex items-center gap-4 group cursor-pointer"
                                                    onClick={() => navigate('/admin/teams')}
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center font-teko text-lg font-bold text-zinc-500 group-hover:border-yellow-500/30 group-hover:text-yellow-500 transition-all">
                                                        {team.teamName.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="text-sm font-bold text-white uppercase tracking-tight truncate group-hover:text-yellow-500 transition-colors">
                                                            {team.teamName}
                                                        </h5>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={cn(
                                                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                                                team.isVerified ? "bg-green-500" : "bg-red-500"
                                                            )} />
                                                            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                                                                {team.isVerified ? "Active Squad" : "Awaiting Verification"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {recentTeams.length === 0 && (
                                                <div className="text-center py-8">
                                                    <p className="text-zinc-600 text-xs uppercase tracking-widest">No recent data</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
