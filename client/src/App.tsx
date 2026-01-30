import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MoodSelection from "@/pages/MoodSelection";
import CharacterResult from "@/pages/CharacterResult";
import NotFound from "@/pages/not-found";

// 起動時にURLパラメータをチェックして即座にリダイレクト（シンプル版）
const urlParams = new URLSearchParams(window.location.search);
const moodParam = urlParams.get('mood');
if (moodParam && ['happy', 'normal', 'sad'].includes(moodParam)) {
  window.location.href = `/result/${moodParam}`;
}

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
