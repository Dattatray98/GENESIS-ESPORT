import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { User, Shield, Info, ExternalLink, Mail, Phone, Search, X, Trophy, Users, CheckCircle, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Team } from "@/constants/leaderboardData";

export default function TeamDetails() {
    const { teams, verifyTeam } = useLeaderboard();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    // Prevent background scrolling and handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedTeam(null);
            }
        };

        if (selectedTeam) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedTeam]);

    const filteredTeams = teams.filter(team =>
        team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="section-container max-w-7xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <h1 className="text-5xl md:text-7xl font-teko font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 mb-4 tracking-tighter drop-shadow-2xl uppercase">
                                Registered <span className="text-yellow-500">Teams</span>
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                                Full breakdown of the qualified squads and their rosters for the 2026 Championship.
                            </p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <div className="max-w-md mx-auto mb-12 relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search squad name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-yellow-500/50 outline-none transition-all backdrop-blur-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-white"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTeams.map((team, index) => (
                            <ScrollReveal key={team.teamName} delay={index * 0.05}>
                                <div className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
                                    {/* Card Header with Design */}
                                    <div className="relative h-24 bg-zinc-800 overflow-hidden">
                                        <div className="absolute inset-0 bg-linear-to-br from-yellow-500/20 to-transparent" />
                                        <div className="absolute -right-4 -top-4 opacity-10">
                                            <Shield className="w-24 h-24 text-white" />
                                        </div>
                                        <div className="absolute bottom-4 left-6 flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-yellow-500/30 flex items-center justify-center font-teko text-2xl font-bold text-yellow-500 group-hover:scale-110 transition-transform">
                                                {team.teamName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-teko font-bold text-white uppercase tracking-wider leading-none">
                                                    {team.teamName}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Leader</span>
                                                <span className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                                                    <User className="w-3 h-3 text-yellow-500" />
                                                    {team.leaderName || "NOT ASSIGNED"}
                                                </span>
                                            </div>
                                            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Total Points</span>
                                                <span className="text-sm font-bold text-yellow-500 font-mono">
                                                    {team.totalPoints} PTS
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                                                <span>Match Performance</span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px]",
                                                    team.isVerified ? "text-yellow-500 bg-yellow-500/10" : "text-zinc-500 bg-zinc-800"
                                                )}>
                                                    {team.isVerified ? "VERIFIED" : "PENDING"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-zinc-950/30 border border-zinc-800/50 rounded-lg p-3 text-center">
                                                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Kills</div>
                                                    <div className="text-lg font-teko font-bold text-zinc-300">{team.totalKills}</div>
                                                </div>
                                                <div className="bg-zinc-950/30 border border-zinc-800/50 rounded-lg p-3 text-center">
                                                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Wins</div>
                                                    <div className="text-lg font-teko font-bold text-zinc-300">{team.wins}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedTeam(team)}
                                            className="mt-6 w-full py-3 bg-zinc-800 hover:bg-yellow-500 hover:text-black text-zinc-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                                        >
                                            View Team Details
                                            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    <AnimatePresence>
                        {selectedTeam && (
                            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedTeam(null)}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative w-full max-w-2xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                                >
                                    {/* Modal Container with internal scroll */}
                                    <div className="overflow-y-auto custom-scrollbar flex-1">
                                        {/* Modal Header */}
                                        <div className="relative h-40 bg-zinc-800 flex items-end p-8">
                                            <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                                            <button
                                                onClick={() => setSelectedTeam(null)}
                                                className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-yellow-500 hover:text-black text-white rounded-full transition-all z-10"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>

                                            <div className="relative flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-2 border-yellow-500 flex items-center justify-center font-teko text-5xl font-bold text-yellow-500 shadow-lg shadow-yellow-500/20">
                                                    {selectedTeam.teamName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h2 className="text-4xl md:text-5xl font-teko font-bold text-white uppercase tracking-wider mb-1">
                                                        {selectedTeam.teamName}
                                                    </h2>
                                                    <div className="flex items-center gap-4">
                                                        {selectedTeam.isVerified && (
                                                            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
                                                                <CheckCircle className="w-4 h-4 text-yellow-500" />
                                                                <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest leading-none">
                                                                    VERIFIED SQUAD
                                                                </span>
                                                            </div>
                                                        )}
                                                        {!selectedTeam.isVerified && (
                                                            <span className="bg-zinc-700 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                                PENDING VERIFICATION
                                                            </span>
                                                        )}
                                                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                                            <Trophy className="w-3 h-3 text-yellow-500" />
                                                            {selectedTeam.totalPoints} POINTS
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Modal Body */}
                                        <div className="p-8 space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Roster Section */}
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-teko text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                                                        <Users className="w-5 h-5" /> Team Roster
                                                    </h3>
                                                    <div className="space-y-3 bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6">
                                                        <div className="flex items-center justify-between group">
                                                            <span className="text-zinc-500 text-xs uppercase tracking-widest">Captain</span>
                                                            <span className="text-white font-bold group-hover:text-yellow-500 transition-colors">{selectedTeam.leaderName || "N/A"}</span>
                                                        </div>
                                                        <div className="h-px bg-zinc-800/50" />
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-zinc-500 text-xs uppercase tracking-widest">Player 2</span>
                                                            <span className="text-zinc-200 font-semibold">{selectedTeam.player2 || "N/A"}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-zinc-500 text-xs uppercase tracking-widest">Player 3</span>
                                                            <span className="text-zinc-200 font-semibold">{selectedTeam.player3 || "N/A"}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-zinc-500 text-xs uppercase tracking-widest">Player 4</span>
                                                            <span className="text-zinc-200 font-semibold">{selectedTeam.player4 || "N/A"}</span>
                                                        </div>
                                                        {selectedTeam.substitute && (
                                                            <>
                                                                <div className="h-px bg-zinc-800/50" />
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-zinc-500 text-xs uppercase tracking-widest">Substitute</span>
                                                                    <span className="text-zinc-400 italic">{selectedTeam.substitute}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Contact & Stats Section */}
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-teko text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                                                            <Info className="w-5 h-5" /> Contact Info
                                                        </h3>
                                                        <div className="space-y-3 bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6">
                                                            {selectedTeam.email ? (
                                                                <div className="flex items-center gap-3 text-zinc-300">
                                                                    <Mail className="w-4 h-4 text-yellow-500" />
                                                                    <span className="text-sm truncate">{selectedTeam.email}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-zinc-600 text-xs uppercase italic tracking-widest">No email provided</span>
                                                            )}
                                                            {selectedTeam.phone ? (
                                                                <div className="flex items-center gap-3 text-zinc-300">
                                                                    <Phone className="w-4 h-4 text-yellow-500" />
                                                                    <span className="text-sm">{selectedTeam.phone}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-zinc-600 text-xs uppercase italic tracking-widest block mt-2">No contact provided</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-teko text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                                                            <Shield className="w-5 h-5" /> Performance
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-4 text-center">
                                                                <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Kills</span>
                                                                <span className="text-2xl font-teko font-bold text-white">{selectedTeam.totalKills}</span>
                                                            </div>
                                                            <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-4 text-center">
                                                                <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Wins</span>
                                                                <span className="text-2xl font-teko font-bold text-white">{selectedTeam.wins}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                            {/* Document Section - Centered below grid */}
                                            <div className="space-y-4 max-w-xl mx-auto pt-4">
                                                <h3 className="text-lg font-teko text-yellow-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                                    <FileText className="w-5 h-5" /> Verification Document
                                                </h3>
                                                <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl overflow-hidden group/doc relative shadow-xl">
                                                    {selectedTeam.documentUrl ? (
                                                        <div className="relative">
                                                            <img
                                                                src={selectedTeam.documentUrl}
                                                                alt="Verification"
                                                                className="w-full h-56 object-cover opacity-60 group-hover/doc:opacity-100 transition-opacity duration-500 cursor-zoom-in"
                                                                onClick={() => window.open(selectedTeam.documentUrl, '_blank')}
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = "https://placehold.co/400x200/18181b/yellow?text=Invalid+Image+URL";
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 to-transparent flex items-end p-4">
                                                                <div className="flex items-center justify-between w-full">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="w-3 h-3 text-yellow-500" />
                                                                        <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
                                                                            Preview Mode • Click to zoom
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => window.open(selectedTeam.documentUrl, '_blank')}
                                                                        className="p-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black rounded-lg transition-all"
                                                                    >
                                                                        <ExternalLink className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
                                                            <FileText className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                                                            <span className="block text-xs text-zinc-600 uppercase italic tracking-widest">No document uploaded</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {!selectedTeam.isVerified && (
                                                <div className="pt-6 border-t border-zinc-800">
                                                    <button
                                                        onClick={() => {
                                                            verifyTeam(selectedTeam.teamName);
                                                            setSelectedTeam({ ...selectedTeam, isVerified: true });
                                                        }}
                                                        className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/20"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                        VERIFY SQUAD NOW
                                                    </button>
                                                    <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-widest">
                                                        Admin Action: This will move the team to the live leaderboard.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="pt-6 border-t border-zinc-800 text-center">
                                                <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-bold">
                                                    BGMI Pro Championship 2026 • {selectedTeam.isVerified ? "Verified Squad" : "Roster Identification"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {filteredTeams.length === 0 && (
                        <div className="text-center py-20 bg-zinc-900/20 border border-zinc-800 rounded-3xl">
                            <Info className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                            <h2 className="text-2xl font-teko text-zinc-500 uppercase tracking-widest">
                                {searchQuery ? `No results for "${searchQuery}"` : "No Teams Registered Yet"}
                            </h2>
                            <button
                                onClick={() => searchQuery ? setSearchQuery("") : window.location.href = "/entry"}
                                className="mt-6 text-yellow-500 hover:text-yellow-400 font-bold uppercase tracking-widest text-sm underline underline-offset-8 decoration-yellow-500/30"
                            >
                                {searchQuery ? "Clear Search" : "Register Your Squad Now"}
                            </button>
                        </div>
                    )}
                </div>
            </main >

            <Footer />
        </div >
    );
}
