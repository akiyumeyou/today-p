import { useRoute, Link } from "wouter";
import { useMemo } from "react";
import { getRandomResponse, Mood } from "@/lib/characters";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2 } from "lucide-react";

export default function CharacterResult() {
  const [match, params] = useRoute("/result/:mood");
  const mood = (params?.mood as Mood) || "normal";

  // Use useMemo to keep the character consistent on re-renders unless mood changes
  // In a real app we might want to persist this in state to prevent refresh changing it, 
  // but for this simple app, re-rolling on refresh is fine/fun.
  const { character, quote } = useMemo(() => getRandomResponse(mood), [mood]);

  const playVoice = () => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(quote);
    utterance.lang = "ja-JP";
    utterance.pitch = character.voiceSettings.pitch;
    utterance.rate = character.voiceSettings.rate;
    
    // Try to find a Japanese voice
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.includes("ja"));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  if (!match) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-orange-100/50 -z-10 rounded-b-[3rem]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white mb-8"
      >
        <img 
          src={character.image} 
          alt={character.name} 
          className="w-full h-full object-cover"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-8 rounded-3xl shadow-lg max-w-lg w-full text-center relative mb-12 border border-stone-100"
      >
        {/* Speech bubble triangle */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45 border-l border-t border-stone-100" />
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-primary">{character.name}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={playVoice}
            className="rounded-full hover:bg-orange-100 text-orange-400"
            title="声を聴く"
          >
            <Volume2 className="w-5 h-5" />
          </Button>
        </div>
        
        <p className="text-2xl md:text-3xl font-medium text-stone-800 leading-relaxed">
          「{quote}」
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <Link href="/">
          <Button 
            size="lg" 
            className="text-xl h-16 px-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
          >
             もう一度
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
