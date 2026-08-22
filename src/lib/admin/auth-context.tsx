import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { AdminProfile } from './types';

interface AdminAuthContextType {
  user: User | null;
  profile: AdminProfile | null;
  loading: boolean;
  status: 'loading' | 'authenticated' | 'pending' | 'blocked' | 'rejected' | 'unauthenticated' | 'error';
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AdminAuthContextType['status']>('loading');
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile found
          setStatus('unauthenticated');
          setProfile(null);
        } else {
          console.error('Error fetching admin profile:', profileError);
          setError(profileError.message);
          setStatus('error');
        }
        return;
      }

      const adminProfile = data as AdminProfile;
      setProfile(adminProfile);

      if (adminProfile.status === 'approved') {
        setStatus('authenticated');
      } else if (adminProfile.status === 'pending') {
        setStatus('pending');
      } else if (adminProfile.status === 'blocked') {
        setStatus('blocked');
      } else if (adminProfile.status === 'rejected') {
        setStatus('rejected');
      }
    } catch (err: any) {
      console.error('Unexpected error fetching profile:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setStatus('unauthenticated');
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('Auth initialization error:', err);
          setError(err.message);
          setStatus('error');
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setStatus('unauthenticated');
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        status,
        error,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
