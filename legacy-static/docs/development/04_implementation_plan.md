# PRISM VIP 実装計画書

## 1. プロジェクト概要

- **開始日**: 2024年9月上旬
- **完了予定**: 2024年11月上旬
- **総工数**: 約8-10週間
- **開発体制**: 1-2名

## 2. 開発環境セットアップ

### 2.1 必要なツール
- [ ] Node.js 18.x以上
- [ ] npm or yarn
- [ ] Git
- [ ] VS Code (推奨)
- [ ] Supabase CLI
- [ ] Vercel CLI

### 2.2 アカウント準備
- [ ] GitHub アカウント
- [ ] Vercel アカウント
- [ ] Supabase アカウント
- [ ] SendGrid アカウント
- [ ] LINE Developers アカウント
- [ ] Google Analytics アカウント

## 3. Phase 1: 基本機能実装（4-6週間）

### Week 1-2: インフラ構築

#### Supabase セットアップ
- [ ] プロジェクト作成
- [ ] データベース設計実装
- [ ] 認証設定（メール/パスワード）
- [ ] RLS (Row Level Security) 設定
- [ ] ストレージバケット作成

#### 実装タスク
```sql
-- 1. テーブル作成
CREATE TABLE users (...);
CREATE TABLE properties (...);
CREATE TABLE documents (...);

-- 2. RLSポリシー設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users ...;

-- 3. トリガー設定
CREATE TRIGGER update_users_updated_at ...;
```

### Week 3-4: フロントエンド基本実装

#### Next.js プロジェクト構築
```bash
npx create-next-app@latest prism-vip --typescript --tailwind --app
cd prism-vip
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

#### ディレクトリ構造
```
/app
  /auth
    /login
    /register
    /reset-password
  /member
    /dashboard
    /properties
  /properties
    /[id]
  /api
    /auth
    /properties
/components
  /auth
  /common
  /property
/lib
  /supabase
  /utils
/types
```

#### 実装ページ
- [ ] ログインページ
- [ ] 会員登録ページ
- [ ] パスワードリセット
- [ ] 会員ダッシュボード
- [ ] 物件一覧
- [ ] 物件詳細

### Week 5-6: 機能統合

#### 認証フロー実装
```typescript
// lib/supabase/auth.ts
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUp(email: string, password: string, metadata: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata }
  })
  return { data, error }
}
```

#### データ取得実装
```typescript
// lib/supabase/properties.ts
export async function getProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  
  return { data, error }
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}
```

## 4. Phase 2: 管理機能実装（2-3週間）

### Week 7: 管理画面UI

#### 管理画面ルート
```
/admin
  /dashboard
  /users
  /properties
    /new
    /[id]/edit
  /documents
  /logs
```

#### 実装機能
- [ ] 管理者認証（ロールベース）
- [ ] 会員一覧・詳細
- [ ] 会員ステージ管理
- [ ] 物件CRUD
- [ ] JSON投入インターフェース

### Week 8-9: 管理機能実装

#### JSON投入機能
```typescript
// app/admin/properties/import/page.tsx
export default function ImportPage() {
  const [jsonData, setJsonData] = useState('')
  
  const handleImport = async () => {
    try {
      const data = JSON.parse(jsonData)
      const { error } = await supabase
        .from('properties')
        .upsert(data)
      
      if (error) throw error
      toast.success('インポート成功')
    } catch (error) {
      toast.error('インポート失敗')
    }
  }
  
  return (
    <div>
      <textarea 
        value={jsonData}
        onChange={(e) => setJsonData(e.target.value)}
        placeholder="JSONデータを貼り付け"
      />
      <button onClick={handleImport}>インポート</button>
    </div>
  )
}
```

#### PDF管理機能
```typescript
// lib/supabase/storage.ts
export async function uploadDocument(file: File, propertyId: string) {
  const fileName = `${propertyId}/${Date.now()}_${file.name}`
  
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file)
  
  if (error) return { error }
  
  // DBに記録
  const { error: dbError } = await supabase
    .from('documents')
    .insert({
      property_id: propertyId,
      title: file.name,
      file_path: data.path,
      file_type: 'pdf',
      file_size: file.size
    })
  
  return { data, error: dbError }
}
```

## 5. Phase 3: 外部連携実装（2週間）

### Week 10: LINE連携

#### LINE Messaging API設定
```typescript
// lib/line/client.ts
import { Client } from '@line/bot-sdk'

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
}

export const lineClient = new Client(config)

// 通知送信
export async function sendNotification(userId: string, message: string) {
  try {
    await lineClient.pushMessage(userId, {
      type: 'text',
      text: message,
    })
  } catch (error) {
    console.error('LINE notification error:', error)
  }
}
```

#### Supabase Edge Function
```typescript
// supabase/functions/line-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { lineClient } from './line-client.ts'

serve(async (req) => {
  const body = await req.json()
  
  // Webhook処理
  if (body.events) {
    for (const event of body.events) {
      if (event.type === 'message') {
        // メッセージ処理
      }
    }
  }
  
  return new Response('OK', { status: 200 })
})
```

### Week 11: メール連携・その他

#### SendGrid設定
```typescript
// lib/sendgrid/client.ts
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmail(to: string, subject: string, html: string) {
  const msg = {
    to,
    from: 'noreply@prism-vip.com',
    subject,
    html,
  }
  
  try {
    await sgMail.send(msg)
  } catch (error) {
    console.error('SendGrid error:', error)
  }
}
```

#### Google Analytics設定
```typescript
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## 6. Phase 4: テスト・デプロイ（1週間）

### Week 12: 最終調整

#### セキュリティチェック
- [ ] 認証フロー確認
- [ ] RLSポリシーテスト
- [ ] SQLインジェクション対策確認
- [ ] XSS対策確認
- [ ] CSRF対策確認

#### パフォーマンステスト
```bash
# Lighthouse実行
npm run build
npm run start
# Chrome DevToolsでLighthouse実行

# 負荷テスト
npm install -D @artillery/core
artillery quick -c 10 -n 100 https://prism-vip.vercel.app
```

#### デプロイ設定
```bash
# Vercel設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_KEY
vercel env add LINE_CHANNEL_ACCESS_TOKEN
vercel env add SENDGRID_API_KEY

# デプロイ
vercel --prod
```

## 7. チェックリスト

### 開発完了条件
- [ ] 全機能実装完了
- [ ] テスト完了（単体・結合）
- [ ] セキュリティチェック完了
- [ ] パフォーマンステスト合格
- [ ] ドキュメント作成完了
- [ ] 本番環境デプロイ完了

### 納品物
- [ ] ソースコード（GitHub）
- [ ] システム設計書
- [ ] データベース設計書
- [ ] API仕様書
- [ ] 運用マニュアル
- [ ] 管理者マニュアル

## 8. リスク管理

### 技術的リスク
| リスク | 影響度 | 対策 |
|-------|-------|------|
| Supabase制限 | 中 | 早期にProプラン移行 |
| LINE API制限 | 低 | レート制限実装 |
| パフォーマンス | 中 | キャッシュ戦略実装 |

### スケジュールリスク
- 外部API連携の遅延 → 並行作業で対応
- 仕様変更 → 週次レビューで早期発見

## 9. 運用開始準備

### 運用マニュアル項目
- システム起動・停止手順
- バックアップ・リストア手順
- 障害対応手順
- 監視項目と対応

### サポート体制
- 初月: 週次定例サポート
- 2ヶ月目以降: 月次定例 + 緊急対応

---
*最終更新日: 2024年9月4日*