import { useState, useCallback } from 'react';
import apiClient from '@/api/apiClient';
import { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';

interface UseAxiosReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    request: (config: AxiosRequestConfig) => Promise<T>;
    clearError: () => void;
}

export const useAxios = <T = any>(): UseAxiosReturn<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    const request = useCallback(async (config: AxiosRequestConfig): Promise<T> => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient(config);
            setData(response.data);
            return response.data;
        } catch (err: any) {
            let message = 'An unexpected error occurred';

            if (err instanceof AxiosError) {
                message = err.response?.data?.message || err.message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, request, clearError };
};
