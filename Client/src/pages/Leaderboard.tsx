import { useLeaderboard } from "@/context/LeaderboardContext";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Trophy, Crosshair, Users, Target, Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Leaderboard() {
    const { teams } = useLeaderboard();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const verifiedTeams = teams.filter(team => team.isVerified);

    const filteredTeams = verifiedTeams.filter(team =>
        team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black">
            <Navbar />

            <main className="pt-24 pb-16 section-container relative">

                <ScrollReveal>
                    <div className="text-center mb-16 relative">
                        <h1 className="text-5xl md:text-7xl font-teko font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 mb-4 tracking-tighter drop-shadow-2xl uppercase">
                            Tournament <span className="text-yellow-500">Standings</span>
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
                            Live rankings of the top teams battling for glory. Points are calculated based on kills and placement.
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div className="relative w-full max-w-md group">
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
                        <Button
                            variant="neonOutline"
                            size="lg"
                            className="flex items-center gap-2 w-full md:w-auto font-teko text-lg tracking-wider"
                            onClick={() => navigate("/admin")}
                        >
                            <Shield className="w-5 h-5" />
                            UPDATE STANDINGS
                        </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-teko text-xl tracking-wider uppercase">
                                    <th className="p-4 px-6">Rank</th>
                                    <th className="p-4 px-6 w-full">Team Name</th>
                                    <th className="p-4 px-6 text-center hidden md:table-cell"><div className="flex items-center justify-center gap-2"><Target className="w-4 h-4 text-yellow-500" /> Kills</div></th>
                                    <th className="p-4 px-6 text-center hidden md:table-cell"><div className="flex items-center justify-center gap-2"><Users className="w-4 h-4 text-yellow-500" /> Position Pts</div></th>
                                    <th className="p-4 px-6 text-center"><div className="flex items-center justify-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Total Pts</div></th>
                                    <th className="p-4 px-6 text-center hidden sm:table-cell"><div className="flex items-center justify-center gap-2"><Crosshair className="w-4 h-4 text-yellow-500" /> Wins</div></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {filteredTeams.map((team) => {
                                    // Calculate original index/rank based on source data
                                    const originalIndex = teams.findIndex(t => t.teamName === team.teamName);
                                    return (
                                        <tr
                                            key={team.teamName}
                                            className={cn(
                                                "group transition-colors hover:bg-zinc-800/50",
                                                originalIndex < 3 && team.totalPoints > 0 ? "bg-yellow-500/5" : ""
                                            )}
                                        >
                                            <td className="p-4 px-6 font-teko text-2xl">
                                                <span className={cn(
                                                    "flex items-center justify-center w-8 h-8 rounded-full",
                                                    team.totalPoints > 0 ? (
                                                        originalIndex === 0 ? "bg-yellow-500 text-black font-bold" :
                                                            originalIndex === 1 ? "bg-zinc-400 text-black font-bold" :
                                                                originalIndex === 2 ? "bg-orange-700 text-white font-bold" :
                                                                    "text-zinc-500"
                                                    ) : "text-zinc-700 bg-zinc-900/50"
                                                )}>
                                                    {team.totalPoints > 0 ? originalIndex + 1 : "-"}
                                                </span>
                                            </td>
                                            <td className="p-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {/* Team Logo Placeholder */}
                                                    <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center text-xs font-teko text-zinc-600 border border-zinc-700 group-hover:border-yellow-500/50 transition-colors">
                                                        {team.teamName.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-lg text-white group-hover:text-yellow-400 transition-colors uppercase tracking-wide">
                                                        {team.teamName}
                                                    </span>
                                                    {originalIndex === 0 && <Trophy className="w-4 h-4 text-yellow-500 ml-2 animate-pulse" />}
                                                </div>
                                            </td>
                                            <td className="p-4 px-6 text-center font-rajdhani font-semibold text-zinc-300 hidden md:table-cell">{team.totalKills}</td>
                                            <td className="p-4 px-6 text-center font-rajdhani font-semibold text-zinc-300 hidden md:table-cell">{team.placementPoints}</td>
                                            <td className="p-4 px-6 text-center">
                                                <span className="font-teko text-2xl font-bold text-yellow-500">{team.totalPoints}</span>
                                            </td>
                                            <td className="p-4 px-6 text-center font-rajdhani font-semibold text-zinc-300 hidden sm:table-cell">{team.wins}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </ScrollReveal>

            </main>

            <Footer />
        </div>
    );
}