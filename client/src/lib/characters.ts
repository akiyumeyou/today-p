import uncleImg from "@assets/generated_images/showa_era_friendly_japanese_uncle_illustration.png";
import auntieImg from "@assets/generated_images/caring_japanese_auntie_illustration.png";
import fortuneImg from "@assets/generated_images/funny_mysterious_fortune_teller_illustration.png";

export type Mood = "happy" | "normal" | "sad";

export type Character = {
  id: string;
  name: string;
  image: string;
  description: string;
};

export const CHARACTERS: Record<string, Character> = {
  uncle: {
    id: "uncle",
    name: "昭和のおっちゃん",
    image: uncleImg,
    description: "少し口が悪いが根は優しい",
  },
  auntie: {
    id: "auntie",
    name: "世話焼きのおばちゃん",
    image: auntieImg,
    description: "親しみやすく少しお節介",
  },
  fortune: {
    id: "fortune",
    name: "謎の占い師",
    image: fortuneImg,
    description: "意味不明で回りくどい",
  },
};

type QuoteDatabase = {
  [key in Mood]: {
    [charId: string]: string[];
  };
};

const QUOTES: QuoteDatabase = {
  happy: {
    uncle: [
      "おっ！ええ顔してるな！その調子で明日も笑っとけよ！",
      "おう、景気良さそうやな！俺にもその運気分けてくれや！",
      "へへっ、いいことがあった日は酒がうめぇもんだ。ゆっくり休めよ！",
    ],
    auntie: [
      "あら〜！いいことがあったの？顔色がとっても素敵よ！",
      "よかったわねぇ！そういう日は、美味しいお茶でも飲んでゆっくりしてね。",
      "ふふ、あなたの笑顔が見られて私も嬉しいわ。明日もいい日になるわよ！",
    ],
    fortune: [
      "ほほう…輝くオーラが見えるぞ…今日の汝は星に愛されておるな。",
      "吉兆じゃ。その笑顔が、明日の運命をさらに引き寄せるであろう…。",
      "ふむ、悪くない。今日の汝は、宇宙のリズムと調和しておるようじゃな。",
    ],
  },
  normal: {
    uncle: [
      "まあ、何もないのが一番の幸せってやつよ。風呂入って寝ろ！",
      "普通か。人生、そんな日が一番大事なんだよな。お疲れさん！",
      "おう、今日も無事に終わったならそれが最高だ。気楽にいこうぜ！",
    ],
    auntie: [
      "お疲れさま！何気ない1日こそが、実は宝物なのよねぇ。",
      "今日も一日よく頑張ったわね。ご飯ちゃんと食べて、暖かくして寝るのよ。",
      "あら、普通が一番よ！平穏無事、それが長生きの秘訣ってね。",
    ],
    fortune: [
      "ふむ…凪のような一日か。それもまた運命の休憩時間じゃよ。",
      "平穏こそが最強の盾じゃ。汝の今日は、静かに守られておったようじゃな。",
      "何も起きぬこと、それ即ち奇跡なり。今日の汝は、静寂に包まれておる。",
    ],
  },
  sad: {
    uncle: [
      "なんだ、辛気臭い顔しやがって！生きてりゃそんな日もあるさ、気にすんな！",
      "おいおい、下向いて歩くなよ！明日は明日の風が吹くってな！",
      "おう、今日はさっさと寝ちまえ！寝て起きたら腹も減るし元気も出るさ！",
    ],
    auntie: [
      "あらあら、元気ないわねぇ。そんな時は甘いものでも食べて忘れちゃいましょ！",
      "大丈夫よ、私がついてるわ。今日はもう休んで、明日に備えましょ。",
      "辛いことがあったの？でもね、今日を乗り越えたあなたは偉い！花丸よ！",
    ],
    fortune: [
      "雨降って地固まる…汝の涙は、明日の花を咲かせるための水じゃよ。",
      "今は霧の中かもしれぬが、道は必ず開ける。星は汝を見捨ててはおらぬ。",
      "悲しみもまた、人生のスパイスじゃ。味わい深い人間になるための試練じゃな。",
    ],
  },
};

export function getRandomResponse(mood: Mood) {
  const charKeys = Object.keys(CHARACTERS);
  const randomCharKey = charKeys[Math.floor(Math.random() * charKeys.length)];
  const character = CHARACTERS[randomCharKey];
  
  const quotes = QUOTES[mood][randomCharKey];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  
  return { character, quote };
}
