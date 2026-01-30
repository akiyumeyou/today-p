# LINE連携機能 詳細設計書

## 1. 概要

### 1.1 目的
高齢の母がLINEから気分選択アプリを使用し、選択結果を家族にLINE通知する機能を実装する。

### 1.2 システム構成図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           システム全体図                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   [LINE Bot]                                                            │
│       │                                                                 │
│       │ ① 定期通知（毎日夕方など）                                        │
│       │   「今日の気分を教えてね」                                         │
│       │   + LIFFリンク                                                   │
│       ↓                                                                 │
│   [母のLINE]                                                            │
│       │                                                                 │
│       │ ② リンクをタップ                                                 │
│       ↓                                                                 │
│   ┌─────────────────────────────────┐                                   │
│   │    LIFF アプリ (Vercel)          │                                   │
│   │    ─────────────────────────     │                                   │
│   │    - 気分選択画面                 │                                   │
│   │    - キャラクター応答画面          │                                   │
│   │    - 音声読み上げ                 │                                   │
│   └───────────────┬─────────────────┘                                   │
│                   │                                                     │
│                   │ ③ POST /api/mood                                    │
│                   │    { mood, liffUserId, timestamp }                  │
│                   ↓                                                     │
│   ┌─────────────────────────────────┐                                   │
│   │    PHP サーバー (既存)            │                                   │
│   │    ─────────────────────────     │                                   │
│   │    - /api/mood エンドポイント      │                                   │
│   │    - LINE Messaging API連携      │                                   │
│   │    - 履歴保存（オプション）        │                                   │
│   └───────────────┬─────────────────┘                                   │
│                   │                                                     │
│                   │ ④ LINE Messaging API                                │
│                   │    Push Message                                     │
│                   ↓                                                     │
│   [家族のLINE]                                                          │
│       「母が "幸せだった" を選びました (18:30)」                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. LIFF アプリ（React側）の実装

### 2.1 必要なパッケージ

```bash
npm install @line/liff
```

### 2.2 環境変数

```env
# .env.local (Vercel環境変数にも設定)
VITE_LIFF_ID=xxxx-xxxxxx
VITE_API_ENDPOINT=https://your-php-server.com/api
```

### 2.3 LIFF初期化

**ファイル: `client/src/lib/liff.ts`**

```typescript
import liff from '@line/liff';

let isInitialized = false;

export async function initLiff(): Promise<void> {
  if (isInitialized) return;

  try {
    await liff.init({
      liffId: import.meta.env.VITE_LIFF_ID
    });
    isInitialized = true;
    console.log('LIFF initialized');
  } catch (error) {
    console.error('LIFF init failed:', error);
  }
}

export function getLiffUserId(): string | null {
  if (!liff.isLoggedIn()) {
    return null;
  }
  const context = liff.getContext();
  return context?.userId ?? null;
}

export function isInLiff(): boolean {
  return liff.isInClient();
}

export { liff };
```

### 2.4 アプリのエントリーポイント修正

**ファイル: `client/src/main.tsx`**

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initLiff } from "./lib/liff";

// LIFF初期化後にアプリをレンダリング
initLiff().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
```

### 2.5 気分選択時のAPI呼び出し

**ファイル: `client/src/lib/api.ts`**

```typescript
import { getLiffUserId, isInLiff } from './liff';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '';

export type MoodType = 'happy' | 'normal' | 'sad';

export interface MoodSubmitResponse {
  success: boolean;
  message?: string;
}

export async function submitMood(mood: MoodType): Promise<MoodSubmitResponse> {
  // LIFF外からのアクセス時はスキップ
  if (!isInLiff()) {
    console.log('Not in LIFF, skipping API call');
    return { success: true, message: 'skipped' };
  }

  const userId = getLiffUserId();

  try {
    const response = await fetch(`${API_ENDPOINT}/mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mood,
        liff_user_id: userId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to submit mood:', error);
    return { success: false, message: 'error' };
  }
}
```

### 2.6 MoodSelection.tsx の修正

**ファイル: `client/src/pages/MoodSelection.tsx`**

```typescript
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { submitMood, MoodType } from "@/lib/api";
import imgHappy from "@assets/img1_1765601432934.png";
import imgNormal from "@assets/img2_1765601432933.png";
import imgSad from "@assets/img3_1765601432934.png";

const MoodButton = ({
  mood,
  label,
  img,
  delay,
  onSelect,
}: {
  mood: MoodType;
  label: string;
  img: string;
  delay: number;
  onSelect: (mood: MoodType) => void;
}) => (
  <motion.button
    onClick={() => onSelect(mood)}
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
  </motion.button>
);

export default function MoodSelection() {
  const [, setLocation] = useLocation();

  const handleMoodSelect = async (mood: MoodType) => {
    // バックエンドに送信（非同期、エラーでも画面遷移は行う）
    submitMood(mood).catch(console.error);

    // 結果画面へ遷移
    setLocation(`/result/${mood}`);
  };

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
        <MoodButton mood="happy" label="幸せだった" img={imgHappy} delay={0.2} onSelect={handleMoodSelect} />
        <MoodButton mood="normal" label="普通" img={imgNormal} delay={0.4} onSelect={handleMoodSelect} />
        <MoodButton mood="sad" label="ちょっと悲しい" img={imgSad} delay={0.6} onSelect={handleMoodSelect} />
      </div>
    </div>
  );
}
```

---

## 3. PHP サーバー側の実装

### 3.1 データベーステーブル（オプション：履歴保存用）

```sql
CREATE TABLE mood_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    liff_user_id VARCHAR(255),
    mood ENUM('happy', 'normal', 'sad') NOT NULL,
    notified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_date (liff_user_id, created_at)
);
```

### 3.2 ルーティング

**ファイル: `routes/api.php`**

```php
<?php

use App\Http\Controllers\MoodController;

Route::post('/mood', [MoodController::class, 'store']);
```

### 3.3 コントローラー

**ファイル: `app/Http/Controllers/MoodController.php`**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\LineNotificationService;
use App\Models\MoodLog;

class MoodController extends Controller
{
    private LineNotificationService $lineService;

    public function __construct(LineNotificationService $lineService)
    {
        $this->lineService = $lineService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'mood' => 'required|in:happy,normal,sad',
            'liff_user_id' => 'nullable|string',
            'timestamp' => 'nullable|date',
        ]);

        // 履歴保存（オプション）
        $log = MoodLog::create([
            'liff_user_id' => $validated['liff_user_id'],
            'mood' => $validated['mood'],
        ]);

        // 家族に通知
        $this->lineService->notifyFamily($validated['mood']);

        // 通知完了を記録
        $log->update(['notified_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => '気分を記録しました',
        ]);
    }
}
```

### 3.4 LINE通知サービス

**ファイル: `app/Services/LineNotificationService.php`**

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LineNotificationService
{
    private string $channelAccessToken;
    private string $familyUserId;

    public function __construct()
    {
        $this->channelAccessToken = config('services.line.channel_access_token');
        $this->familyUserId = config('services.line.family_user_id');
    }

    public function notifyFamily(string $mood): bool
    {
        $moodLabels = [
            'happy' => '幸せだった 😊',
            'normal' => '普通 😌',
            'sad' => 'ちょっと悲しい 😢',
        ];

        $moodLabel = $moodLabels[$mood] ?? $mood;
        $time = now()->format('H:i');

        $message = "📱 お母さんから報告がありました\n\n"
                 . "今日の気分: {$moodLabel}\n"
                 . "報告時刻: {$time}";

        return $this->pushMessage($this->familyUserId, $message);
    }

    private function pushMessage(string $userId, string $text): bool
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->channelAccessToken,
                'Content-Type' => 'application/json',
            ])->post('https://api.line.me/v2/bot/message/push', [
                'to' => $userId,
                'messages' => [
                    [
                        'type' => 'text',
                        'text' => $text,
                    ],
                ],
            ]);

            if ($response->failed()) {
                Log::error('LINE push message failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('LINE push message exception', [
                'message' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
```

### 3.5 設定ファイル

**ファイル: `config/services.php`**

```php
<?php

return [
    // ... 既存の設定

    'line' => [
        'channel_access_token' => env('LINE_CHANNEL_ACCESS_TOKEN'),
        'family_user_id' => env('LINE_FAMILY_USER_ID'),
    ],
];
```

**ファイル: `.env`**

```env
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_FAMILY_USER_ID=Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 4. 定期通知の実装

### 4.1 Artisanコマンド作成

**ファイル: `app/Console/Commands/SendDailyMoodReminder.php`**

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SendDailyMoodReminder extends Command
{
    protected $signature = 'mood:remind';
    protected $description = '母に気分確認のリマインダーを送信';

    public function handle()
    {
        $liffUrl = config('services.line.liff_url'); // 例: https://liff.line.me/xxxx-xxxxxx
        $motherUserId = config('services.line.mother_user_id');
        $channelAccessToken = config('services.line.channel_access_token');

        $message = "こんばんは！\n"
                 . "今日はどんな1日だった？\n\n"
                 . "👇 タップして教えてね\n"
                 . $liffUrl;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $channelAccessToken,
            'Content-Type' => 'application/json',
        ])->post('https://api.line.me/v2/bot/message/push', [
            'to' => $motherUserId,
            'messages' => [
                [
                    'type' => 'text',
                    'text' => $message,
                ],
            ],
        ]);

        if ($response->successful()) {
            $this->info('リマインダーを送信しました');
        } else {
            $this->error('送信失敗: ' . $response->body());
        }
    }
}
```

### 4.2 スケジュール設定

**ファイル: `app/Console/Kernel.php`**

```php
<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // 毎日18時にリマインダー送信
        $schedule->command('mood:remind')
                 ->dailyAt('18:00')
                 ->timezone('Asia/Tokyo');
    }
}
```

### 4.3 環境変数追加

```env
LINE_MOTHER_USER_ID=Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINE_LIFF_URL=https://liff.line.me/xxxx-xxxxxx
```

---

## 5. LINE Developers 設定

### 5.1 LIFF設定

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. 対象のチャネルを選択
3. 「LIFF」タブを開く
4. 以下を設定:

| 項目 | 値 |
|------|-----|
| LIFF app name | 今日の気分 |
| Size | Full |
| Endpoint URL | `https://today2026-1.vercel.app` (VercelのURL) |
| Scope | `profile` にチェック |
| Bot link feature | On (Aggressive) |

### 5.2 Messaging API設定

1. 「Messaging API」タブを開く
2. 「Channel access token」を発行（長期トークン推奨）
3. Webhook URLは既存のものを使用

---

## 6. 実装チェックリスト

### フロントエンド（React）
- [ ] `@line/liff` パッケージインストール
- [ ] `client/src/lib/liff.ts` 作成
- [ ] `client/src/lib/api.ts` 作成
- [ ] `client/src/main.tsx` 修正（LIFF初期化）
- [ ] `client/src/pages/MoodSelection.tsx` 修正
- [ ] Vercel環境変数設定（VITE_LIFF_ID, VITE_API_ENDPOINT）

### バックエンド（PHP/Laravel）
- [ ] `mood_logs` テーブル作成（オプション）
- [ ] `MoodController` 作成
- [ ] `LineNotificationService` 作成
- [ ] `routes/api.php` にルート追加
- [ ] `config/services.php` にLINE設定追加
- [ ] `.env` に環境変数追加
- [ ] `SendDailyMoodReminder` コマンド作成
- [ ] スケジュール設定
- [ ] CORS設定（Vercelからのリクエスト許可）

### LINE Developers
- [ ] LIFF アプリ作成/設定
- [ ] Endpoint URL をVercelのURLに設定
- [ ] Channel access token 発行

---

## 7. CORS設定（PHP側）

VercelからPHPサーバーへのリクエストを許可するため、CORS設定が必要。

**ファイル: `config/cors.php`**

```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://today2026-1.vercel.app',
        'https://liff.line.me',
    ],
    'allowed_headers' => ['*'],
    'supports_credentials' => false,
];
```

---

## 8. セキュリティ考慮事項

1. **LIFF IDの検証**: 本番環境では、受け取ったLIFF User IDが正しいか検証する
2. **レート制限**: 同一ユーザーからの過剰なリクエストを制限
3. **HTTPS必須**: 全通信をHTTPSで行う
4. **環境変数管理**: トークン類は環境変数で管理、コードに直接書かない

---

## 9. 今後の拡張案

1. **リッチメニュー対応**: LINE公式アカウントにリッチメニューを設定し、いつでもアクセス可能に
2. **履歴グラフ**: 過去の気分推移をグラフ化
3. **未報告アラート**: 24時間報告がない場合に家族へ通知
4. **複数家族対応**: 複数の家族メンバーに通知
