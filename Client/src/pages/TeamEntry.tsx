import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Users, User, Phone, Mail, Trophy, FileText, Upload, CheckCircle2, AlertCircle, Loader2, Calendar } from "lucide-react";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { useTeams } from "@/hooks/useTeams";
import axios from "axios";

interface TeamEntryForm {
    teamName: string;
    leaderName: string;
    leaderId: string;
    email: string;
    phone: string;
    player2: string;
    player2Id: string;
    player3: string;
    player3Id: string;
    player4: string;
    player4Id: string;
    substitute?: string;
    substituteId?: string;
    documentUrl?: string;
}

export default function TeamEntry() {
    const [searchParams] = useSearchParams();
    const seasonIdFromUrl = searchParams.get("seasonId");

    const { addTeam, currentSeasonId } = useLeaderboard();
    const { registerTeam, loading, error: apiError } = useTeams();
    const navigate = useNavigate();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [activeSeasons, setActiveSeasons] = useState<any[]>([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>(seasonIdFromUrl || currentSeasonId || "");
    const [selectedSeasonName, setSelectedSeasonName] = useState<string>("");
    const { register, handleSubmit, reset, formState: { errors } } = useForm<TeamEntryForm>();

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/seasons`);
                const active = response.data.filter((s: any) => s.status === 'active');
                setActiveSeasons(active);

                const targetId = seasonIdFromUrl || currentSeasonId;
                if (targetId) {
                    const current = response.data.find((s: any) => s._id === targetId);
                    if (current) {
                        setSelectedSeasonName(current.title);
                        setSelectedSeasonId(current._id);
                    }
                } else if (active.length === 1) {
                    setSelectedSeasonId(active[0]._id);
                    setSelectedSeasonName(active[0].title);
                }
            } catch (error) {
                console.error("Error fetching seasons:", error);
            }
        };
        fetchSeasons();
    }, [seasonIdFromUrl]);

    const onSubmit = async (data: TeamEntryForm) => {
        try {
            if (!selectedSeasonId) {
                throw new Error("Please select a tournament season");
            }

            const submissionData = {
                ...data,
                seasonId: selectedSeasonId
            };

            const response = await registerTeam(submissionData);
            if (response && response.team) {
                addTeam(response.team);
                setIsSubmitted(true);
                reset();
            } else {
                // If it reaches here without throwing, but no team returned,
                // it's likely a logic error or non-standard response.
                console.error("No team returned from registration response");
            }
        } catch (err) {
            console.error("Registration failed:", err);
            // Error is already captured by useTeams and displayed via apiError
        }
    };

    const handleRegisterAnother = () => {
        setIsSubmitted(false);
    };

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="section-container max-w-4xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <h1 className="text-5xl md:text-7xl font-teko font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 mb-4 tracking-tighter drop-shadow-2xl uppercase">
                                Team <span className="text-yellow-500">Entry</span>
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                                Secure your spot in the championship. Fill in your squad details to participate.
                            </p>
                            {selectedSeasonName && (
                                <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full border border-yellow-500/20 text-xs font-black uppercase tracking-widest">
                                    <Calendar className="w-4 h-4" />
                                    Season: {selectedSeasonName}
                                </div>
                            )}
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-zinc-900/30 border border-zinc-800 p-8 md:p-12 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-yellow-500 to-transparent opacity-30" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-teko text-yellow-500 border-l-4 border-yellow-500 pl-4 mb-4 uppercase">Tournament & Squad</h3>

                                        {!seasonIdFromUrl && activeSeasons.length > 1 && (
                                            <div>
                                                <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-yellow-500" /> Select Season *
                                                </label>
                                                <select
                                                    value={selectedSeasonId}
                                                    onChange={(e) => {
                                                        setSelectedSeasonId(e.target.value);
                                                        const s = activeSeasons.find(x => x._id === e.target.value);
                                                        if (s) setSelectedSeasonName(s.title);
                                                    }}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="" disabled>Select an active season</option>
                                                    {activeSeasons.map(s => (
                                                        <option key={s._id} value={s._id} className="bg-zinc-900">{s.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                <Trophy className="w-4 h-4 text-yellow-500" /> Team Name *
                                            </label>
                                            <input
                                                {...register("teamName", { required: "Team name is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                                placeholder="Enter Team Name"
                                            />
                                            {errors.teamName && <p className="text-red-500 text-xs mt-1">{errors.teamName.message}</p>}
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                <User className="w-4 h-4 text-yellow-500" /> Team Leader *
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    {...register("leaderName", { required: "Leader name is required" })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                                    placeholder="Leader IGN"
                                                />
                                                <input
                                                    {...register("leaderId", { required: "Leader ID is required" })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700 font-mono"
                                                    placeholder="BGMI ID"
                                                />
                                            </div>
                                            {(errors.leaderName || errors.leaderId) && <p className="text-red-500 text-xs mt-1">Leader name and ID are required</p>}
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-yellow-500" /> Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                {...register("email", { required: "Email is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                                placeholder="contact@squad.com"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-yellow-500" /> WhatsApp Number *
                                            </label>
                                            <input
                                                {...register("phone", { required: "Phone number is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                                placeholder="+91-XXXXX-XXXXX"
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-teko text-yellow-500 border-l-4 border-yellow-500 pl-4 mb-4 uppercase">Roster Details</h3>
                                        <div>
                                            <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                <Users className="w-4 h-4 text-yellow-500" /> Player 2 Detail *
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    {...register("player2", { required: "Player 2 is required" })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                                    placeholder="Player 2 IGN"
                                                />
                                                <input
                                                    {...register("player2Id", { required: "Player 2 ID is required" })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700 font-mono"
                                                    placeholder="BGMI ID"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                <Users className="w-4 h-4 text-yellow-500" /> Player 3 Detail *
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    {...register("player3", { required: "Player 3 is required" })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                                    placeholder="Player 3 IGN"
                                                />
                                                <input
                                                    {...register("player3Id", { required: "Player 3 ID is required" })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700 font-mono"
                                                    placeholder="BGMI ID"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                <Users className="w-4 h-4 text-yellow-500" /> Player 4 Detail *
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    {...register("player4", { required: "Player 4 is required" })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                                    placeholder="Player 4 IGN"
                                                />
                                                <input
                                                    {...register("player4Id", { required: "Player 4 ID is required" })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700 font-mono"
                                                    placeholder="BGMI ID"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-zinc-300/50 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                <Users className="w-4 h-4 text-zinc-600" /> Substitute (Optional)
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    {...register("substitute")}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                                    placeholder="Substitute IGN"
                                                />
                                                <input
                                                    {...register("substituteId")}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700 font-mono"
                                                    placeholder="BGMI ID"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-800/50">
                                            <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-yellow-500" /> Verification Drive Link *
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    {...register("documentUrl", { required: "Verification link is required" })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 pl-10 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                                    placeholder="Paste Google Drive URL here"
                                                />
                                                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-yellow-500 transition-colors" />
                                            </div>
                                            {errors.documentUrl && <p className="text-red-500 text-xs mt-1">{errors.documentUrl.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-zinc-800 space-y-4">
                                    {apiError && (
                                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex flex-col gap-2 text-sm animate-shake">
                                            <div className="flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                <span className="font-bold uppercase tracking-widest">CRITICAL ERROR</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-red-400">{apiError?.split('\n')[0]}</p>
                                                {apiError.includes('\n') && (
                                                    <pre className="text-[10px] bg-black/40 p-2 rounded-sm overflow-x-auto max-h-32 font-mono opacity-70">
                                                        {apiError}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <Button size="xl" variant="neon" type="submit" disabled={loading} className="w-full group relative overflow-hidden">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                PROCESSING...
                                            </>
                                        ) : (
                                            <>
                                                REGISTER SQUAD
                                                <Trophy className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-zinc-500 text-xs mt-4 uppercase tracking-[0.2em]">
                                        By registering, you agree to the tournament rules and fair play policy.
                                    </p>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-zinc-900/40 border border-yellow-500/30 p-12 rounded-2xl backdrop-blur-md text-center space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/10 rounded-full border border-yellow-500/20 mb-4">
                                    <CheckCircle2 className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-teko text-white uppercase tracking-tight">Registration <span className="text-yellow-500">Successful!</span></h2>
                                    <p className="text-zinc-400 max-w-md mx-auto">
                                        Your squad has been registered. Our admins will verify your details shortly.
                                    </p>
                                </div>
                                <div className="pt-4 flex flex-col md:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={handleRegisterAnother}
                                        variant="neon"
                                        size="lg"
                                        className="px-8"
                                    >
                                        REGISTER ANOTHER TEAM
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/admin/teams')}
                                        variant="outline"
                                        size="lg"
                                        className="px-8"
                                    >
                                        VIEW ALL TEAMS
                                    </Button>
                                </div>
                            </div>
                        )}
                    </ScrollReveal>
                </div>
            </main>
            <Footer />
        </div>
    );
}
