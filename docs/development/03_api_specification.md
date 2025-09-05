# PRISM VIP API仕様書

## 1. API概要

- **ベースURL**: `https://[project-id].supabase.co`
- **認証方式**: Bearer Token (JWT)
- **レスポンス形式**: JSON
- **文字コード**: UTF-8

## 2. 認証API

### 2.1 ユーザー登録

```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "data": {
    "name": "山田太郎",
    "phone": "090-1234-5678",
    "company": "株式会社サンプル"
  }
}
```

**レスポンス:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "v1.MJr0Z3...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-09-04T12:00:00Z"
  }
}
```

### 2.2 ログイン

```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 2.3 ログアウト

```http
POST /auth/v1/logout
Authorization: Bearer {access_token}
```

### 2.4 パスワードリセット

```http
POST /auth/v1/recover
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 3. ユーザーAPI

### 3.1 ユーザー情報取得

```http
GET /rest/v1/users?id=eq.{user_id}
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "山田太郎",
  "phone": "090-1234-5678",
  "company": "株式会社サンプル",
  "current_stage": 2,
  "created_at": "2024-09-04T12:00:00Z"
}
```

### 3.2 ユーザー情報更新

```http
PATCH /rest/v1/users?id=eq.{user_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "山田太郎",
  "phone": "090-9876-5432",
  "company": "新会社名"
}
```

### 3.3 ステージ更新

```http
PATCH /rest/v1/users?id=eq.{user_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "current_stage": 3
}
```

## 4. 物件API

### 4.1 物件一覧取得

```http
GET /rest/v1/properties?is_active=eq.true&order=sort_order
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
[
  {
    "id": "001",
    "title": "PRISM南青山プレミアムレジデンス",
    "location": "港区南青山",
    "price": 680000000,
    "yield_rate": 6.35,
    "property_type": "デザイナーズマンション",
    "area": "港区",
    "created_at": "2024-09-04T12:00:00Z"
  }
]
```

### 4.2 物件詳細取得

```http
GET /rest/v1/properties?id=eq.{property_id}
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
{
  "id": "001",
  "title": "PRISM南青山プレミアムレジデンス",
  "location": "港区南青山",
  "price": 680000000,
  "yield_rate": 6.35,
  "property_type": "デザイナーズマンション",
  "area": "港区",
  "data": {
    "overview": {
      "description": "...",
      "features": []
    },
    "simulation": {
      "monthly_income": 3600000,
      "annual_income": 43200000
    },
    "valuation": {
      "market_price": 720000000,
      "assessment": "優良"
    }
  }
}
```

### 4.3 物件作成（管理者のみ）

```http
POST /rest/v1/properties
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "id": "002",
  "title": "新規物件名",
  "location": "渋谷区",
  "price": 500000000,
  "yield_rate": 5.8,
  "property_type": "オフィスビル",
  "area": "渋谷区",
  "data": {...}
}
```

### 4.4 物件更新（管理者のみ）

```http
PATCH /rest/v1/properties?id=eq.{property_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "更新後の物件名",
  "price": 550000000,
  "data": {...}
}
```

## 5. 資料API

### 5.1 資料一覧取得

```http
GET /rest/v1/documents?property_id=eq.{property_id}
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
[
  {
    "id": "uuid",
    "property_id": "001",
    "title": "物件概要書",
    "file_type": "pdf",
    "file_size": 2048000,
    "required_stage": 1
  }
]
```

### 5.2 資料ダウンロードURL取得

```http
POST /storage/v1/object/sign/{bucket}/{path}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "expiresIn": 3600
}
```

**レスポンス:**
```json
{
  "signedURL": "https://[project-id].supabase.co/storage/v1/object/sign/documents/..."
}
```

### 5.3 資料アップロード（管理者のみ）

```http
POST /storage/v1/object/{bucket}/{path}
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

[Binary PDF Data]
```

## 6. アクセスログAPI

### 6.1 アクセスログ記録

```http
POST /rest/v1/access_logs
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "user_id": "uuid",
  "property_id": "001",
  "action": "view_property",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "page": "/properties/001",
    "referrer": "/member/"
  }
}
```

### 6.2 アクセスログ取得（管理者のみ）

```http
GET /rest/v1/access_logs?user_id=eq.{user_id}&order=created_at.desc
Authorization: Bearer {admin_token}
```

## 7. LINE通知API

### 7.1 通知送信（Edge Function）

```http
POST /functions/v1/send-line-notification
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "user_id": "uuid",
  "type": "new_property",
  "title": "新着物件のお知らせ",
  "message": "新しい物件が追加されました",
  "property_id": "002"
}
```

### 7.2 一括通知（管理者のみ）

```http
POST /functions/v1/broadcast-notification
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "target_stage": 3,
  "type": "announcement",
  "title": "重要なお知らせ",
  "message": "..."
}
```

## 8. 管理者API

### 8.1 会員一覧取得

```http
GET /rest/v1/users?deleted_at=is.null&order=created_at.desc
Authorization: Bearer {admin_token}
```

### 8.2 会員ステージ変更

```http
POST /functions/v1/change-user-stage
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "user_id": "uuid",
  "new_stage": 4,
  "property_id": "001",
  "reason": "商談開始"
}
```

### 8.3 JSON一括投入

```http
POST /functions/v1/bulk-import
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "type": "properties",
  "data": [
    {
      "id": "003",
      "title": "物件名",
      ...
    }
  ]
}
```

## 9. エラーレスポンス

### 9.1 エラーフォーマット

```json
{
  "error": {
    "code": "invalid_request",
    "message": "リクエストが不正です",
    "details": "email field is required"
  }
}
```

### 9.2 エラーコード一覧

| コード | HTTPステータス | 説明 |
|-------|---------------|------|
| unauthorized | 401 | 認証エラー |
| forbidden | 403 | 権限エラー |
| not_found | 404 | リソースが見つからない |
| invalid_request | 400 | リクエスト不正 |
| conflict | 409 | 重複エラー |
| rate_limited | 429 | レート制限 |
| server_error | 500 | サーバーエラー |

## 10. レート制限

- **認証API**: 5回/分
- **一般API**: 100回/分
- **管理者API**: 制限なし
- **ファイルアップロード**: 10回/時

## 11. WebSocket (Realtime)

### 11.1 接続

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(url, key)

const subscription = supabase
  .channel('properties')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'properties' },
    (payload) => {
      console.log('New property:', payload.new)
    }
  )
  .subscribe()
```

### 11.2 イベントタイプ

- INSERT: 新規追加
- UPDATE: 更新
- DELETE: 削除

## 12. セキュリティヘッダー

すべてのAPIレスポンスに以下のヘッダーを含む:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---
*最終更新日: 2024年9月4日*