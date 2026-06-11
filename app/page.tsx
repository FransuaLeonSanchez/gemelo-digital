"use client";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TabBar } from "@/components/TabBar";
import { LoginScreen } from "@/screens/LoginScreen";
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { CreateTwinCameraScreen } from "@/screens/CreateTwinCameraScreen";
import { CustomizeTwinScreen } from "@/screens/CustomizeTwinScreen";
import { PairDeviceScreen } from "@/screens/PairDeviceScreen";
import { ProfileFormScreen } from "@/screens/ProfileFormScreen";
import { TwinGenerationScreen } from "@/screens/TwinGenerationScreen";
import { ProcessingScreen } from "@/screens/ProcessingScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { TwinScreen } from "@/screens/TwinScreen";
import { LogInputScreen } from "@/screens/LogInputScreen";
import { ProgressScreen } from "@/screens/ProgressScreen";
import { Projection5yScreen } from "@/screens/Projection5yScreen";
import { RecommendationsScreen } from "@/screens/RecommendationsScreen";
import { RPM3DCreatorScreen } from "@/screens/RPM3DCreatorScreen";
import { AlertsScreen } from "@/screens/AlertsScreen";
import { SubIndexDetailScreen } from "@/screens/SubIndexDetailScreen";
import { DoctorReportScreen } from "@/screens/DoctorReportScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { liveICM } from "@/lib/icm";
import type {
  Meal,
  PairedDevice,
  ScreenId,
  SubIndexKey,
  TwinAppearance,
} from "@/lib/types";

const ONBOARDING: ScreenId[] = [
  "login",
  "welcome",
  "splash",
  "createTwin",
  "rpm3d",
  "twinGenerating",
  "customize",
  "profileForm",
  "pairDevice",
  "processing",
];

export default function Page() {
  const [screen, setScreen] = useState<ScreenId>("login");
  const [subIndex, setSubIndex] = useState<SubIndexKey>("Sueño");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [pairedDevice, setPairedDevice] = useState<PairedDevice | null>(null);
  const [pairReturnTo, setPairReturnTo] = useState<ScreenId>("processing");
  const [appearance, setAppearance] = useState<TwinAppearance>({
    skinTone: 1,
    hair: "corto",
    glasses: false,
    presentation: "masculina",
  });
  const [meals, setMeals] = useState<Meal[]>([]);
  const [useImage, setUseImage] = useState(false);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);

  const isOnboarding = ONBOARDING.includes(screen);

  const startPairFrom = (returnTo: ScreenId) => {
    setPairReturnTo(returnTo);
    setScreen("pairDevice");
  };

  return (
    <PhoneFrame>
      <div key={screen} className="h-full animate-[fadeIn_240ms_ease-out]">
        {screen === "login" && (
          <LoginScreen onNav={setScreen} appearance={appearance} />
        )}
        {screen === "welcome" && (
          <WelcomeScreen onNav={setScreen} appearance={appearance} useImage={useImage} />
        )}
        {screen === "createTwin" && (
          <CreateTwinCameraScreen onNav={setScreen} setUserPhoto={setUserPhoto} />
        )}
        {screen === "rpm3d" && (
          <RPM3DCreatorScreen
            onNav={setScreen}
            onCreated={(url) => {
              setGlbUrl(url);
              setUseImage(false);
            }}
          />
        )}
        {screen === "twinGenerating" && (
          <TwinGenerationScreen
            onNav={setScreen}
            onComplete={() => setUseImage(true)}
          />
        )}
        {screen === "customize" && (
          <CustomizeTwinScreen
            onNav={(s) => {
              if (s === "processing") {
                setPairReturnTo("processing");
                setScreen("profileForm");
              } else {
                setScreen(s);
              }
            }}
            appearance={appearance}
            setAppearance={setAppearance}
            userPhoto={userPhoto}
            useImage={useImage}
          />
        )}
        {screen === "profileForm" && <ProfileFormScreen onNav={setScreen} />}
        {screen === "pairDevice" && (
          <PairDeviceScreen
            onNav={setScreen}
            onPaired={setPairedDevice}
            returnTo={pairReturnTo}
          />
        )}
        {screen === "processing" && (
          <ProcessingScreen onNav={setScreen} appearance={appearance} useImage={useImage} />
        )}
        {screen === "home" && (
          <HomeScreen
            onNav={setScreen}
            appearance={appearance}
            useImage={useImage}
            icm={liveICM(meals)}
            meals={meals}
            onOpenSubIndex={(k) => {
              setSubIndex(k);
              setScreen("subIndex");
            }}
          />
        )}
        {screen === "twin" && (
          <TwinScreen
            onNav={setScreen}
            appearance={appearance}
            useImage={useImage}
            icmBase={liveICM(meals)}
            glbUrl={glbUrl}
          />
        )}
        {screen === "log" && (
          <LogInputScreen onNav={setScreen} meals={meals} setMeals={setMeals} />
        )}
        {screen === "progress" && <ProgressScreen onNav={setScreen} />}
        {screen === "projection" && <Projection5yScreen onNav={setScreen} />}
        {screen === "recommendations" && <RecommendationsScreen />}
        {screen === "alerts" && <AlertsScreen onNav={setScreen} />}
        {screen === "subIndex" && (
          <SubIndexDetailScreen onNav={setScreen} subIndexKey={subIndex} />
        )}
        {screen === "doctor" && <DoctorReportScreen onNav={setScreen} />}
        {screen === "profile" && (
          <ProfileScreen
            onNav={setScreen}
            appearance={appearance}
            useImage={useImage}
            pairedDevice={pairedDevice}
            onStartPair={() => startPairFrom("profile")}
          />
        )}
      </div>

      {!isOnboarding && <TabBar active={screen} onNav={setScreen} />}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </PhoneFrame>
  );
}
