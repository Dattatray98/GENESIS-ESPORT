import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthApi } from '@/hooks/useAuthApi';

export default function Login() {
    const { login, loading, error } = useAuthApi();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            const user = await login(data);
            if (user.role === 'registration_admin') {
                navigate('/admin');
            } else {
                navigate('/admin/leaderboard/update');
            }
        } catch (err) {
            // Error is handled by the hook and displayed via the 'error' state
        }
    };

    return (
        <div className="bg-black min-h-screen text-gray-100 font-rajdhani">
            <Navbar />

            <main className="pt-32 pb-16 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <ScrollReveal>
                        <div className="text-center mb-10">
                            <h1 className="text-5xl font-teko font-black text-transparent bg-clip-text bg-linear-to-b from-white to-gray-500 mb-2 uppercase tracking-tighter">
                                Admin <span className="text-yellow-500">Login</span>
                            </h1>
                            <p className="text-zinc-400 uppercase tracking-widest text-sm">
                                Access the command center
                            </p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                            {/* Decorative accent */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-yellow-500 to-transparent opacity-30" />

                            {error && (
                                <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex items-center gap-3 text-sm animate-shake">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-yellow-500" /> Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            {...register("email", { required: "Email is required" })}
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                            placeholder="admin@bgmi.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-[10px] mt-1 uppercase font-bold tracking-wider">{errors.email.message as string}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Lock className="w-3 h-3 text-yellow-500" /> Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            {...register("password", { required: "Password is required" })}
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-700"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {errors.password && <p className="text-red-500 text-[10px] mt-1 uppercase font-bold tracking-wider">{errors.password.message as string}</p>}
                                </div>

                                <Button size="xl" variant="neon" type="submit" disabled={loading} className="w-full group">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            AUTHENTICATE
                                            <LogIn className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-4">
                                    Authorized access only
                                </p>
                                <div className="flex justify-center gap-4">
                                    <Link to="/" className="text-zinc-400 hover:text-white text-xs transition-colors flex items-center gap-1">
                                        BACK TO HOME
                                    </Link>
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
