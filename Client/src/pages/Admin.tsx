import { useState, useEffect } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
    ShieldAlert,
    Archive,
    Plus,
    Trophy,
    Users,
    LayoutDashboard,
    Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useSeasons, type Season } from "@/hooks/useSeasons";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { fetchSeasons, loading } = useSeasons();
    const [seasons, setSeasons] = useState<Season[]>([]);

    useEffect(() => {
        const loadSeasons = async () => {
            try {
                const data = await fetchSeasons();
                if (data) {
                    // Sort seasons: active first, then by startDate desc
                    const sorted = [...data].sort((a, b) => {
                        if (a.status === 'active' && b.status !== 'active') return -1;
                        if (a.status !== 'active' && b.status === 'active') return 1;
                        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                    });
                    setSeasons(sorted);
                }
            } catch (error) {
                console.error("Error fetching seasons:", error);
            }
        };
        loadSeasons();
    }, [fetchSeasons]);


    const activeSeasons = seasons.filter(s => s.status === 'active');
    const archivedSeasons = seasons.filter(s => s.status === 'Completed');

    if (loading) {
        return (
            <div className="bg-black min-h-screen text-gray-100 font-rajdhani">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-4 border-yellow-500/10 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-yellow-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ShieldAlert className="w-8 h-8 text-yellow-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-2 text-center">
                        <h2 className="text-2xl font-teko font-bold uppercase tracking-[0.3em] text-white">Accessing Secure Records</h2>
                        <div className="flex justify-center gap-1">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani selection:bg-yellow-500 selection:text-black relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />

            <Navbar />

            <main className="pt-24 pb-16 relative z-10">
                <div className="section-container max-w-6xl mx-auto px-4">
                    <ScrollReveal>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                    <LayoutDashboard className="w-3.5 h-3.5 text-yellow-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">Operation Overview</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-teko font-black text-white uppercase tracking-tighter leading-none m-0">
                                    Command <span className="text-transparent bg-clip-text bg-linear-to-b from-yellow-400 to-yellow-600">Center</span>
                                </h1>
                                <p className="text-zinc-500 uppercase font-bold tracking-widest text-sm border-l-2 border-zinc-800 pl-4">
                                    Strategic Management of <span className="text-white">Tournament Lifecycles</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden lg:flex gap-8 px-8 py-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-md">
                                    <div className="text-center">
                                        <div className="text-2xl font-teko font-bold text-white leading-none">{seasons.length}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Total</div>
                                    </div>
                                    <div className="w-px h-8 bg-zinc-800" />
                                    <div className="text-center">
                                        <div className="text-2xl font-teko font-bold text-green-500 leading-none">{activeSeasons.length}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Active</div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => navigate('/admin/seasons/createseason')}
                                    variant="neon"
                                    size="lg"
                                    className="h-16 px-8 font-black tracking-widest text-sm shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                                >
                                    <Plus className="w-5 h-5 mr-3" />
                                    NEW SEASON
                                </Button>
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="space-y-20">
                        {/* Active Seasons Section */}
                        <section>
                            <ScrollReveal>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-px bg-linear-to-r from-yellow-500 to-transparent" />
                                    <h2 className="text-3xl font-teko text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                        Active <span className="text-yellow-500">Deployments</span>
                                    </h2>
                                </div>
                            </ScrollReveal>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {activeSeasons.map((season, index) => (
                                    <ScrollReveal key={season._id} delay={index * 0.1}>
                                        <div
                                            onClick={() => navigate(`/admin/seasons/${season._id}`)}
                                            className="group relative h-full bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 transition-all duration-500 cursor-pointer hover:border-yellow-500/50 hover:bg-zinc-900/60 hover:-translate-y-2 overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-[5rem] -mr-8 -mt-8 transition-colors group-hover:bg-yellow-500/10" />

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-8">
                                                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:border-yellow-500/30 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] transition-all">
                                                        <Trophy className="w-7 h-7 text-yellow-500" />
                                                    </div>
                                                    <div className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        Live Operation
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-8">
                                                    <h3 className="text-3xl font-teko font-bold text-white uppercase tracking-wider group-hover:text-yellow-500 transition-colors leading-none">
                                                        {season.title}
                                                    </h3>
                                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                                                        {season.subtitle}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-4">
                                                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                                            <Users className="w-3 h-3" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Squads</span>
                                                        </div>
                                                        <div className="text-xl font-teko font-bold text-white leading-none">{season.finalTeamCount}</div>
                                                    </div>
                                                    <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-4">
                                                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Start</span>
                                                        </div>
                                                        <div className="text-xl font-teko font-bold text-white leading-none">
                                                            {new Date(season.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Prize Allocation</span>
                                                        <span className="text-sm font-bold text-yellow-500 uppercase">{season.prizePool}</span>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                                                        <Plus className="w-5 h-5 rotate-45 transform group-hover:rotate-0" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                ))}

                                <ScrollReveal delay={activeSeasons.length * 0.1}>
                                    <div
                                        onClick={() => navigate('/admin/seasons/createseason')}
                                        className="h-full min-h-[300px] bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all cursor-pointer group"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:border-yellow-500/50 transition-all">
                                            <Plus className="w-10 h-10 text-zinc-600 group-hover:text-yellow-500" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-lg font-teko font-bold text-zinc-500 uppercase tracking-widest group-hover:text-white">Initialize New Season</p>
                                            <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.2em]">Ready for Next Deployment</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>

                            {activeSeasons.length === 0 && (
                                <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[3rem] backdrop-blur-sm">
                                    <ShieldAlert className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                                    <h3 className="text-3xl font-teko text-zinc-600 uppercase tracking-[0.3em]">No Active Deployments Found</h3>
                                    <p className="text-zinc-700 text-xs uppercase font-bold mt-2 tracking-widest">Awaiting Command to start a new operation</p>
                                </div>
                            )}
                        </section>

                        {/* Archived Seasons Section */}
                        {archivedSeasons.length > 0 && (
                            <section className="pt-20 border-t border-zinc-900/50">
                                <ScrollReveal>
                                    <div className="flex items-center gap-4 mb-10">
                                        <Archive className="w-6 h-6 text-zinc-600" />
                                        <h2 className="text-3xl font-teko text-zinc-500 uppercase tracking-[0.2em]">Archived <span className="text-zinc-700">Records</span></h2>
                                    </div>
                                </ScrollReveal>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {archivedSeasons.map((season, index) => (
                                        <ScrollReveal key={season._id} delay={index * 0.1}>
                                            <div
                                                className="bg-zinc-900/20 border border-zinc-800/80 rounded-[2.5rem] p-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:border-zinc-700 transition-all duration-500 group"
                                            >
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                                        <Archive className="w-6 h-6 text-zinc-500" />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
                                                        ARCHIVED
                                                    </span>
                                                </div>

                                                <div className="space-y-1 mb-6">
                                                    <h3 className="text-2xl font-teko font-bold text-white uppercase tracking-wider">{season.title}</h3>
                                                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">{season.subtitle}</p>
                                                </div>

                                                <div className="flex items-center gap-6 pt-6 border-t border-zinc-800/50">
                                                    <div className="text-center flex-1">
                                                        <div className="text-base font-teko text-zinc-400 font-bold uppercase">{season.gameName}</div>
                                                        <div className="text-[8px] text-zinc-700 uppercase font-black tracking-[0.2em] mt-0.5">Arena</div>
                                                    </div>
                                                    <div className="w-px h-6 bg-zinc-800" />
                                                    <div className="text-center flex-1">
                                                        <div className="text-base font-teko text-zinc-400 font-bold uppercase">
                                                            {new Date(season.startDate).getFullYear()}
                                                        </div>
                                                        <div className="text-[8px] text-zinc-700 uppercase font-black tracking-[0.2em] mt-0.5">Timeline</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Security Protocol Footer */}
                    <ScrollReveal delay={0.4}>
                        <div className="mt-24 bg-zinc-900/20 border border-zinc-800 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
                                <div className="p-5 rounded-4xl bg-zinc-950 border border-zinc-800 shadow-2xl">
                                    <ShieldAlert className="w-10 h-10 text-yellow-500" />
                                </div>
                                <div className="flex-1 space-y-6">
                                    <h2 className="text-4xl font-teko text-white uppercase tracking-widest">Security <span className="text-yellow-500">Protocol</span></h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                                Archival Process
                                            </h4>
                                            <p className="text-zinc-500 text-sm leading-relaxed">
                                                Finalizing an operation will automatically transition the combat records to the Hall of Fame. This action resets all field data for the next iteration.
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                                Data Integrity
                                            </h4>
                                            <p className="text-zinc-500 text-sm leading-relaxed">
                                                All archived logs are cryptographically secured and immutable. Verify all match outcomes before committing to terminal state.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </main>

            <Footer />
        </div>
    );
}
