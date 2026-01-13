"use client";

import { useState } from "react";
import { UserProvider, useUser } from "@/lib/context/UserContext";
import { Landing } from "@/components/onboarding/Landing";
import { Login } from "@/components/onboarding/Login";
import { CreateGroup } from "@/components/onboarding/CreateGroup";
import { JoinGroup } from "@/components/onboarding/JoinGroup";
import { ProfileSetup } from "@/components/onboarding/ProfileSetup";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { supabase } from "@/lib/supabase";
import type { Profile, Group } from "@/types";

type OnboardingStep = "landing" | "login" | "create-group" | "join-group" | "profile-setup";

function AppContent() {
  const { profile, group, setProfile, setGroup } = useUser();
  const [step, setStep] = useState<OnboardingStep>("landing");
  const [tempGroupId, setTempGroupId] = useState<string>("");
  const [tempGroupCode, setTempGroupCode] = useState<string>("");

  // If user has profile and group, show dashboard
  if (profile && group) {
    return <Dashboard />;
  }

  // Onboarding flow
  const handleLoginSuccess = (profile: Profile, group: Group) => {
    setProfile(profile);
    setGroup(group);
  };

  const handleCreateGroupSuccess = (groupId: string, code: string) => {
    setTempGroupId(groupId);
    setTempGroupCode(code);
    setStep("profile-setup");
  };

  const handleJoinGroupSuccess = async (groupId: string, groupName: string) => {
    // Fetch and set group
    const { data } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (data) {
      setGroup(data);
      setTempGroupId(groupId);
      setStep("profile-setup");
    }
  };

  const handleProfileComplete = async (newProfile: Profile) => {
    // Fetch group if not already set
    if (!group && tempGroupId) {
      const { data } = await supabase
        .from('groups')
        .select('*')
        .eq('id', tempGroupId)
        .single();

      if (data) {
        setGroup(data);
      }
    }

    setProfile(newProfile);
  };

  return (
    <>
      {step === "landing" && (
        <Landing
          onLogin={() => setStep("login")}
          onCreateGroup={() => setStep("create-group")}
          onJoinGroup={() => setStep("join-group")}
        />
      )}

      {step === "login" && (
        <Login
          onBack={() => setStep("landing")}
          onSuccess={handleLoginSuccess}
        />
      )}

      {step === "create-group" && (
        <CreateGroup
          onBack={() => setStep("landing")}
          onSuccess={handleCreateGroupSuccess}
        />
      )}

      {step === "join-group" && (
        <JoinGroup
          onBack={() => setStep("landing")}
          onSuccess={handleJoinGroupSuccess}
        />
      )}

      {step === "profile-setup" && tempGroupId && (
        <ProfileSetup
          groupId={tempGroupId}
          groupCode={tempGroupCode}
          onComplete={handleProfileComplete}
        />
      )}
    </>
  );
}

export default function Home() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
