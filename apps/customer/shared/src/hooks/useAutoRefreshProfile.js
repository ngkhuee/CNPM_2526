import { useEffect } from 'react';
import { authService, storage } from 'shared-services';

/**
 * Hook để auto-refresh profile từ backend
 * - Mỗi lần app focus (web) hoặc app foreground (mobile)
 * - Mỗi 5 phút nếu vẫn mở app
 * - Giúp sync profile giữa web và mobile thông qua db.json
 * 
 * @param {string} userId - ID của user
 * @param {function} onProfileUpdate - Callback khi profile được update
 */
export const useAutoRefreshProfile = (userId, onProfileUpdate) => {
    useEffect(() => {
        if (!userId) return;

        // Refresh profile khi app focus lại
        const handleRefresh = async () => {
            try {
                const lastSync = await storage.getItem('lastProfileSync');
                const lastSyncTime = lastSync ? parseInt(lastSync) : 0;
                const now = Date.now();

                // Chỉ refresh nếu đã cách ít nhất 30 giây từ lần cuối
                if (now - lastSyncTime > 30000) {
                    const result = await authService.refreshProfile(userId);
                    if (result.success && result.user && onProfileUpdate) {
                        onProfileUpdate(result.user);
                    }
                }
            } catch (error) {
                console.error('[useAutoRefreshProfile] Error refreshing:', error);
            }
        };

        // Web: Listen to window focus event
        if (typeof window !== 'undefined') {
            window.addEventListener('focus', handleRefresh);

            return () => {
                window.removeEventListener('focus', handleRefresh);
            };
        }

        // Mobile: sẽ được handle bởi AppState listener ở AuthContext
    }, [userId, onProfileUpdate]);

    // Periodic refresh mỗi 5 phút
    useEffect(() => {
        if (!userId) return;

        const interval = setInterval(async () => {
            try {
                const result = await authService.refreshProfile(userId);
                if (result.success && result.user && onProfileUpdate) {
                    onProfileUpdate(result.user);
                }
            } catch (error) {
                console.error('[useAutoRefreshProfile] Periodic refresh error:', error);
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [userId, onProfileUpdate]);
};
