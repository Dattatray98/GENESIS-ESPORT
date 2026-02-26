import { useLeaderboard } from "@/context/LeaderboardContext";
import { type Team } from "@/constants/leaderboardData";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import { Trash2, Plus, Save, Search, XCircle } from "lucide-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAxios } from "@/hooks/useAxios";

export default function UpdateScore() {
    const [searchParams] = useSearchParams();
    const seasonId = searchParams.get("seasonId");
    const matchId = searchParams.get("matchId");

    const { teams, updateTeams, setSeasonId } = useLeaderboard();
    const { request: finishMatchRequest, loading: finishing } = useAxios();
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);
    const [currentMatch, setCurrentMatch] = useState<any>(null);
    const { request: fetchMatch, loading: matchLoading } = useAxios();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const adjustmentPendingRef = useRef<{ index: number, field: string, type: 'add' | 'subtract' } | null>(null);

    // Fetch match data if matchId is present
    const loadMatch = useCallback(async () => {
        if (!matchId) return;
        try {
            const data = await fetchMatch({
                url: `matches/${matchId}`,
                method: 'GET'
            });
            if (data) setCurrentMatch(data);
        } catch (error) {
            console.error("Failed to fetch match", error);
        }
    }, [matchId, fetchMatch]);

    useEffect(() => {
        loadMatch();
    }, [loadMatch]);

    // ... existing shortcuts ...

    // Finish Match Function
    const handleFinishMatch = async () => {
        if (!matchId) return;
        try {
            await finishMatchRequest({
                url: `matches/${matchId}/finish`,
                method: 'POST'
            });
            setSuccessMessage("Mission Accomplished: Match ended and stats snapshotted.");
            setShowFinishConfirm(false);
            setTimeout(() => navigate('/matches'), 2000);
        } catch (error) {
            console.error("Failed to finish match", error);
        }
    };

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

    // Sync seasonId with context
    useEffect(() => {
        if (seasonId) {
            setSeasonId(seasonId);
        }
    }, [seasonId, setSeasonId]);

    // Local filter for teams based on seasonId and matchId
    const filteredTeamsForForm = useMemo(() => {
        return teams
            .map(team => {
                const teamId = String((team as any)._id || team.teamName);
                const matchResult = currentMatch?.results?.find((r: any) =>
                    String(r.teamId?._id || r.teamId) === teamId
                );

                return {
                    ...team,
                    // If we are in a match, use match-specific scores. Otherwise, they start at 0 for a new match.
                    totalKills: matchResult ? Number(matchResult.kills) : (matchId ? 0 : Number((team as any).totalKills || 0)),
                    placementPoints: matchResult ? Number(matchResult.placementPoints) : (matchId ? 0 : Number((team as any).placementPoints || 0)),
                    totalPoints: matchResult ? (Number(matchResult.totalPoints) || (Number(matchResult.kills) + Number(matchResult.placementPoints))) : (matchId ? 0 : Number((team as any).totalPoints || 0)),
                    wins: matchResult ? (matchResult.rank === 1 ? 1 : 0) : (matchId ? 0 : Number((team as any).wins || 0)),
                    alivePlayers: matchResult ? Number(matchResult.alivePlayers ?? 4) : Number((team as any).alivePlayers ?? 4)
                };
            })
            .filter((team: Team) => {
                const teamId = String((team as any)._id || team.teamName);
                const matchesSeason = !seasonId ||
                    (typeof team.seasonId === 'string' ? team.seasonId === seasonId : team.seasonId?._id === seasonId);

                // If matchId exists, only show teams that are in this match results
                // CRITICAL: We wait for currentMatch to be loaded if matchId is present
                const isInMatch = !matchId || (currentMatch &&
                    (currentMatch.results || []).some((r: any) => String(r.teamId?._id || r.teamId) === teamId));

                return team.isVerified && matchesSeason && isInMatch;
            });
    }, [teams, seasonId, matchId, currentMatch]);

    const { control, register, handleSubmit, setValue, getValues, reset, watch } = useForm({
        defaultValues: {
            teams: filteredTeamsForForm,
        },
    });

    const watchedTeams = watch("teams");

    useEffect(() => {
        reset({
            teams: filteredTeamsForForm,
        });
    }, [filteredTeamsForForm, reset]);

    const { fields, remove } = useFieldArray({
        control,
        name: "teams",
    });

    const { request: updateMatchRequest } = useAxios();

    const onSubmit = async (data: { teams: any[] }) => {
        const updatedTeamsInForm = data.teams.map(team => ({
            ...team,
            totalKills: Number(team.totalKills),
            placementPoints: Number(team.placementPoints),
            wins: Number(team.wins),
            alivePlayers: Number(team.alivePlayers ?? 4),
            totalPoints: Number(team.totalKills) + Number(team.placementPoints),
            group: team.group || 'None'
        }));

        if (matchId) {
            // CASE: Updating specific match results
            const updatedResults = updatedTeamsInForm.map(team => ({
                teamId: team._id,
                kills: team.totalKills,
                placementPoints: team.placementPoints,
                totalPoints: team.totalPoints,
                rank: 0, // Server will calculate rank on finish
                alivePlayers: team.alivePlayers
            }));

            try {
                await updateMatchRequest({
                    url: `matches/${matchId}`,
                    method: 'PUT',
                    data: { results: updatedResults }
                });
                setSuccessMessage("Match stats saved successfully!");
                loadMatch(); // Refresh intelligence from server
                setTimeout(() => setSuccessMessage(""), 3000);
            } catch (error) {
                console.error("Failed to update match results", error);
            }
        } else {
            // CASE: Global update (legacy fallback)
            // Merge updates with the FULL teams list from context
            const allTeamsUpdated = teams.map(existingTeam => {
                const update = updatedTeamsInForm.find(t =>
                    (t._id && existingTeam._id === t._id) || (t.teamName === existingTeam.teamName)
                );
                return update ? { ...existingTeam, ...update } : existingTeam;
            });

            await updateTeams(allTeamsUpdated);
            setSuccessMessage("Standing update saved successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        }
    };

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black relative">
            <Navbar />

            {/* Finish Confirmation Modal */}
            <AnimatePresence>
                {showFinishConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => !finishing && setShowFinishConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                            <h3 className="text-3xl font-teko font-bold text-white uppercase mb-4 tracking-wider">Terminate Match?</h3>
                            <p className="text-zinc-400 font-medium mb-8 leading-relaxed">
                                This will snapshot the current leaderboard into Match Stats and permanently close this operation.
                                <span className="block mt-2 text-red-500 font-bold uppercase text-xs tracking-widest">Action cannot be undone.</span>
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl h-12 font-bold"
                                    disabled={finishing}
                                    onClick={() => setShowFinishConfirm(false)}
                                >
                                    ABORT
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-bold border-none"
                                    disabled={finishing}
                                    onClick={handleFinishMatch}
                                >
                                    {finishing ? "TERMINATING..." : "CONFIRM END"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <main className="pt-24 pb-16 section-container max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-teko font-bold text-white uppercase">
                        Update <span className="text-yellow-500">Score</span>
                        {matchId && <span className="ml-4 text-sm text-zinc-500 font-teko tracking-[0.2em] font-light">Target: #{matchId.slice(-4)}</span>}
                    </h1>
                    <div className="flex gap-4">
                        {matchId && currentMatch?.status !== 'completed' && (
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setShowFinishConfirm(true)}
                                className="border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-bold"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Finish Match
                            </Button>
                        )}
                        <Button
                            variant="neon"
                            type="submit"
                            form="admin-form"
                            className={cn(
                                "font-bold",
                                currentMatch?.status === 'completed' && "opacity-50 cursor-not-allowed pointer-events-none grayscale"
                            )}
                            disabled={currentMatch?.status === 'completed'}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {currentMatch?.status === 'completed' ? 'SCORE FROZEN' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {successMessage && (
                    <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded mb-8 text-center font-bold animate-pulse">
                        {successMessage}
                    </div>
                )}

                {currentMatch?.status === 'completed' && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl mb-8 flex items-center justify-center gap-3">
                        <XCircle className="w-5 h-5" />
                        <span className="font-teko text-xl uppercase tracking-widest font-bold">Strategic Lockdown: This match is completed and scores are immutable.</span>
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
                                    <th className="p-2 w-32">Group</th>
                                    <th className="p-2 w-20 text-center">Wins</th>
                                    <th className="p-2 w-24 text-center">Place Pts</th>
                                    <th className="p-2 w-20 text-center">Kills</th>
                                    <th className="p-2 w-24 text-center">Alive</th>
                                    <th className="p-2 w-20 text-center">Total</th>
                                    <th className="p-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {matchLoading ? (
                                    <tr>
                                        <td colSpan={8} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                                                <p className="text-yellow-500 font-teko text-xl tracking-widest uppercase animate-pulse">Retrieving Match Intel...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : fields.map((field, index) => {
                                    const isMatch = (field as any).teamName?.toLowerCase().includes(searchQuery.toLowerCase());
                                    if (searchQuery && !isMatch) return null;

                                    const handleScoreKeyDown = (e: React.KeyboardEvent, fieldProp: string, currentIndex: number) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (e.shiftKey) {
                                                let prevSelector = "";
                                                if (fieldProp === "alivePlayers") prevSelector = `input[data-field="totalKills"][data-index="${currentIndex}"]`;
                                                else if (fieldProp === "totalKills") prevSelector = `input[data-field="placementPoints"][data-index="${currentIndex}"]`;
                                                else if (fieldProp === "placementPoints") prevSelector = `input[data-field="wins"][data-index="${currentIndex}"]`;
                                                else if (fieldProp === "wins") {
                                                    const allWins = Array.from(document.querySelectorAll('input[data-field="wins"]')) as HTMLInputElement[];
                                                    const currentIdx = allWins.findIndex(el => el.getAttribute('data-index') === currentIndex.toString());
                                                    if (currentIdx > 0) {
                                                        const prevAlive = document.querySelector(`[data-field="alivePlayers"][data-index="${allWins[currentIdx - 1].getAttribute('data-index')}"]`) as HTMLElement;
                                                        if (prevAlive) prevAlive.focus();
                                                        return;
                                                    } else {
                                                        searchInputRef.current?.focus();
                                                        return;
                                                    }
                                                }

                                                if (prevSelector) {
                                                    const prevInput = document.querySelector(prevSelector) as HTMLElement;
                                                    if (prevInput) prevInput.focus();
                                                }
                                            } else {
                                                let nextSelector = "";
                                                if (fieldProp === "wins") nextSelector = `input[data-field="placementPoints"][data-index="${currentIndex}"]`;
                                                else if (fieldProp === "placementPoints") nextSelector = `input[data-field="totalKills"][data-index="${currentIndex}"]`;
                                                else if (fieldProp === "totalKills") nextSelector = `[data-field="alivePlayers"][data-index="${currentIndex}"]`;
                                                else if (fieldProp === "alivePlayers") {
                                                    const allWins = Array.from(document.querySelectorAll('input[data-field="wins"]')) as HTMLInputElement[];
                                                    const currentIdx = allWins.findIndex(el => el.getAttribute('data-index') === currentIndex.toString());
                                                    if (currentIdx !== -1 && currentIdx < allWins.length - 1) {
                                                        allWins[currentIdx + 1].focus();
                                                        return;
                                                    }
                                                }

                                                if (nextSelector) {
                                                    const nextInput = document.querySelector(nextSelector) as HTMLElement;
                                                    if (nextInput) nextInput.focus();
                                                }
                                            }
                                        }

                                        if (e.key === "+" || e.key === "=" || e.key === "Add" || e.code === "NumpadAdd") {
                                            e.preventDefault();
                                            adjustmentPendingRef.current = { index: currentIndex, field: fieldProp, type: 'add' };
                                            return;
                                        }

                                        if (e.key === "-" || e.key === "_" || e.key === "Subtract" || e.code === "NumpadSubtract") {
                                            e.preventDefault();
                                            adjustmentPendingRef.current = { index: currentIndex, field: fieldProp, type: 'subtract' };
                                            return;
                                        }

                                        const isNumber = /^\d$/.test(e.key);
                                        const isK = e.key.toLowerCase() === 'k';

                                        if ((isNumber || isK) && adjustmentPendingRef.current?.index === currentIndex && adjustmentPendingRef.current?.field === fieldProp) {
                                            e.preventDefault();
                                            const currentVal = getValues(`teams.${currentIndex}.${fieldProp}` as any);
                                            const valToUse = currentVal !== undefined ? Number(currentVal) : (fieldProp === 'alivePlayers' ? 4 : 0);

                                            const changeVal = isK ? 1 : Number(e.key);
                                            let newVal = adjustmentPendingRef.current.type === 'add' ? valToUse + changeVal : valToUse - changeVal;

                                            newVal = fieldProp === 'alivePlayers' ? Math.max(0, Math.min(4, newVal)) : Math.max(0, newVal);

                                            setValue(`teams.${currentIndex}.${fieldProp}` as any, newVal);
                                            adjustmentPendingRef.current = null;
                                            return;
                                        }

                                        if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) {
                                            adjustmentPendingRef.current = null;
                                        }
                                    };

                                    return (
                                        <tr key={field.id} className="group hover:bg-zinc-800/30 transition-colors">
                                            <td className="p-2 min-w-[200px]">
                                                <input
                                                    {...register(`teams.${index}.teamName`, { required: true })}
                                                    className="w-full bg-transparent border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-yellow-500 outline-none transition-colors font-bold"
                                                    placeholder="Team Name"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    {...register(`teams.${index}.group` as any)}
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-2 text-zinc-300 font-teko text-lg focus:border-yellow-500 outline-none transition-colors"
                                                >
                                                    <option value="None">None</option>
                                                    <option value="Group-1">Group-1</option>
                                                    <option value="Group-2">Group-2</option>
                                                </select>
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
                                                <div
                                                    tabIndex={0}
                                                    data-id={`alive-${index}`}
                                                    data-index={index}
                                                    data-field="alivePlayers"
                                                    onKeyDown={(e) => handleScoreKeyDown(e, "alivePlayers", index)}
                                                    className="inline-flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 cursor-pointer focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all hover:bg-zinc-900 group/alive"
                                                >
                                                    <input type="hidden" {...register(`teams.${index}.alivePlayers` as any)} />
                                                    {[0, 1, 2, 3].map((dotIdx) => (
                                                        <div
                                                            key={dotIdx}
                                                            className={cn(
                                                                "w-2 h-2 rounded-full transition-all duration-300",
                                                                dotIdx < (Number(watchedTeams[index]?.alivePlayers) || 0)
                                                                    ? "bg-yellow-500 shadow-[0_0_8px_#facc15]"
                                                                    : "bg-zinc-800"
                                                            )}
                                                        />
                                                    ))}
                                                    <span className="text-[11px] font-bold text-zinc-500 ml-1 group-focus/alive:text-yellow-500">
                                                        {watchedTeams[index]?.alivePlayers ?? 4}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-2 text-center">
                                                <div className="bg-zinc-800/20 rounded px-2 py-2 text-center text-zinc-600 font-mono text-xs">
                                                    {(Number(watchedTeams[index]?.totalKills || 0) + Number(watchedTeams[index]?.placementPoints || 0))}
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
                                onClick={() => navigate(seasonId ? `/admin/entry?seasonId=${seasonId}` : "/admin/entry")}
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
