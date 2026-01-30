import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MoodSelection from "@/pages/MoodSelection";
import CharacterResult from "@/pages/CharacterResult";
import NotFound from "@/pages/not-found";
import { submitMood, MoodType } from "@/lib/api";

// 起動時にURLパラメータをチェックして即座にリダイレクト
(function checkMoodRedirect() {
  const params = new URLSearchParams(window.location.search);
  const mood = params.get('mood');
  if (mood && ['happy', 'normal', 'sad'].includes(mood)) {
    // APIに送信
    submitMood(mood as MoodType).catch(console.error);
    // 即座にリダイレクト（Reactレンダリング前）
    window.location.replace(`/result/${mood}`);
  }
})();

function Router() {
  return (
    <Switch>
      <Route path="/" component={MoodSelection} />
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
