import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/api';
import { User } from '../types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user'],
    queryFn: () => authApi.getCurrentUser().then(res => res.data),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const login = () => {
    authApi.githubLogin();
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    queryClient.clear();
    window.location.href = '/login';
  };

  const isAuthenticated = !!user && !error;

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated,
  };
};