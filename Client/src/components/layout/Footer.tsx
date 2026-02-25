import { CONTACT, TOURNAMENT_INFO } from "@/constants/data";
import { Facebook, Twitter, Instagram, Mail, ChevronUp, ShieldCheck, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-16 font-rajdhani">
            <div className="section-container relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-teko text-white font-bold uppercase tracking-wider mb-4">
                            {TOURNAMENT_INFO.navName.split(' ')[0]} <span className="text-yellow-500">{TOURNAMENT_INFO.navName.split(' ').slice(1).join(' ')}</span>
                        </h2>
                        <p className="text-sm opacity-70 max-w-xs mb-6 mx-auto md:mx-0">
                            {TOURNAMENT_INFO.subtitle}. The ultimate battle royale esports experience. Join the legends and compete for glory.
                        </p>
                        <div className="flex justify-center md:justify-start gap-4">
                            <a href="#" className="p-2 bg-zinc-900 rounded-lg hover:bg-yellow-500 hover:text-black transition-all group">
                                <Twitter className="w-5 h-5 group-hover:scale-110" />
                            </a>
                            <a href="#" className="p-2 bg-zinc-900 rounded-lg hover:bg-pink-600 hover:text-white transition-all group">
                                <Instagram className="w-5 h-5 group-hover:scale-110" />
                            </a>
                            <a href="#" className="p-2 bg-zinc-900 rounded-lg hover:bg-blue-600 hover:text-white transition-all group">
                                <Facebook className="w-5 h-5 group-hover:scale-110" />
                            </a>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-teko text-white font-bold uppercase tracking-widest mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm uppercase tracking-wider">
                            <li><a href="/" className="hover:text-yellow-500 transition-colors">Home</a></li>
                            <li><a href="/#schedule" className="hover:text-yellow-500 transition-colors">Schedule</a></li>
                            <li><a href="/#faq" className="hover:text-yellow-500 transition-colors">FAQ</a></li>
                            <li><a href="/leaderboard" className="hover:text-yellow-500 transition-colors">Leaderboard</a></li>
                            <li><a href="/#rules" className="hover:text-yellow-500 transition-colors">Tournament Rules</a></li>
                        </ul>
                    </div>

                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-teko text-white font-bold uppercase tracking-widest mb-4">Technical Support</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start justify-center md:justify-start gap-3">
                                <MapPin className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                <span className="opacity-70 leading-relaxed text-xs">
                                    {CONTACT.address}
                                </span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <Phone className="w-4 h-4 text-yellow-500" />
                                <span className="opacity-70 text-xs">{CONTACT.phone}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <Mail className="w-4 h-4 text-yellow-500" />
                                <a href={`mailto:${CONTACT.email}`} className="opacity-70 hover:opacity-100 hover:text-yellow-500 transition-all text-xs">
                                    {CONTACT.email}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm uppercase tracking-wider">
                    <p>© 2026 {TOURNAMENT_INFO.name}. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy-policy" className="hover:text-yellow-500 transition-colors">Privacy Policy</Link>
                        <Link to="/terms-conditions" className="hover:text-yellow-500 transition-colors">Terms of Service</Link>
                        <Link to="/login" className="flex items-center gap-1 hover:text-yellow-500 transition-colors opacity-50 hover:opacity-100 italic">
                            <ShieldCheck className="w-3 h-3" />
                            Admin Access
                        </Link>
                    </div>
                </div>

                <button
                    onClick={scrollToTop}
                    className="absolute right-4 top-0 -translate-y-1/2 p-3 bg-yellow-500 text-black rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:bg-yellow-400 transition-colors animate-bounce"
                    aria-label="Scroll to top"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
            </div>
        </footer>
    );
}
