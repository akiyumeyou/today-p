# today-p デプロイ・運用ドキュメント

## 概要

高齢の親に毎日の気分をタップで報告してもらい、キャラクターが音声で応答するアプリ。
LINEから通知→タップ→音声応答→家族に通知の流れ。

## プロジェクト構成

```
today-p/
├── public/
│   ├── index.html    ← 全機能が1ファイルに完結
│   └── img/
│       ├── img1.png  ← 幸せ犬（選択画面）
│       ├── img2.png  ← 普通犬
│       ├── img3.png  ← 悲しい犬
│       ├── img4.png  ← おっちゃん（結果画面）
│       ├── img5.png  ← おばちゃん
│       └── img6.png  ← 占い師
├── docs/
│   └── DEPLOYMENT.md
├── .gitignore
└── vercel.json
```

## 技術スタック

- **フロント**: 静的HTML/CSS/JavaScript（フレームワークなし）
- **ホスティング**: Vercel（静的サイト）
- **音声**: Web Speech API
- **通知**: LINE Messaging API（potz経由）

## URL

- **本番**: https://today-p-beta.vercel.app
- **GitHub**: https://github.com/akiyumeyou/today-p

## Vercelデプロイ

1. GitHubにプッシュすると自動デプロイ
2. 手動デプロイ: Vercelダッシュボード → Redeploy

## 連携システム（potz Laravel / AWS）

### 関連ファイル
- `app/Console/Commands/MoodReminderCommand.php` - LINE通知送信
- `app/Http/Controllers/Api/MoodController.php` - 気分受信・通知API
- `config/services.php` - LINE設定

### 環境変数（potz .env）
```
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=xxx
LINE_MOOD_LIFF_URL=https://liff.line.me/2009012195-X4LiCzBW
LINE_MOOD_NOTIFY_USER_ID=xxx（通知先LINE User ID）
```

### LINE Flex Message画像URL
```
https://today-p-beta.vercel.app/img/img1.png
https://today-p-beta.vercel.app/img/img2.png
https://today-p-beta.vercel.app/img/img3.png
```

### 定期通知コマンド
```bash
# テスト（自分に送信）
php artisan mood:remind --test

# 本番（母に送信）
php artisan mood:remind
```

## LIFF設定（LINE Developers Console）

- LIFF ID: `2009012195-X4LiCzBW`
- エンドポイントURL: `https://today-p-beta.vercel.app`

## 処理フロー

```
1. 18:00 cron → MoodReminderCommand実行
2. LINE Flex Message送信（3つの気分ボタン）
3. 母がボタンをタップ
4. LIFF経由でtoday-p開く（?mood=xxx付き）
5. liff.stateからmood取得→結果画面表示
6. キャラクターがランダムで選ばれ音声再生
7. APIでpotzに送信→家族にLINE通知
```

## 今後の拡張案

- Google Cloud TTSで高品質音声（potz統合が必要）
- 気分履歴の記録・可視化
- 複数家族への対応
