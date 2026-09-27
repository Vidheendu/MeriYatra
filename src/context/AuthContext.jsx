import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUserStr = localStorage.getItem('meriyatra_user');
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          await loadUserProfile(storedUser.id);
        } catch (e) {
          console.error("Failed to parse stored user", e);
          signOut();
        }
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      // Fetch profile
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profError) throw profError;
      
      setUser({ id: userId, email: prof.identifier });
      setProfile(prof);

      // If driver, fetch driver details
      if (prof?.role === 'driver') {
        const { data: driverInfo } = await supabase
          .from('driver_details')
          .select('*')
          .eq('id', userId)
          .single();
        
        setDriverDetails(driverInfo);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      signOut(); // Invalid session
    } finally {
      setLoading(false);
    }
  };

  // Called manually by LoginPage after a successful manual query
  const manualSignIn = async (userId) => {
    setLoading(true);
    localStorage.setItem('meriyatra_user', JSON.stringify({ id: userId }));
    await loadUserProfile(userId);
  };

  const signOut = () => {
    localStorage.removeItem('meriyatra_user');
    setUser(null);
    setProfile(null);
    setDriverDetails(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, driverDetails, loading, manualSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
