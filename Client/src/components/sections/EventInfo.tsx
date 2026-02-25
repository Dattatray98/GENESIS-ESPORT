import { TOURNAMENT_INFO } from "@/constants/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, User, Map, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function EventInfo() {
    const items = [
        {
            title: "GAME MODE",
            value: TOURNAMENT_INFO.mode,
            icon: <User className="w-8 h-8 text-yellow-500" />,
        },
        {
            title: "MAP ROTATION",
            value: TOURNAMENT_INFO.mapRotation.join(" → "),
            icon: <Map className="w-8 h-8 text-yellow-500" />,
        },
        {
            title: "TOTAL TEAMS",
            value: TOURNAMENT_INFO.totalTeams,
            icon: <Users className="w-8 h-8 text-yellow-500" />,
        },
        {
            title: "REPORTING TIME",
            value: TOURNAMENT_INFO.reportingTime,
            icon: <Clock className="w-8 h-8 text-yellow-500" />,
        },
    ];

    return (
        <section className="section-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, index) => (
                    <ScrollReveal key={index} delay={index * 0.1} className="h-full">
                        <Card className="card-hover border-zinc-800 bg-zinc-900/40 relative overflow-hidden group h-full">
                            <div className="absolute inset-0 bg-linear-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-2xl font-bold tracking-wider text-zinc-100 group-hover:text-yellow-400 transition-colors">
                                    {item.title}
                                </CardTitle>
                                {item.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-zinc-300 font-teko tracking-wide ">
                                    {item.value}
                                </div>
                            </CardContent>
                        </Card>
                    </ScrollReveal>
                ))}
            </div>
        </section>
    );
}
