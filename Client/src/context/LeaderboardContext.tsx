import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { LEADERBOARD_DATA, type Team } from "@/constants/leaderboardData";

interface LeaderboardContextType {
    teams: Team[];
    updateTeams: (newTeams: Team[]) => void;
    addTeam: (teamData: Partial<Team>) => void;
    verifyTeam: (teamName: string) => void;
    resetTeams: () => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
    const [teams, setTeams] = useState<Team[]>(LEADERBOARD_DATA);

    // Initialize from local storage if available
    useEffect(() => {
        const storedTeams = localStorage.getItem("bgmi_leaderboard");
        if (storedTeams) {
            try {
                setTeams(JSON.parse(storedTeams));
            } catch (error) {
                console.error("Failed to parse leaderboard data from local storage", error);
            }
        }
    }, []);

    const updateTeams = (newTeams: Team[]) => {
        // Sort teams by total points descending, then placement points, then kills
        // Only verified teams should be ranked on the leaderboard, 
        // but we keep the sorting logic general for all teams in the state.
        const sortedTeams = [...newTeams].sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
            if (b.placementPoints !== a.placementPoints) return b.placementPoints - a.placementPoints;
            return b.totalKills - a.totalKills;
        });

        // Re-assign ranks based on sorted order
        const rankedTeams = sortedTeams.map((team, index) => ({
            ...team,
            rank: index + 1
        }));

        setTeams(rankedTeams);
        localStorage.setItem("bgmi_leaderboard", JSON.stringify(rankedTeams));
    };

    const addTeam = (teamData: Partial<Team>) => {
        const newTeam: Team = {
            rank: teams.length + 1,
            teamName: teamData.teamName || "Unknown Team",
            totalKills: 0,
            placementPoints: 0,
            totalPoints: 0,
            wins: 0,
            isVerified: false,
            ...teamData
        };
        updateTeams([...teams, newTeam]);
    };

    const verifyTeam = (teamName: string) => {
        const updatedTeams = teams.map(team =>
            team.teamName === teamName ? { ...team, isVerified: true } : team
        );
        updateTeams(updatedTeams);
    };

    const resetTeams = () => {
        setTeams(LEADERBOARD_DATA);
        localStorage.removeItem("bgmi_leaderboard");
    };

    return (
        <LeaderboardContext.Provider value={{ teams, updateTeams, addTeam, verifyTeam, resetTeams }}>
            {children}
        </LeaderboardContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLeaderboard() {
    const context = useContext(LeaderboardContext);
    if (context === undefined) {
        throw new Error("useLeaderboard must be used within a LeaderboardProvider");
    }
    return context;
}
