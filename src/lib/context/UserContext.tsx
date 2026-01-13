"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, Group } from '@/types';

interface UserContextType {
  profile: Profile | null;
  group: Group | null;
  setProfile: (profile: Profile | null) => void;
  setGroup: (group: Group | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [group, setGroup] = useState<Group | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('pushup_profile');
    const savedGroup = localStorage.getItem('pushup_group');

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    if (savedGroup) {
      setGroup(JSON.parse(savedGroup));
    }
  }, []);

  // Save to localStorage when profile changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem('pushup_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('pushup_profile');
    }
  }, [profile]);

  // Save to localStorage when group changes
  useEffect(() => {
    if (group) {
      localStorage.setItem('pushup_group', JSON.stringify(group));
    } else {
      localStorage.removeItem('pushup_group');
    }
  }, [group]);

  const logout = () => {
    setProfile(null);
    setGroup(null);
    localStorage.clear();
  };

  return (
    <UserContext.Provider value={{ profile, group, setProfile, setGroup, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
