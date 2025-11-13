// Mobile version of useAuth hook - deprecated, use AuthContext instead
// This file kept for backwards compatibility, but recommends using useAuth from contexts
import { useAuth as useAuthContext } from '../contexts';

export const useAuth = () => {
    return useAuthContext();
};

export default useAuth;
