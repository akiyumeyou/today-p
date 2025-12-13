import { Link } from "wouter";
import { motion } from "framer-motion";
import imgHappy from "@assets/img1_1765601432934.png";
import imgNormal from "@assets/img2_1765601432933.png";
import imgSad from "@assets/img3_1765601432934.png";

const MoodButton = ({
  mood,
  label,
  img,
  delay,
}: {
  mood: string;
  label: string;
  img: string;
  delay: number;
}) => (
  <Link href={`/result/${mood}`} className="w-full">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-lg border-2 border-stone-100 hover:border-primary/50 hover:bg-orange-50 transition-colors cursor-pointer w-full"
    >
      <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-stone-100 p-2">
        <img src={img} alt={label} className="w-full h-full object-cover rounded-full" />
      </div>
      <span className="text-2xl font-bold text-stone-800">{label}</span>
    </motion.div>
  </Link>
);

export default function MoodSelection() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.h1 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-3xl md:text-4xl font-bold text-center text-stone-800 mb-12 leading-relaxed"
      >
        今日はどんな<br />1日だった？
      </motion.h1>

      <div className="flex flex-col gap-6 w-full max-w-md">
        <MoodButton mood="happy" label="幸せだった" img={imgHappy} delay={0.2} />
        <MoodButton mood="normal" label="普通" img={imgNormal} delay={0.4} />
        <MoodButton mood="sad" label="ちょっと悲しい" img={imgSad} delay={0.6} />
      </div>
    </div>
  );
}
