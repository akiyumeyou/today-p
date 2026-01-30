# デプロイ手順

## Vercel環境変数

Vercelダッシュボードで以下の環境変数を設定してください：

| Key | Value | 説明 |
|-----|-------|------|
| `VITE_LIFF_ID` | `2009012195-X4LiCzBW` | LINE LIFF ID |
| `VITE_API_ENDPOINT` | `https://ftc.potz.jp/api` | Laravel API エンドポイント |

### 設定方法
1. https://vercel.com にアクセス
2. プロジェクト `today2026-1` を開く
3. Settings → Environment Variables
4. 上記の2つを追加
5. Deployments → 最新のデプロイで「Redeploy」

## GitHubリポジトリ

- URL: https://github.com/akiyumeyou/today2026_1
- ブランチ: main

## 関連プロジェクト

### potz (Laravel/AWS)
- URL: https://ftc.potz.jp
- リポジトリ: https://github.com/akiyumeyou/potz
- 関連ファイル:
  - `app/Http/Controllers/Api/MoodController.php` - 気分受信API
  - `app/Console/Commands/MoodReminderCommand.php` - LINE通知コマンド
  - `config/services.php` - LINE設定

### Laravel側の環境変数 (.env)
```
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=xxx
LINE_MOOD_LIFF_URL=https://liff.line.me/2009012195-X4LiCzBW
LINE_MOOD_NOTIFY_USER_ID=xxx（通知先のLINE User ID）
```

## 定期通知

毎日18:00にLINE通知を送信：
```bash
php artisan mood:remind
```

テスト（自分に送信）：
```bash
php artisan mood:remind --test
```
