import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { type Team } from '@/constants/leaderboardData';

const API_URL = import.meta.env.VITE_API_URL + '/teams';

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
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const registerTeam = async (teamData: TeamData | FormData) => {
        setLoading(true);
        setError(null);
        try {
            const isFormData = teamData instanceof FormData;
            const headers: Record<string, string> = {
                'Authorization': `Bearer ${user?.token}`,
            };

            if (!isFormData) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await axios.post(`${API_URL}/register`, teamData, {
                headers
            });

            return response.data;
        } catch (err: any) {
            console.error('Axios error details:', err.response?.data || err.message);

            let message = 'An unknown error occurred';
            if (err.response?.data) {
                const data = err.response.data;
                const serverMsg = data.message || 'Error occurred';
                const serverErr = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
                message = serverErr ? `${serverMsg}: ${serverErr}` : serverMsg;
            } else {
                message = err.message;
            }

            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL, {
                headers: user ? { 'Authorization': `Bearer ${user.token}` } : {}
            });
            return response.data;
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Failed to fetch teams';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const updateTeamsScore = async (newTeams: Team[]) => {
        if (!user || user.role !== 'admin') {
            throw new Error('Not authorized to update scores');
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${API_URL}/update`, { teams: newTeams }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                }
            });
            return response.data;
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Failed to update teams';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    return { registerTeam, fetchTeams, updateTeamsScore, loading, error };
};
