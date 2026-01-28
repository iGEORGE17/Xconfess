// frontend/hooks/useProfile.ts
import { useEffect, useState } from "react";
import { fetchUserProfile, fetchUserStats, updateProfile, UserProfile, UserStats } from "../../api/user.api";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [user, userStats] = await Promise.all([fetchUserProfile(), fetchUserStats()]);
      setProfile(user);
      setStats(userStats);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (data: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const updated = await updateProfile(data);
      setProfile(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return { profile, stats, loading, error, saveProfile, reload: loadProfile };
};
