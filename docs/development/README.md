# PRISM VIP 開発ドキュメント

このフォルダには、PRISM VIPシステムの開発に関するドキュメントを格納しています。

## 📁 ドキュメント構成

### 1. [システム構成設計書](./01_system_architecture.md)
- システム全体のアーキテクチャ
- 技術スタック選定理由
- インフラ構成
- セキュリティ設計
- コスト見積もり

### 2. [データベース設計書](./02_database_schema.md)
- ER図
- テーブル定義
- インデックス設計
- RLSポリシー
- バックアップ戦略

### 3. [API仕様書](./03_api_specification.md)
- エンドポイント一覧
- リクエスト/レスポンス形式
- 認証仕様
- エラーハンドリング
- レート制限

### 4. [実装計画書](./04_implementation_plan.md)
- 開発スケジュール
- フェーズ分割
- 実装優先順位
- チェックリスト
- リスク管理

### 5. [PDF生成システム設計書](./11_pdf_generation_system.md)  ✨ NEW
- Puppeteerを使用した高品質PDF生成
- 25年返済計画を含む完全レポート
- キャッシュ戦略とパフォーマンス最適化
- PDF専用レイアウト設計
- セキュリティと透かし機能

## 🚀 クイックスタート

### 開発環境構築

```bash
# リポジトリクローン
git clone https://github.com/h-abe222/prism-vip.git
cd prism-vip

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.localを編集

# 開発サーバー起動
npm run dev
```

### Supabase設定

```bash
# Supabase CLI インストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトリンク
supabase link --project-ref [project-id]

# マイグレーション実行
supabase db push
```

## 📊 プロジェクト情報

- **予算**: 初期20万円 + ランニング費用
- **期間**: 8-10週間
- **対象ユーザー数**: 最大1,000名
- **同時アクセス**: 約100名

## 🔧 技術スタック

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel
- **External**: LINE API, SendGrid, Google Analytics

## 📝 開発ガイドライン

### コーディング規約
- TypeScript使用
- ESLint/Prettier設定に従う
- コンポーネントは関数型で記述
- カスタムフックでロジック分離

### Git運用
- main: 本番環境
- develop: 開発環境
- feature/*: 機能開発
- hotfix/*: 緊急修正

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コード整形
refactor: リファクタリング
test: テスト追加/修正
chore: ビルド/補助ツール
```

## 🔐 セキュリティ

- 個人情報は暗号化して保存
- 全アクセスログを記録
- RLS (Row Level Security) 適用
- 定期的なセキュリティ監査

## 📞 連絡先

開発に関する質問は以下まで：
- GitHub Issues
- メール: [開発担当メールアドレス]

## 📄 ライセンス

本プロジェクトは機密情報を含むため、無断での複製・配布を禁止します。

---
*最終更新日: 2024年9月4日*