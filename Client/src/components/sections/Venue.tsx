import { CONTACT } from "@/constants/data";
import { MapPin, Phone, Car } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function Venue() {
    return (
        <section className="section-container py-16">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="w-full md:w-1/2">
                    <ScrollReveal>
                        <div className="h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-zinc-700 shadow-xl relative group">
                            <iframe
                                src={CONTACT.mapEmbedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: "grayscale(100%) invert(90%)" }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="group-hover:filter-none transition-all duration-500"
                            ></iframe>
                            <div className="absolute top-4 right-4 bg-zinc-900/90 text-yellow-500 p-2 rounded border border-yellow-500/20 text-xs font-rajdhani uppercase tracking-wider backdrop-blur-sm">
                                Live Location
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                <div className="w-full md:w-1/2 space-y-8">
                    <ScrollReveal delay={0.2}>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-teko text-white mb-2 uppercase">
                                Tournament <span className="text-yellow-500">Venue</span>
                            </h2>
                            <div className="h-1 w-20 bg-yellow-500 rounded-full" />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-zinc-900 rounded border border-zinc-700 text-yellow-500 mt-1">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-teko text-white mb-1">ADDRESS</h4>
                                    <p className="text-zinc-400 font-rajdhani text-lg leading-relaxed">
                                        {CONTACT.address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-zinc-900 rounded border border-zinc-700 text-yellow-500 mt-1">
                                    <Car className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-teko text-white mb-1">PARKING</h4>
                                    <p className="text-zinc-400 font-rajdhani text-lg leading-relaxed">
                                        Dedicated parking available for all participants and VIP guests at Gate 2.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-zinc-900 rounded border border-zinc-700 text-yellow-500 mt-1">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-teko text-white mb-1">CONTACT</h4>
                                    <p className="text-zinc-400 font-rajdhani text-lg leading-relaxed">
                                        {CONTACT.phone} <br />
                                        <span className="text-sm text-zinc-500">{CONTACT.email}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="neon"
                            className="w-full md:w-auto mt-4"
                            onClick={() => {
                                const destination = encodeURIComponent(CONTACT.address);
                                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
                                window.open(googleMapsUrl, "_blank");
                            }}
                        >
                            GET DIRECTIONS
                        </Button>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}
