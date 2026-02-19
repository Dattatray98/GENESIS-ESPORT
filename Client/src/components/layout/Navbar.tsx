import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Menu, X, Crosshair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "/", type: "link" },
        { name: "Schedule", href: "/#schedule", type: "anchor" },
        { name: "Prizes", href: "/#prizes", type: "anchor" },
        { name: "Rules", href: "/#rules", type: "anchor" },
        { name: "Venue", href: "/#venue", type: "anchor" },
        { name: "Leaderboard", href: "/leaderboard", type: "link" },
        { name: "Teams", href: "/teams", type: "link" },
        { name: "Register", href: "/entry", type: "link" },
    ];

    const handleNavigation = (href: string, type: string) => {
        setIsOpen(false);
        if (type === "link") {
            navigate(href);
            window.scrollTo(0, 0); // Scroll to top for new pages
        } else {
            // If we are already on the home page, just scroll
            if (location.pathname === "/") {
                const elementId = href.replace("/#", "");
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            } else {
                // Otherwise navigate to home and then scroll (handled by browser usually if hash is present, but let's be safe)
                navigate(href);
            }
        }
    };

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-rajdhani",
                scrolled ? "bg-black/90 backdrop-blur-md border-b border-zinc-800 py-2" : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 font-teko text-3xl font-bold uppercase tracking-widest text-white cursor-pointer select-none"
                    onClick={() => handleNavigation("/", "link")}
                >
                    <Crosshair className="w-8 h-8 text-yellow-500 hover:rotate-45 transition-transform duration-500" />
                    <span>BGMI <span className="text-yellow-500">2026</span></span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={() => handleNavigation(link.href, link.type)}
                            className={cn(
                                "text-sm font-semibold uppercase tracking-wider transition-colors relative group cursor-pointer bg-transparent border-none p-0",
                                location.pathname === link.href ? "text-yellow-500" : "text-zinc-400 hover:text-yellow-500"
                            )}
                        >
                            {link.name}
                            <span className={cn(
                                "absolute -bottom-1 left-0 h-0.5 bg-yellow-500 transition-all duration-300",
                                location.pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                            )} />
                        </button>
                    ))}
                    <Button variant="neon" size="sm" className="ml-4 font-teko text-lg tracking-wider" onClick={() => navigate("/entry")}>
                        REGISTER NOW
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-zinc-400 hover:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-zinc-900 border-b border-zinc-800 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-6 items-center">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleNavigation(link.href, link.type)}
                                    className="text-2xl font-teko uppercase text-zinc-300 hover:text-yellow-500 transition-colors tracking-widest bg-transparent border-none cursor-pointer"
                                >
                                    {link.name}
                                </button>
                            ))}
                            <Button variant="neonOutline" className="w-full max-w-xs mt-4" onClick={() => { setIsOpen(false); navigate("/entry"); }}>
                                REGISTER NOW
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
