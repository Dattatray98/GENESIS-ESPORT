import { useCallback } from 'react';
import { useAxios } from './useAxios';
import { type Team } from '@/constants/leaderboardData';

export interface TeamData {
    teamName: string;
    leaderName: string;
    email: string;
    phone: string;
    player2: string;
    player3: string;
    player4: string;
    substitute?: string;
    documentUrl?: string;
}

export const useTeams = () => {
    const { loading, error, request } = useAxios<Team[]>();
    const { request: mutateRequest, loading: mutationLoading, error: mutationError } = useAxios<any>();

    const fetchTeams = useCallback(async (seasonId?: string) => {
        const url = seasonId ? `teams?seasonId=${seasonId}` : 'teams';
        return await request({
            url,
            method: 'GET'
        });
    }, [request]);

    const registerTeam = useCallback(async (teamData: TeamData | FormData) => {
        const isFormData = teamData instanceof FormData;
        return await mutateRequest({
            url: 'teams/register',
            method: 'POST',
            data: teamData,
            headers: isFormData ? {} : { 'Content-Type': 'application/json' }
        });
    }, [mutateRequest]);

    const updateTeamsScore = useCallback(async (newTeams: Team[]) => {
        return await mutateRequest({
            url: 'teams/update',
            method: 'PUT',
            data: { teams: newTeams }
        });
    }, [mutateRequest]);

    return {
        registerTeam,
        fetchTeams,
        updateTeamsScore,
        loading,
        error,
        mutationLoading,
        mutationError
    };
};

