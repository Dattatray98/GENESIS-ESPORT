import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { type Team } from "@/constants/leaderboardData";
import { useAuth } from "./AuthContext";
import { useTeams } from "@/hooks/useTeams";

interface LeaderboardContextType {
    teams: Team[];
    updateTeams: (newTeams: Team[]) => Promise<void>;
    addTeam: (teamData: Partial<Team>) => void;
    verifyTeam: (teamName: string) => void;
    resetTeams: () => void;
    refreshTeams: () => Promise<void>;
    loading: boolean;
    setSeasonId: (id: string) => void;
    currentSeasonId: string | null;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const { fetchTeams: getTeamsApi, updateTeamsScore: pushTeamsApi } = useTeams();
    const [teams, setTeams] = useState<Team[]>(() => {
        try {
            const saved = localStorage.getItem("bgmi_leaderboard");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse cached teams", e);
            return [];
        }
    });
    const [loading, setLoading] = useState(true);
    const [currentSeasonId, setCurrentSeasonId] = useState<string | null>(null);

    const sortTeams = useCallback((teamList: Team[]) => {
        return [...teamList].sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
            if (b.placementPoints !== a.placementPoints) return b.placementPoints - a.placementPoints;
            return b.totalKills - a.totalKills;
        });
    }, []);

    const loadTeams = useCallback(async (seasonId?: string) => {
        setLoading(true);
        try {
            console.log(`[LeaderboardContext] Syncing teams from API for season: ${seasonId || 'all'}...`);
            const data = await getTeamsApi(seasonId);
            setTeams(sortTeams(data));
            localStorage.setItem("bgmi_leaderboard", JSON.stringify(data));
        } catch (error) {
            console.error("Failed to load teams", error);
        } finally {
            setLoading(false);
        }
    }, [getTeamsApi, sortTeams]);

    useEffect(() => {
        loadTeams(currentSeasonId || undefined);
    }, [user, loadTeams, currentSeasonId]);

    const setSeasonId = useCallback((id: string) => {
        setCurrentSeasonId(id);
    }, []);

    const updateTeams = useCallback(async (newTeams: Team[]) => {
        const sortedTeams = sortTeams(newTeams);
        // Optimistic update
        setTeams(sortedTeams);

        if (user && user.role === 'admin') {
            try {
                await pushTeamsApi(sortedTeams);
            } catch (error) {
                console.error('Failed to update teams on server', error);
            }
        }

        localStorage.setItem("bgmi_leaderboard", JSON.stringify(sortedTeams));
    }, [user, pushTeamsApi, sortTeams]);

    const addTeam = useCallback((teamData: Partial<Team>) => {
        const newTeam: Team = {
            rank: teams.length + 1,
            teamName: teamData.teamName || "Unknown Team",
            totalKills: 0,
            placementPoints: 0,
            totalPoints: 0,
            wins: 0,
            alivePlayers: 4,
            isVerified: false,
            group: 'None',
            seasonId: currentSeasonId || undefined,
            ...teamData
        } as Team;
        updateTeams([...teams, newTeam]);
    }, [teams, updateTeams, currentSeasonId]);

    const verifyTeam = useCallback((teamName: string) => {
        const updatedTeams = teams.map(team =>
            team.teamName === teamName ? { ...team, isVerified: true } : team
        );
        updateTeams(updatedTeams);
    }, [teams, updateTeams]);

    const resetTeams = useCallback(() => {
        setTeams([]);
        localStorage.removeItem("bgmi_leaderboard");
    }, []);

    const refreshTeams = useCallback(async () => {
        await loadTeams(currentSeasonId || undefined);
    }, [loadTeams, currentSeasonId]);

    const value = useMemo(() => ({
        teams,
        updateTeams,
        addTeam,
        verifyTeam,
        resetTeams,
        refreshTeams,
        loading,
        setSeasonId,
        currentSeasonId
    }), [teams, updateTeams, addTeam, verifyTeam, resetTeams, refreshTeams, loading, setSeasonId, currentSeasonId]);

    return (
        <LeaderboardContext.Provider value={value}>
            {children}
        </LeaderboardContext.Provider>
    );
}

export function useLeaderboard() {
    const context = useContext(LeaderboardContext);
    if (context === undefined) {
        throw new Error("useLeaderboard must be used within a LeaderboardProvider");
    }
    return context;
}
