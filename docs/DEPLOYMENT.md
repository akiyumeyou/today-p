# デプロイ手順

## プロジェクト構成

```
today-p/
├── public/
│   ├── index.html    ← メインアプリ（1ファイル完結）
│   └── img/
│       ├── img1.png  ← 幸せ犬（選択画面）
│       ├── img2.png  ← 普通犬
│       ├── img3.png  ← 悲しい犬
│       ├── img4.png  ← おっちゃん（結果画面）
│       ├── img5.png  ← おばちゃん
│       └── img6.png  ← 占い師
├── vercel.json
└── docs/
    └── DEPLOYMENT.md
```

## Vercelデプロイ

1. https://vercel.com にログイン
2. 「Add New」→「Project」
3. GitHubから `today2026_1` を選択
4. そのままデプロイ（設定不要）

## LINE連携（potz側）

### 環境変数（potz .env）
```
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=xxx
LINE_MOOD_LIFF_URL=https://liff.line.me/2009012195-X4LiCzBW
LINE_MOOD_NOTIFY_USER_ID=xxx
```

### 定期通知コマンド
```bash
# テスト（自分に送信）
php artisan mood:remind --test

# 本番（母に送信）
php artisan mood:remind
```

### LINE Flex Messageの画像URL
potzの `MoodReminderCommand.php` で使用：
```
https://today2026-1.vercel.app/img/img1.png
https://today2026-1.vercel.app/img/img2.png
https://today2026-1.vercel.app/img/img3.png
```
