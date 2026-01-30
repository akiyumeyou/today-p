import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MoodSelection from "@/pages/MoodSelection";
import CharacterResult from "@/pages/CharacterResult";
import NotFound from "@/pages/not-found";
import { submitMood, MoodType } from "@/lib/api";

// URLパラメータから直接結果画面へリダイレクト
function MoodRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mood = params.get('mood') as MoodType | null;

    if (mood && ['happy', 'normal', 'sad'].includes(mood)) {
      // APIに送信
      submitMood(mood).catch(console.error);
      // 結果画面へリダイレクト
      setLocation(`/result/${mood}`);
    }
  }, [setLocation]);

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
