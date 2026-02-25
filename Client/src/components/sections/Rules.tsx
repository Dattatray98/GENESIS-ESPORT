import { RULES } from "@/constants/data";
import { Button } from "@/components/ui/Button";
import { ChevronRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function Rules() {
    return (
        <section className="section-container py-16">
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                    <ScrollReveal>
                        <h2 className="text-4xl md:text-5xl font-teko text-white mb-6 uppercase tracking-wider">
                            <span className="text-yellow-500">Tournament</span> Rules
                        </h2>
                        <p className="text-zinc-400 font-rajdhani text-lg mb-8 leading-relaxed">
                            Ensure fair play and competitive integrity. Familiarize yourself with the core rules before participating. Strict adherence is mandatory.
                        </p>
                        <a href="https://drive.google.com/file/d/1f4jhtJUL1dyWbZsUtwsg1xcS2cbBD2Nv/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="group">
                                <FileText className="w-4 h-4 mr-2 group-hover:text-yellow-500" />
                                DOWNLOAD FULL RULEBOOK
                            </Button>
                        </a>
                    </ScrollReveal>
                </div>

                <div className="md:w-1/2 w-full">
                    <ScrollReveal delay={0.2}>
                        <Card className="bg-zinc-900/50 border-yellow-500/20 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ChevronRight className="text-yellow-500" />
                                    Key Regulations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {RULES.map((rule, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="text-yellow-500 font-teko text-xl">0{index + 1}</span>
                                            <span className="text-zinc-300 font-rajdhani text-lg">{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}
