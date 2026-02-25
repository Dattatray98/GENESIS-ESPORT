export interface Team {
    rank: number;
    teamName: string;
    totalKills: number;
    placementPoints: number;
    totalPoints: number;
    wins: number;
    alivePlayers?: number;
    isVerified: boolean;
    group: 'Group-1' | 'Group-2' | 'None';
    leaderName?: string;
    player2?: string;
    player3?: string;
    player4?: string;
    substitute?: string;
    email?: string;
    phone?: string;
    documentUrl?: string;
    seasonId?: string | { _id: string; title: string, status: string };
    _id?: string;
}

export const LEADERBOARD_DATA: Team[] = [
    { rank: 1, teamName: "GodLike Esports", totalKills: 45, placementPoints: 60, totalPoints: 105, wins: 3, isVerified: true, group: "Group-1", leaderName: "JONATHAN", player2: "NEYOO", player3: "ZGOD", player4: "CLUTCHGOD" },
    { rank: 2, teamName: "Team Soul", totalKills: 42, placementPoints: 50, totalPoints: 92, wins: 2, isVerified: true, group: "Group-2", leaderName: "MORTAL", player2: "VIPER", player3: "REYAAN", player4: "JOKER" },
    { rank: 3, teamName: "XSpark", totalKills: 38, placementPoints: 45, totalPoints: 83, wins: 1, isVerified: true, group: "Group-1", leaderName: "SCOUT", player2: "MAVI", player3: "GILL", player4: "ADITYA" },
    { rank: 4, teamName: "Blind Esports", totalKills: 35, placementPoints: 40, totalPoints: 75, wins: 1, isVerified: true, group: "Group-2", leaderName: "Manya", player2: "Nakul", player3: "Rony", player4: "Jokerr" },
    { rank: 5, teamName: "OR Esports", totalKills: 30, placementPoints: 35, totalPoints: 65, wins: 0, isVerified: true, group: "Group-1", leaderName: "Jelly", player2: "Admino", player3: "Daljith", player4: "Vampmire" },
    { rank: 6, teamName: "Global Esports", totalKills: 28, placementPoints: 30, totalPoints: 58, wins: 0, isVerified: true, group: "Group-2", leaderName: "Mavi", player2: "Raghav", player3: "Ninja", player4: "Beast" },
    { rank: 7, teamName: "TSM", totalKills: 25, placementPoints: 28, totalPoints: 53, wins: 0, isVerified: true, group: "Group-1", leaderName: "Shadow", player2: "Aquanox", player3: "NinjaJod", player4: "Blaze" },
    { rank: 8, teamName: "Team 8Bit", totalKills: 22, placementPoints: 25, totalPoints: 47, wins: 0, isVerified: true, group: "Group-2", leaderName: "Juicy", player2: "Mighty", player3: "Rexx", player4: "MadMan" },
    { rank: 9, teamName: "Enigma Gaming", totalKills: 20, placementPoints: 22, totalPoints: 42, wins: 0, isVerified: true, group: "Group-1", leaderName: "Rexx", player2: "Reya", player3: "Avii", player4: "Sagar" },
    { rank: 10, teamName: "Hyderabad Hydras", totalKills: 18, placementPoints: 20, totalPoints: 38, wins: 0, isVerified: true, group: "Group-2", leaderName: "Ace", player2: "Carry", player3: "Viper", player4: "Max" },
    { rank: 11, teamName: "Orangutan", totalKills: 15, placementPoints: 18, totalPoints: 33, wins: 0, isVerified: true, group: "Group-1", leaderName: "Ash", player2: "Believe", player3: "Driger", player4: "WizzGod" },
    { rank: 12, teamName: "Revenant Esports", totalKills: 12, placementPoints: 15, totalPoints: 27, wins: 0, isVerified: true, group: "Group-2", leaderName: "Topiwala", player2: "Sraan", player3: "Sensei", player4: "Fierce" },
    { rank: 13, teamName: "Numen Gaming", totalKills: 10, placementPoints: 12, totalPoints: 22, wins: 0, isVerified: true, group: "Group-1", leaderName: "Avi", player2: "Savitar", player3: "Rex", player4: "Gill" },
    { rank: 14, teamName: "Gods Reign", totalKills: 8, placementPoints: 10, totalPoints: 18, wins: 0, isVerified: true, group: "Group-2", leaderName: "Robin", player2: "Justin", player3: "Aquanox", player4: "Sraan" },
    { rank: 15, teamName: "Team INSane", totalKills: 6, placementPoints: 8, totalPoints: 14, wins: 0, isVerified: true, group: "Group-1", leaderName: "Aadi", player2: "Harsh", player3: "Skipz", player4: "Darklord" },
    { rank: 16, teamName: "Entity Gaming", totalKills: 4, placementPoints: 5, totalPoints: 9, wins: 0, isVerified: true, group: "Group-2", leaderName: "Saumraj", player2: "Gamlaboy", player3: "Pukar", player4: "Shryder" }
];
