import { useLeaderboard } from "@/context/LeaderboardContext";
import { type Team } from "@/constants/leaderboardData";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import { Trash2, Plus, Save, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function UpdateScore() {
    const { teams, updateTeams } = useLeaderboard();
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const adjustmentPendingRef = useRef<{ index: number, field: string, type: 'add' | 'subtract' } | null>(null);

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

    const { control, register, handleSubmit, setValue, getValues, reset } = useForm({
        defaultValues: {
            teams: teams.filter((team: Team) => team.isVerified),
        },
    });

    useEffect(() => {
        reset({
            teams: teams.filter((team: Team) => team.isVerified),
        });
    }, [teams, reset]);

    const { fields, remove } = useFieldArray({
        control,
        name: "teams",
    });

    const onSubmit = async (data: { teams: Team[] }) => {
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
        const unverifiedTeams = teams.filter((t: Team) => !t.isVerified);
        const allTeams = [...updatedVerifiedTeams, ...unverifiedTeams];

        await updateTeams(allTeams);
        setSuccessMessage("Standing update saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };



    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black">
            <Navbar />

            <main className="pt-24 pb-16 section-container max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-teko font-bold text-white uppercase">
                        Update <span className="text-yellow-500">Score</span>
                    </h1>
                    <div className="flex gap-4">

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

                                    const handleScoreKeyDown = (e: React.KeyboardEvent, fieldProp: string, currentIndex: number) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (e.shiftKey) {
                                                // Shift+Enter: Navigate Backward
                                                let prevSelector = "";
                                                if (fieldProp === "totalKills") prevSelector = `input[data-field="placementPoints"][data-index="${currentIndex}"]`;
                                                else if (fieldProp === "placementPoints") prevSelector = `input[data-field="wins"][data-index="${currentIndex}"]`;
                                                else if (fieldProp === "wins") {
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
                                                if (fieldProp === "wins") nextSelector = `input[data-field="placementPoints"][data-index="${currentIndex}"]`;
                                                else if (fieldProp === "placementPoints") nextSelector = `input[data-field="totalKills"][data-index="${currentIndex}"]`;
                                                else if (fieldProp === "totalKills") {
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

                                        // Quick Score Adjustment Feature (+/- and number)
                                        if (e.key === "+" || e.key === "Add" || e.code === "NumpadAdd") {
                                            e.preventDefault();
                                            adjustmentPendingRef.current = { index: currentIndex, field: fieldProp, type: 'add' };
                                            return;
                                        }

                                        if (e.key === "-" || e.key === "Subtract" || e.code === "NumpadSubtract") {
                                            e.preventDefault();
                                            adjustmentPendingRef.current = { index: currentIndex, field: fieldProp, type: 'subtract' };
                                            return;
                                        }

                                        if (adjustmentPendingRef.current?.index === currentIndex && adjustmentPendingRef.current?.field === fieldProp && /^\d$/.test(e.key)) {
                                            e.preventDefault();
                                            const currentVal = Number(getValues(`teams.${currentIndex}.${fieldProp}` as any)) || 0;
                                            const changeVal = Number(e.key);
                                            const newVal = adjustmentPendingRef.current.type === 'add' ? currentVal + changeVal : Math.max(0, currentVal - changeVal);

                                            setValue(`teams.${currentIndex}.${fieldProp}` as any, newVal);
                                            adjustmentPendingRef.current = null;
                                            return;
                                        }

                                        // Reset adjustment mode if any other key is pressed (excluding modifiers)
                                        if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) {
                                            adjustmentPendingRef.current = null;
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
                                onClick={() => navigate("/admin/teams")}
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
