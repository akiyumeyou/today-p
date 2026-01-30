import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MoodSelection from "@/pages/MoodSelection";
import CharacterResult from "@/pages/CharacterResult";
import NotFound from "@/pages/not-found";
import { submitMood, MoodType } from "@/lib/api";

// URLから気分パラメータを取得
function getMoodFromUrl(): MoodType | null {
  const params = new URLSearchParams(window.location.search);
  const mood = params.get('mood');
  if (mood && ['happy', 'normal', 'sad'].includes(mood)) {
    return mood as MoodType;
  }
  return null;
}

// URLパラメータから直接結果画面へリダイレクト
function MoodRedirect() {
  const [mood] = useState<MoodType | null>(() => getMoodFromUrl());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (mood && !submitted) {
      submitMood(mood).catch(console.error);
      setSubmitted(true);
    }
  }, [mood, submitted]);

  // URLパラメータがあれば直接結果画面へ
  if (mood) {
    return <Redirect to={`/result/${mood}`} />;
  }

  return <MoodSelection />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={MoodRedirect} />
      <Route path="/result/:mood" component={CharacterResult} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
