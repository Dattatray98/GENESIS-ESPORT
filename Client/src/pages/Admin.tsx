import { useLeaderboard } from "@/context/LeaderboardContext";
import { type Team } from "@/constants/leaderboardData";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import { Trash2, Plus, Save, RefreshCw, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Admin() {
    const { teams, updateTeams, resetTeams } = useLeaderboard();
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Global shortcut for '/'
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Focus search if '/' is pressed and we aren't already in the search box
            if (e.key === "/" && document.activeElement !== searchInputRef.current) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    const { control, register, handleSubmit, reset } = useForm({
        defaultValues: {
            teams: teams.filter(team => team.isVerified),
        },
    });

    const { fields, remove } = useFieldArray({
        control,
        name: "teams",
    });

    const onSubmit = (data: { teams: Team[] }) => {
        // We only care about name, kills, placement, wins, etc. Rank is auto-calculated.
        const updatedVerifiedTeams = data.teams.map(team => ({
            ...team,
            totalKills: Number(team.totalKills),
            placementPoints: Number(team.placementPoints),
            wins: Number(team.wins),
            totalPoints: Number(team.totalKills) + Number(team.placementPoints),
            isVerified: true // Ensure they stay verified
        }));

        // Merge with existing teams that were NOT in the form (unverified teams)
        const unverifiedTeams = teams.filter(t => !t.isVerified);
        const allTeams = [...updatedVerifiedTeams, ...unverifiedTeams];

        updateTeams(allTeams);
        setSuccessMessage("Standing update saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset the leaderboard to default values?")) {
            resetTeams();
            reset({ teams: teams }); // Need to grab fresh default teams, hook state update might be slightly async but resetTeams updates context immediately. Wait, actually resetTeams sets context state. We need to re-initialize form with that new state.
            // A simple way is reload or just manually set it. Since this component uses useLeaderboard, it will re-render with new teams.
            // However, useForm defaultValues are only set on mount unless we use values from useForm(values: teams, resetOptions: ...).
            // Let's rely on a key or manually reset.
            window.location.reload();
        }
    };

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black">
            <Navbar />

            <main className="pt-24 pb-16 section-container max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-teko font-bold text-white uppercase">
                        Admin <span className="text-yellow-500">Dashboard</span>
                    </h1>
                    <div className="flex gap-4">
                        <Button variant="destructive" onClick={handleReset} className="font-bold">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset Data
                        </Button>
                        <Button variant="neon" type="submit" form="admin-form" className="font-bold">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                {successMessage && (
                    <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded mb-8 text-center font-bold animate-pulse">
                        {successMessage}
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="SEARCH TEAM... (Press / to search, Shift+Enter to edit)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.shiftKey) {
                                e.preventDefault();
                                const firstInput = document.querySelector('input[data-field="wins"]') as HTMLInputElement;
                                if (firstInput) firstInput.focus();
                            }
                        }}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-teko text-xl tracking-wider focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-700 uppercase"
                    />
                </div>

                <form
                    id="admin-form"
                    onSubmit={handleSubmit(onSubmit)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            // Only prevent if we're not inside the search bar or another specific exclusion
                            const target = e.target as HTMLElement;
                            if (target.tagName === "INPUT") e.preventDefault();
                        }
                    }}
                    className="space-y-4"
                >
                    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-zinc-400 font-teko text-lg tracking-wider uppercase">
                                    <th className="p-2">Name</th>
                                    <th className="p-2 w-20 text-center">Wins</th>
                                    <th className="p-2 w-24 text-center">Place Pts</th>
                                    <th className="p-2 w-20 text-center">Kills</th>
                                    <th className="p-2 w-20 text-center">Total</th> {/* Read Only */}
                                    <th className="p-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {fields.map((field, index) => {
                                    const isMatch = (field as any).teamName?.toLowerCase().includes(searchQuery.toLowerCase());
                                    if (searchQuery && !isMatch) return null;

                                    const handleScoreKeyDown = (e: React.KeyboardEvent, field: string, currentIndex: number) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (e.shiftKey) {
                                                // Shift+Enter: Navigate Backward
                                                let prevSelector = "";
                                                if (field === "totalKills") prevSelector = `input[data-field="placementPoints"][data-index="${currentIndex}"]`;
                                                else if (field === "placementPoints") prevSelector = `input[data-field="wins"][data-index="${currentIndex}"]`;
                                                else if (field === "wins") {
                                                    // Find the previous visible row's kills input
                                                    const allWins = Array.from(document.querySelectorAll('input[data-field="wins"]')) as HTMLInputElement[];
                                                    const currentIdx = allWins.findIndex(el => el.getAttribute('data-index') === currentIndex.toString());
                                                    if (currentIdx > 0) {
                                                        const prevKills = document.querySelector(`input[data-field="totalKills"][data-index="${allWins[currentIdx - 1].getAttribute('data-index')}"]`) as HTMLInputElement;
                                                        if (prevKills) prevKills.focus();
                                                        return;
                                                    } else {
                                                        // We're at the very first field of the first team, focus search bar
                                                        searchInputRef.current?.focus();
                                                        return;
                                                    }
                                                }

                                                if (prevSelector) {
                                                    const prevInput = document.querySelector(prevSelector) as HTMLInputElement;
                                                    if (prevInput) prevInput.focus();
                                                }
                                            } else {
                                                // Enter: Navigate Forward
                                                let nextSelector = "";
                                                if (field === "wins") nextSelector = `input[data-field="placementPoints"][data-index="${currentIndex}"]`;
                                                else if (field === "placementPoints") nextSelector = `input[data-field="totalKills"][data-index="${currentIndex}"]`;
                                                else if (field === "totalKills") {
                                                    const allWins = Array.from(document.querySelectorAll('input[data-field="wins"]')) as HTMLInputElement[];
                                                    const currentIdx = allWins.findIndex(el => el.getAttribute('data-index') === currentIndex.toString());
                                                    if (currentIdx !== -1 && currentIdx < allWins.length - 1) {
                                                        allWins[currentIdx + 1].focus();
                                                        return;
                                                    }
                                                }

                                                if (nextSelector) {
                                                    const nextInput = document.querySelector(nextSelector) as HTMLInputElement;
                                                    if (nextInput) nextInput.focus();
                                                }
                                            }
                                        }
                                    };

                                    return (
                                        <tr key={field.id} className="group hover:bg-zinc-800/30 transition-colors">
                                            <td className="p-2">
                                                <input
                                                    {...register(`teams.${index}.teamName`, { required: true })}
                                                    className="w-full bg-transparent border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-yellow-500 outline-none transition-colors font-bold"
                                                    placeholder="Team Name"
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    data-index={index}
                                                    data-field="wins"
                                                    {...register(`teams.${index}.wins`, { required: true, min: 0 })}
                                                    onKeyDown={(e) => handleScoreKeyDown(e, "wins", index)}
                                                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-2 text-center text-yellow-500 font-bold focus:border-yellow-500 outline-none no-spinner"
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    data-index={index}
                                                    data-field="placementPoints"
                                                    {...register(`teams.${index}.placementPoints`, { required: true, min: 0 })}
                                                    onKeyDown={(e) => handleScoreKeyDown(e, "placementPoints", index)}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-center text-zinc-300 font-bold focus:border-yellow-500 outline-none no-spinner"
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    data-index={index}
                                                    data-field="totalKills"
                                                    {...register(`teams.${index}.totalKills`, { required: true, min: 0 })}
                                                    onKeyDown={(e) => handleScoreKeyDown(e, "totalKills", index)}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-center text-red-500 font-bold focus:border-yellow-500 outline-none no-spinner"
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <div className="bg-zinc-800/50 rounded px-2 py-2 text-center text-zinc-500 font-mono text-sm">
                                                    Auto
                                                </div>
                                            </td>
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                                                    title="Remove Team"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="mt-4 flex justify-center">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate("/teams")}
                                className="w-full md:w-auto text-yellow-500 border-yellow-500/20"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add New Team
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
