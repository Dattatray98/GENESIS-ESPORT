import { useCallback } from 'react';
import { useAxios } from './useAxios';

export interface Season {
    _id: string;
    title: string;
    subtitle: string;
    startDate: string;
    endDate?: string;
    prizePool: string;
    gameName: string;
    finalTeamCount: number;
    status: 'active' | 'Completed';
    createdAt?: string;
}

export const useSeasons = () => {
    const { loading, error, request } = useAxios<Season[]>();
    // We use a separate instance for single season operations if needed, 
    // but often fetchSeasons is what we want to track state for.
    const { request: mutateRequest, loading: mutationLoading, error: mutationError } = useAxios<Season>();

    const fetchSeasons = useCallback(async () => {
        return await request({
            url: 'seasons',
            method: 'GET'
        });
    }, [request]);

    const fetchActiveSeasons = useCallback(async () => {
        return await request({
            url: 'seasons/active',
            method: 'GET'
        });
    }, [request]);

    const fetchSeasonById = useCallback(async (id: string) => {
        return await mutateRequest({
            url: `seasons/${id}`,
            method: 'GET'
        });
    }, [mutateRequest]);

    const createSeason = useCallback(async (seasonData: Partial<Season>) => {
        return await mutateRequest({
            url: 'seasons',
            method: 'POST',
            data: seasonData
        });
    }, [mutateRequest]);

    const updateSeason = useCallback(async (id: string, seasonData: Partial<Season>) => {
        return await mutateRequest({
            url: `seasons/${id}`,
            method: 'PUT',
            data: seasonData
        });
    }, [mutateRequest]);

    return {
        loading,
        error,
        mutationLoading,
        mutationError,
        fetchSeasons,
        fetchActiveSeasons,
        fetchSeasonById,
        createSeason,
        updateSeason
    };
};
