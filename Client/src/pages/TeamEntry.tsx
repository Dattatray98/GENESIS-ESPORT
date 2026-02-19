import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Users, User, Phone, Mail, Trophy, FileText, Upload } from "lucide-react";
import { useLeaderboard } from "@/context/LeaderboardContext";

interface TeamEntryForm {
    teamName: string;
    leaderName: string;
    email: string;
    phone: string;
    player2: string;
    player3: string;
    player4: string;
    substitute?: string;
    documentUrl?: string;
}

export default function TeamEntry() {
    const { addTeam } = useLeaderboard();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<TeamEntryForm>();

    const onSubmit = (data: TeamEntryForm) => {
        addTeam(data);
        // Navigate to teams page so they can see their pending registration
        navigate("/teams");
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
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-zinc-900/30 border border-zinc-800 p-8 md:p-12 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                            {/* Decorative line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-yellow-500 to-transparent opacity-30" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Team Info Section */}
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-teko text-yellow-500 border-l-4 border-yellow-500 pl-4 mb-4 uppercase">Squad Info</h3>

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
                                        <input
                                            {...register("leaderName", { required: "Leader name is required" })}
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                            placeholder="In-Game Name (IGN)"
                                        />
                                        {errors.leaderName && <p className="text-red-500 text-xs mt-1">{errors.leaderName.message}</p>}
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

                                {/* Players Section */}
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-teko text-yellow-500 border-l-4 border-yellow-500 pl-4 mb-4 uppercase">Roster Details</h3>

                                    <div>
                                        <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-4 h-4 text-yellow-500" /> Player 2 IGN *
                                        </label>
                                        <input
                                            {...register("player2", { required: "Player 2 is required" })}
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                            placeholder="IGN"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-4 h-4 text-yellow-500" /> Player 3 IGN *
                                        </label>
                                        <input
                                            {...register("player3", { required: "Player 3 is required" })}
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                            placeholder="IGN"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-4 h-4 text-yellow-500" /> Player 4 IGN *
                                        </label>
                                        <input
                                            {...register("player4", { required: "Player 4 is required" })}
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                            placeholder="IGN"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-zinc-300/50 mb-2 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-4 h-4 text-zinc-600" /> Substitute (Optional)
                                        </label>
                                        <input
                                            {...register("substitute")}
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                            placeholder="IGN"
                                        />
                                    </div>

                                    {/* Document Upload Section */}
                                    <div className="pt-4 border-t border-zinc-800/50">
                                        <label className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-yellow-500" /> Verification Document (ID/Aadhar) *
                                        </label>
                                        <div className="relative group/upload">
                                            <input
                                                type="text"
                                                {...register("documentUrl", { required: "Document identification is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                                placeholder="Enter ID Image URL (e.g. Imgur/Drive link)"
                                            />
                                            <div className="mt-2 text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                                <Upload className="w-3 h-3" /> Note: Please provide a direct link to an image of your ID.
                                            </div>
                                        </div>
                                        {errors.documentUrl && <p className="text-red-500 text-xs mt-1">{errors.documentUrl.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-800">
                                <Button size="xl" variant="neon" type="submit" className="w-full group">
                                    REGISTER SQUAD
                                    <Trophy className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                                </Button>
                                <p className="text-center text-zinc-500 text-xs mt-4 uppercase tracking-[0.2em]">
                                    By registering, you agree to the tournament rules and fair play policy.
                                </p>
                            </div>
                        </form>
                    </ScrollReveal>
                </div>
            </main>

            <Footer />
        </div>
    );
}
