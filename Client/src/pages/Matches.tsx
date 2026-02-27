import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Calendar, Clock, Trophy, Gamepad2, PlayCircle, X, Zap, Edit2
} from "lucide-react";
import { Button } from '@/components/ui/Button';
import { useSeasons, type Season } from '@/hooks/useSeasons';
import { useAxios } from '@/hooks/useAxios';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { TeamCard } from '@/components/match/TeamCard';

const getLocalDatetimeString = (date = new Date()) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

interface Match {
    _id: string;
    seasonId: { _id: string, title: string };
    matchNumber: number;
    gameName: string;
    mapName: string;
    roomId?: string;
    password?: string;
    maxPlayers?: number;
    dateTime: string;
    status: 'upcoming' | 'live' | 'completed';
    streamUrl?: string;
    results?: any[];
}

export default function Matches() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const selectedSeasonId = searchParams.get('seasonId');
    const { fetchSeasons } = useSeasons();
    const { request: fetchMatches, loading } = useAxios<Match[]>();
    const { request: createMatchRequest } = useAxios<any>();
    const { request: addTeamsRequest } = useAxios<any>();
    const { request: fetchTeams } = useAxios<any[]>();

    const [matches, setMatches] = useState<Match[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [verifiedTeams, setVerifiedTeams] = useState<any[]>([]);
    const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

    const initialMatchState = {
        seasonId: selectedSeasonId || "",
        matchNumber: 1,
        gameName: "BGMI",
        mapName: "ERANGEL",
        roomId: "",
        password: "",
        maxPlayers: 60,
        dateTime: getLocalDatetimeString(),
        status: "upcoming" as const
    };
    const [newMatch, setNewMatch] = useState(initialMatchState);

    const resetForm = () => {
        setNewMatch({
            ...initialMatchState,
            seasonId: selectedSeasonId || ""
        });
    };

    const { request: updateMatchRequest } = useAxios<any>();
    const [showEditRoomModal, setShowEditRoomModal] = useState(false);
    const [roomDetails, setRoomDetails] = useState({ roomId: "", password: "" });

    const handleOpenEditRoom = () => {
        if (!selectedMatch) return;
        setRoomDetails({
            roomId: selectedMatch.roomId || "",
            password: selectedMatch.password || ""
        });
        setShowEditRoomModal(true);
    };

    const handleUpdateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMatch) return;
        try {
            const data = await updateMatchRequest({
                url: `matches/${selectedMatch._id}`,
                method: 'PUT',
                data: roomDetails
            });
            if (data) {
                setMatches(prev => prev.map(m => m._id === data._id ? data : m));
                setShowEditRoomModal(false);
            }
        } catch (error) {
            console.error("Failed to update room details", error);
        }
    };

    const selectedMatch = useMemo(() =>
        matches.find(m => m._id === selectedMatchId) || matches[0],
        [matches, selectedMatchId]
    );

    useEffect(() => {
        if (!selectedMatchId && matches.length > 0) {
            setSelectedMatchId(matches[0]._id);
        }
    }, [matches, selectedMatchId]);

    // Reset modal state on close
    useEffect(() => {
        if (!showCreateModal) {
            resetForm();
        }
    }, [showCreateModal, selectedSeasonId]);

    useEffect(() => {
        const loadInitialData = async () => {
            const seasonData = await fetchSeasons();
            if (seasonData) setSeasons(seasonData);

            const matchData = await fetchMatches({
                url: selectedSeasonId ? `matches?seasonId=${selectedSeasonId}` : 'matches',
                method: 'GET'
            });
            if (matchData) {
                setMatches(matchData);
            }
        };
        loadInitialData();
    }, [selectedSeasonId]);

    const filteredMatches = useMemo(() => {
        return matches.filter(match => {
            const matchesTab = activeTab === 'all' || match.status === activeTab;
            const matchesSearch = match.mapName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                match.seasonId?.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [matches, activeTab, searchQuery]);

    const handleSeasonChange = (seasonId: string) => {
        if (seasonId === 'all') {
            searchParams.delete('seasonId');
        } else {
            searchParams.set('seasonId', seasonId);
        }
        setSearchParams(searchParams);
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...newMatch,
                dateTime: new Date(newMatch.dateTime).toISOString()
            };
            const data = await createMatchRequest({
                url: 'matches/add',
                method: 'POST',
                data: dataToSubmit
            });
            if (data) {
                setShowCreateModal(false);
                const matchData = await fetchMatches({
                    url: selectedSeasonId ? `matches?seasonId=${selectedSeasonId}` : 'matches',
                    method: 'GET'
                });
                if (matchData) setMatches(matchData);
            }
        } catch (error) {
            console.error("Match deployment aborted.", error);
        }
    };

    const handleOpenTeamSelect = async () => {
        if (!selectedMatch) return;
        try {
            const teams = await fetchTeams({
                url: `teams?seasonId=${selectedMatch.seasonId._id}&isVerified=true`,
                method: 'GET'
            });
            if (teams) {
                const alreadyInMatchIds = (selectedMatch.results || []).map((r: any) => r.teamId?._id || r.teamId);
                const availableTeams = teams.filter((t: any) => !alreadyInMatchIds.includes(t._id));
                setVerifiedTeams(availableTeams);
                setSelectedTeamIds([]); // Only select NEW teams
                setShowTeamSelectModal(true);
            }
        } catch (error) {
            console.error("Failed to fetch teams", error);
        }
    };

    const handleAddTeamsToMatch = async () => {
        if (!selectedMatch) return;
        try {
            const data = await addTeamsRequest({
                url: `matches/${selectedMatch._id}/teams`,
                method: 'POST',
                data: { teamIds: selectedTeamIds }
            });
            if (data) {
                setMatches(prev => prev.map(m => m._id === data._id ? data : m));
                setShowTeamSelectModal(false);
            }
        } catch (error) {
            console.error("Failed to add teams", error);
        }
    };

    const handleFinishMatch = async () => {
        if (!selectedMatch) return;
        setFinishing(true);
        try {
            const data = await createMatchRequest({
                url: `matches/${selectedMatch._id}/finish`,
                method: 'POST'
            });
            if (data) {
                setMatches(prev => prev.map(m => m._id === data._id ? data : m));
                setShowFinishConfirm(false);
            }
        } catch (error) {
            console.error("Failed to finish match", error);
        } finally {
            setFinishing(false);
        }
    };

    const getDisplayStatus = (match: Match) => {
        if (match.status === 'completed') return 'completed';
        const matchTime = new Date(match.dateTime).getTime();
        const currentTime = Date.now();
        if (currentTime >= matchTime) return 'live';
        return 'upcoming';
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'live': return 'MATCH STARTED';
            case 'upcoming': return 'UPCOMING';
            case 'completed': return 'COMPLETED';
            default: return status;
        }
    };

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black">
            <Navbar />

            <main className="pt-20 h-[calc(100vh)] flex flex-col md:flex-row overflow-hidden">
                {/* LEFT SIDEBAR: Match List & Controls */}
                <aside className="w-full md:w-[400px] border-r border-zinc-800/50 flex flex-col bg-zinc-950/20 backdrop-blur-xl">
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-teko font-bold text-white uppercase tracking-tighter">
                                Match <span className="text-yellow-500">Center</span>
                            </h1>
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-10 h-10 rounded-xl bg-yellow-500 text-black flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search maps..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-600 uppercase font-teko tracking-widest"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={selectedSeasonId || 'all'}
                                    onChange={(e) => handleSeasonChange(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs font-teko tracking-widest outline-none focus:border-yellow-500 appearance-none cursor-pointer uppercase"
                                >
                                    <option value="all">ALL SEASONS</option>
                                    {seasons.map((s: Season) => (
                                        <option key={s._id} value={s._id}>{s.title}</option>
                                    ))}
                                </select>
                                <select
                                    value={activeTab}
                                    onChange={(e) => setActiveTab(e.target.value as any)}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs font-teko tracking-widest outline-none focus:border-yellow-500 appearance-none cursor-pointer uppercase"
                                >
                                    {['all', 'live', 'upcoming', 'completed'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-3 hide-scrollbar">
                        {loading && matches.length === 0 ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-800/30" />
                            ))
                        ) : filteredMatches.map((match) => (
                            <motion.div
                                key={match._id}
                                layoutId={match._id}
                                onClick={() => setSelectedMatchId(match._id)}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group",
                                    selectedMatchId === match._id
                                        ? "bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                                        : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={cn(
                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                        getDisplayStatus(match) === 'live' ? "bg-red-500 text-white animate-pulse" :
                                            getDisplayStatus(match) === 'completed' ? "bg-green-500/20 text-green-500" :
                                                "bg-zinc-800 text-zinc-500"
                                    )}>
                                        {getStatusLabel(getDisplayStatus(match))}
                                    </div>
                                    <span className="text-zinc-600 font-teko text-lg group-hover:text-yellow-500/50 transition-colors">#{match.matchNumber}</span>
                                </div>
                                <h3 className="font-teko text-xl font-bold uppercase tracking-tight text-white group-hover:text-yellow-500 transition-colors">
                                    {match.mapName}
                                </h3>
                                <div className="flex items-center gap-3 text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(match.dateTime).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(match.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {selectedMatchId === match._id && (
                                    <motion.div layoutId="active-indicator" className="absolute left-0 top-0 w-1 h-full bg-yellow-500" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </aside>

                {/* RIGHT CONTENT: Match Intelligence & Action Center */}
                <section className="flex-1 overflow-y-auto bg-black p-8 md:p-12 relative">
                    <AnimatePresence mode="wait">
                        {selectedMatch ? (
                            <motion.div
                                key={selectedMatch._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto space-y-12"
                            >
                                {/* Match Hero */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-800/50 pb-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="px-4 py-1.5 rounded-full bg-yellow-500 text-black text-xs font-black uppercase tracking-[0.2em]">MATCH {selectedMatch.matchNumber}</span>
                                            <span className="text-zinc-500 font-teko text-2xl uppercase tracking-widest">{selectedMatch.gameName}</span>
                                        </div>
                                        <h2 className="text-5xl md:text-6xl font-teko font-bold text-white uppercase leading-none tracking-tighter">
                                            {selectedMatch.mapName} <span className="text-yellow-500">IntelliGate</span>
                                        </h2>
                                        <div className="flex gap-6 text-zinc-400 font-teko text-xl tracking-widest uppercase">
                                            <span className="flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-yellow-500" /> {selectedMatch.seasonId?.title}</span>
                                            <span className="flex items-center gap-2 text-zinc-600">|</span>
                                            <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> {selectedMatch.results?.length || 0} DEPLOYED SQUADS</span>
                                        </div>
                                    </div>

                                    {user?.role === 'admin' && (
                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={handleOpenEditRoom}
                                                className="border-zinc-500/20 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-xl h-12 font-bold px-6"
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" /> EDIT ROOM
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleOpenTeamSelect}
                                                className="border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl h-12 font-bold px-6"
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> ADD TEAMS
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => navigate(`/admin/leaderboard/update?seasonId=${selectedMatch.seasonId._id}&matchId=${selectedMatch._id}`)}
                                                className={cn(
                                                    "border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded-xl h-12 font-bold px-6",
                                                    selectedMatch.status === 'completed' && "opacity-50 cursor-not-allowed pointer-events-none grayscale"
                                                )}
                                                disabled={selectedMatch.status === 'completed'}
                                            >
                                                {selectedMatch.status === 'completed' ? 'SCORE FROZEN' : 'UPDATE SCORE'}
                                            </Button>
                                            {selectedMatch.status === 'live' && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowFinishConfirm(true)}
                                                    className="border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-12 font-bold px-6"
                                                >
                                                    END MATCH
                                                </Button>
                                            )}
                                            <Button
                                                variant="neon"
                                                onClick={() => navigate(`/leaderboard?seasonId=${selectedMatch.seasonId._id}&matchId=${selectedMatch._id}`)}
                                                className="h-12 rounded-xl px-8"
                                            >
                                                MATCH LEADERBOARD
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(`/overlay/${selectedMatch.seasonId._id}?matchId=${selectedMatch._id}`, '_blank')}
                                                className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded-xl h-12 font-bold px-6 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                                            >
                                                <Zap className="w-4 h-4 mr-2 fill-yellow-500 group-hover:fill-black" /> OVERLAY
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Tactical Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 space-y-4">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Operation Status</p>
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-4 h-4 rounded-full animate-pulse",
                                                getDisplayStatus(selectedMatch) === 'live' ? "bg-red-500" : getDisplayStatus(selectedMatch) === 'completed' ? "bg-green-500" : "bg-zinc-500"
                                            )} />
                                            <span className="text-3xl font-teko font-bold text-white uppercase tracking-wider">{getStatusLabel(getDisplayStatus(selectedMatch))}</span>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 space-y-4">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Schedule Intel</p>
                                        <div className="space-y-1">
                                            <span className="block text-2xl font-teko font-bold text-white uppercase tracking-wider">
                                                {new Date(selectedMatch.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="text-zinc-500 font-teko text-lg tracking-[0.2em]">{new Date(selectedMatch.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 space-y-4">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Room Deployment</p>
                                        <div className="flex gap-4">
                                            <div>
                                                <span className="block text-[8px] font-black text-zinc-600 uppercase">ID</span>
                                                <span className="text-xl font-bold text-yellow-500 font-mono tracking-tighter">{selectedMatch.roomId || "---"}</span>
                                            </div>
                                            <div className="border-l border-zinc-800 pl-4">
                                                <span className="block text-[8px] font-black text-zinc-600 uppercase">PASS</span>
                                                <span className="text-xl font-bold text-zinc-300 font-mono tracking-tighter">{selectedMatch.password || "---"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results View or Placeholder */}
                                <div className="bg-zinc-900/20 border border-zinc-800/30 rounded-[2.5rem] p-10 overflow-hidden relative">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-4xl font-teko font-bold text-white uppercase tracking-tighter">Current <span className="text-yellow-500">Roster</span></h4>
                                        {selectedMatch.status === 'live' && (
                                            <Button
                                                variant="outline"
                                                className="border-red-500/20 text-red-500 hover:bg-red-500 rounded-xl"
                                                onClick={() => selectedMatch.streamUrl && window.open(selectedMatch.streamUrl, '_blank')}
                                            >
                                                <PlayCircle className="w-4 h-4 mr-2" /> LIVE STREAM
                                            </Button>
                                        )}
                                    </div>

                                    {selectedMatch.results && selectedMatch.results.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {selectedMatch.results.map((res: any, i: number) => (
                                                <TeamCard
                                                    key={res._id || i}
                                                    team={res.teamId || {}}
                                                    points={res.totalPoints}
                                                    rank={res.rank}
                                                    showPlayers={true}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 space-y-4">
                                            <Gamepad2 className="w-16 h-16 text-zinc-800 mx-auto opacity-20" />
                                            <h5 className="text-xl font-teko text-zinc-500 uppercase tracking-widest">No squads assigned to this operation</h5>
                                            {user?.role === 'admin' && (
                                                <Button variant="secondary" onClick={handleOpenTeamSelect} className="rounded-xl">POPULATE ROSTER</Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="text-center space-y-4">
                                    <h3 className="text-5xl font-teko font-bold text-zinc-800 uppercase tracking-tighter">Select an operation to decrypt intel</h3>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </section>
            </main>

            {/* FINISH CONFIRMATION MODAL */}
            <AnimatePresence>
                {showFinishConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !finishing && setShowFinishConfirm(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                            <h3 className="text-3xl font-teko font-bold text-white uppercase mb-4 tracking-wider">Terminate Match?</h3>
                            <p className="text-zinc-400 font-medium mb-8 leading-relaxed">
                                This will snapshot the current leaderboard into Match Stats and permanently close this operation.
                                <span className="block mt-2 text-red-500 font-bold uppercase text-xs tracking-widest">Action cannot be undone.</span>
                            </p>
                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" disabled={finishing} onClick={() => setShowFinishConfirm(false)}>ABORT</Button>
                                <Button variant="secondary" className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-bold border-none" disabled={finishing} onClick={handleFinishMatch}>
                                    {finishing ? "TERMINATING..." : "CONFIRM END"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TEAM SELECTION MODAL */}
            <AnimatePresence>
                {showTeamSelectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTeamSelectModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 max-h-[85vh] flex flex-col shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-4xl font-teko font-bold text-white uppercase tracking-wider">Assign <span className="text-yellow-500">Operation Squads</span></h2>
                                    <p className="text-zinc-500 font-teko text-lg uppercase tracking-widest">Verified Tactical Units Available</p>
                                </div>
                                <button onClick={() => setShowTeamSelectModal(false)} className="w-12 h-12 flex items-center justify-center hover:bg-zinc-800 rounded-2xl text-zinc-500 transition-colors border border-zinc-800">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                                {verifiedTeams.map((team) => (
                                    <TeamCard
                                        key={team._id}
                                        team={team}
                                        isSelected={selectedTeamIds.includes(team._id)}
                                        onClick={() => {
                                            setSelectedTeamIds(prev =>
                                                prev.includes(team._id) ? prev.filter(id => id !== team._id) : [...prev, team._id]
                                            );
                                        }}
                                        className="p-4"
                                    />
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-zinc-800/50 flex gap-4">
                                <Button variant="outline" onClick={() => setShowTeamSelectModal(false)} className="flex-1 rounded-2xl py-4 h-auto font-bold uppercase tracking-widest text-zinc-500">CANCEL</Button>
                                <Button variant="neon" onClick={handleAddTeamsToMatch} className="flex-1 rounded-2xl py-4 h-auto text-lg">DEPLOY {selectedTeamIds.length} SQUADS</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CREATE MATCH MODAL */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl maxHeight-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-4xl font-teko font-bold text-white uppercase tracking-wider">New <span className="text-yellow-500">Operation</span></h2>
                                <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 flex items-center justify-center hover:bg-zinc-800 rounded-2xl text-zinc-500 transition-colors border border-zinc-800"><X className="w-6 h-6" /></button>
                            </div>

                            <form onSubmit={handleCreateMatch} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Target Season</label>
                                        <select required value={newMatch.seasonId} onChange={(e) => setNewMatch({ ...newMatch, seasonId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-teko text-2xl focus:border-yellow-500 outline-none appearance-none">
                                            <option value="">SELECT SEASON</option>
                                            {seasons.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Match Number</label>
                                        <input type="number" required value={newMatch.matchNumber} onChange={(e) => setNewMatch({ ...newMatch, matchNumber: Number(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-teko text-2xl focus:border-yellow-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Game Name</label>
                                        <input type="text" required value={newMatch.gameName} onChange={(e) => setNewMatch({ ...newMatch, gameName: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-teko text-2xl focus:border-yellow-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Map Name</label>
                                        <select required value={newMatch.mapName} onChange={(e) => setNewMatch({ ...newMatch, mapName: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-teko text-2xl focus:border-yellow-500 outline-none appearance-none">
                                            <option value="ERANGEL">ERANGEL</option>
                                            <option value="MIRAMAR">MIRAMAR</option>
                                            <option value="SANHOK">SANHOK</option>
                                            <option value="VIKENDI">VIKENDI</option>
                                            <option value="LIVIK">LIVIK</option>
                                            <option value="KARAKIN">KARAKIN</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Room ID</label>
                                        <input type="text" value={newMatch.roomId} onChange={(e) => setNewMatch({ ...newMatch, roomId: e.target.value })} placeholder="UNASSIGNED" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-teko text-2xl focus:border-yellow-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Room Password</label>
                                        <input type="text" value={newMatch.password} onChange={(e) => setNewMatch({ ...newMatch, password: e.target.value })} placeholder="PRIVATE" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-teko text-2xl focus:border-yellow-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Max Players</label>
                                        <input type="number" value={newMatch.maxPlayers} onChange={(e) => setNewMatch({ ...newMatch, maxPlayers: Number(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-teko text-2xl focus:border-yellow-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Schedule Date/Time</label>
                                        <input type="datetime-local" required value={newMatch.dateTime} onChange={(e) => setNewMatch({ ...newMatch, dateTime: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-zinc-300 font-teko text-2xl focus:border-yellow-500 outline-none" />
                                    </div>
                                </div>

                                <div className="mt-12 pt-10 border-t border-zinc-800/50">
                                    <Button variant="neon" type="submit" className="w-full py-6 rounded-2xl text-2xl tracking-[0.2em] h-auto shadow-[0_10px_40px_rgba(234,179,8,0.2)]">
                                        DECODE & DEPLOY OPERATION
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* EDIT ROOM MODAL */}
            <AnimatePresence>
                {showEditRoomModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditRoomModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-teko font-bold text-white uppercase tracking-wider">Edit <span className="text-yellow-500">Room Intel</span></h2>
                                <button onClick={() => setShowEditRoomModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors border border-zinc-800"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleUpdateRoom} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Room ID</label>
                                    <input type="text" value={roomDetails.roomId} onChange={(e) => setRoomDetails({ ...roomDetails, roomId: e.target.value })} placeholder="UNASSIGNED" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-teko text-2xl focus:border-yellow-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Room Password</label>
                                    <input type="text" value={roomDetails.password} onChange={(e) => setRoomDetails({ ...roomDetails, password: e.target.value })} placeholder="PRIVATE" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white font-teko text-2xl focus:border-yellow-500 outline-none" />
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-800/50 flex gap-4">
                                    <Button variant="outline" type="button" onClick={() => setShowEditRoomModal(false)} className="flex-1 py-4 h-auto font-bold rounded-xl text-zinc-500">CANCEL</Button>
                                    <Button variant="neon" type="submit" className="flex-1 py-4 h-auto text-xl rounded-xl">SAVE</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
