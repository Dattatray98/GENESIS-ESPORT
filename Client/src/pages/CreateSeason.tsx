import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Calendar, Trophy, Gamepad2, Users, FileText, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

interface SeasonForm {
    title: string;
    subtitle: string;
    startDate: string;
    endDate: string;
    prizePool: string;
    gameName: string;
    finalTeamCount: number;
    status: 'active' | 'Completed';
}

export default function CreateSeason() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<SeasonForm>({
        defaultValues: {
            status: 'active'
        }
    });

    const onSubmit = async (data: SeasonForm) => {
        setLoading(true);
        try {
            const apiUrl = `${import.meta.env.VITE_API_URL}/seasons`;
            console.log("Deploying season to:", apiUrl);

            const response = await axios.post(apiUrl, data, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            if (response.status === 201 || response.status === 200) {
                setIsSuccess(true);
                setTimeout(() => navigate('/admin/seasons'), 2000);
            }
        } catch (error: any) {
            console.error("Error creating season:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="section-container max-w-3xl mx-auto">
                    <ScrollReveal>
                        <button
                            onClick={() => navigate('/admin/seasons')}
                            className="flex items-center gap-2 text-zinc-500 hover:text-yellow-500 transition-colors mb-8 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Back to Season Management</span>
                        </button>

                        <div className="text-center mb-12">
                            <h1 className="text-5xl md:text-7xl font-teko font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 mb-4 tracking-tighter drop-shadow-2xl uppercase">
                                Initialize <span className="text-yellow-500">Season</span>
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-2xl mx-auto uppercase tracking-wider font-medium">
                                Configure the tactical parameters for the upcoming tournament cycle.
                            </p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <div className="bg-zinc-900/30 border border-zinc-800 p-8 md:p-12 rounded-3xl backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-yellow-500 to-transparent opacity-30" />

                            {isSuccess ? (
                                <div className="text-center py-12 space-y-6">
                                    <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-10 h-10 text-yellow-500" />
                                    </div>
                                    <h2 className="text-3xl font-teko font-bold text-white uppercase tracking-widest">Season Deployed!</h2>
                                    <p className="text-zinc-400 uppercase tracking-widest text-sm">Redirecting to command center...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Row 1 */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Trophy className="w-3 h-3 text-yellow-500" /> Season Title
                                            </label>
                                            <input
                                                {...register("title", { required: "Title is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-800"
                                                placeholder="e.g. Genesis Esports S-1"
                                            />
                                            {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.title.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <FileText className="w-3 h-3 text-yellow-500" /> Season Subtitle
                                            </label>
                                            <input
                                                {...register("subtitle", { required: "Subtitle is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-800"
                                                placeholder="e.g. The Awakening"
                                            />
                                            {errors.subtitle && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.subtitle.message}</p>}
                                        </div>

                                        {/* Row 2 */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-yellow-500" /> Starting Date
                                            </label>
                                            <input
                                                type="date"
                                                {...register("startDate", { required: "Start date is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all"
                                            />
                                            {errors.startDate && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.startDate.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-yellow-500" /> End Date
                                            </label>
                                            <input
                                                type="date"
                                                {...register("endDate", { required: "End date is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all"
                                            />
                                            {errors.endDate && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.endDate.message}</p>}
                                        </div>

                                        {/* Row 3 */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Trophy className="w-3 h-3 text-yellow-500" /> Prize Pool
                                            </label>
                                            <input
                                                {...register("prizePool", { required: "Prize pool is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-800"
                                                placeholder="e.g. ₹50,000"
                                            />
                                            {errors.prizePool && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.prizePool.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Gamepad2 className="w-3 h-3 text-yellow-500" /> Game Name
                                            </label>
                                            <input
                                                {...register("gameName", { required: "Game name is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-800"
                                                placeholder="e.g. Battlegrounds Mobile India"
                                            />
                                            {errors.gameName && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.gameName.message}</p>}
                                        </div>

                                        {/* Row 4 */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Users className="w-3 h-3 text-yellow-500" /> Final Team Count
                                            </label>
                                            <input
                                                type="number"
                                                {...register("finalTeamCount", { required: "Count is required", min: 1 })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-800"
                                                placeholder="e.g. 16"
                                            />
                                            {errors.finalTeamCount && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.finalTeamCount.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <ShieldAlert className="w-3 h-3 text-yellow-500" /> Season Status
                                            </label>
                                            <select
                                                {...register("status", { required: "Status is required" })}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all appearance-none"
                                            >
                                                <option value="active" className="bg-zinc-900">Active</option>
                                                <option value="Completed" className="bg-zinc-900">Completed</option>
                                            </select>
                                            {errors.status && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.status.message}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Button
                                            size="xl"
                                            variant="neon"
                                            type="submit"
                                            disabled={loading}
                                            className="w-full group relative overflow-hidden"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    DEPLOYING...
                                                </>
                                            ) : (
                                                <>
                                                    FINALIZE & DEPLOY SEASON
                                                    <Trophy className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </ScrollReveal>
                </div>
            </main>
            <Footer />
        </div>
    );
}
