import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Users, ShieldCheck } from 'lucide-react';
import { type Team } from '@/constants/leaderboardData';

interface TeamCardProps {
    team: Partial<Team> & { _id?: string };
    rank?: number;
    points?: number;
    isSelected?: boolean;
    onClick?: () => void;
    showPlayers?: boolean;
    className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
    team,
    rank,
    points,
    isSelected,
    onClick,
    showPlayers = false,
    className
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden transition-all duration-500 rounded-2xl border p-5 cursor-pointer",
                isSelected
                    ? "bg-yellow-500/10 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.15)] scale-[1.02]"
                    : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/60",
                className
            )}
        >
            {/* Background Accent */}
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full transition-all duration-500",
                isSelected ? "bg-yellow-500" : "bg-transparent group-hover:bg-zinc-700"
            )} />

            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Rank/Trophy Icon */}
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border",
                        isSelected
                            ? "bg-yellow-500 border-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500 group-hover:border-zinc-600"
                    )}>
                        {rank && rank > 0 ? (
                            <span className="font-teko text-xl font-bold">#{rank}</span>
                        ) : (
                            <Trophy className={cn("w-5 h-5", isSelected ? "text-black" : "text-zinc-700")} />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h5 className="font-teko text-2xl font-bold text-white uppercase tracking-wider leading-none">
                                {team.teamName || "Unknown Squad"}
                            </h5>
                            {team.isVerified && (
                                <ShieldCheck className="w-4 h-4 text-yellow-500" />
                            )}
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            Leader: {team.leaderName || "N/A"}
                        </p>
                    </div>
                </div>

                {(points !== undefined) && (
                    <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Pts</p>
                        <p className="font-teko text-4xl font-bold text-yellow-500 leading-none drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]">
                            {points}
                        </p>
                    </div>
                )}

                {team.group && !points && (
                    <div className="text-right">
                        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Unit Group</span>
                        <p className="font-teko text-xl text-zinc-400 leading-none mt-1">{team.group}</p>
                    </div>
                )}
            </div>

            {/* Players Roster */}
            {showPlayers && (
                <div className="mt-6 pt-5 border-t border-zinc-800/50">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { ign: team.leaderName, id: team.leaderId },
                            { ign: team.player2, id: team.player2Id },
                            { ign: team.player3, id: team.player3Id },
                            { ign: team.player4, id: team.player4Id },
                            { ign: team.substitute, id: team.substituteId }
                        ].filter(p => p.ign).map((player, idx) => (
                            <div key={idx} className="bg-zinc-950/50 border border-zinc-800/30 rounded-lg py-2 px-3 flex flex-col justify-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                                    <span className="text-[11px] font-bold text-zinc-400 uppercase truncate" title={player.ign}>{player.ign}</span>
                                </div>
                                {player.id && (
                                    <span className="text-[9px] font-mono text-zinc-600 mt-0.5 pl-3.5 truncate" title={player.id}>ID: {player.id}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Selection Checkmark Overlay */}
            {isSelected && (
                <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};
