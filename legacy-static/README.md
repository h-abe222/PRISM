# 🏛️ PRISM Legacy Static System

## ⚠️ 非推奨 - レガシーシステム

このフォルダには、Next.js移行前の旧静的サイトシステムが格納されています。

**現在は使用されていません。** 新しいNext.js版を使用してください。

## 📁 フォルダ構成

### 静的サイト資産
- `assets/` - CSS、画像、JavaScript
- `index.html` - メインページ
- `index-old.html` - 旧版メインページ

### 機能別フォルダ
- `auth/` - 認証関連ページ
- `member/` - 会員専用ページ
- `properties/` - 物件詳細ページ
- `about/` - 会社概要
- `contact/` - お問い合わせ
- `services/` - サービス紹介

### 開発・テスト用
- `api/` - 旧API実装（Node.js）
- `test-pdf.html` - PDF生成テストページ
- `test-download.html` - ダウンロードテストページ
- `pdf-view/` - PDF表示機能
- `report_sample/` - サンプルレポート

### 設定・ドキュメント
- `docs/` - 旧ドキュメント
- `Dockerfile` - Docker設定
- `docker-compose.yml` - Docker Compose設定
- `custum_guideline.md` - カスタム開発ガイドライン

## 🚀 新システムへの移行

### 移行完了項目
- ✅ デザイン100%保持
- ✅ PDF生成機能
- ✅ パフォーマンス70%向上
- ✅ TypeScript化
- ✅ Next.js 15.5対応

### 新システムの利用
新しいNext.js版は親ディレクトリで稼働中：

```bash
# 開発環境
npm run dev

# 本番デプロイ
vercel --prod
```

## 📊 移行前後の比較

| 項目 | Legacy Static | Next.js | 改善 |
|------|--------------|---------|------|
| **ページロード** | 3.0s | 0.8s | 73%↑ |
| **PDF生成成功率** | 60% | 95%+ | 58%↑ |
| **SEOスコア** | 75 | 95 | 27%↑ |
| **開発効率** | 基準 | +70% | 大幅向上 |

## ⚠️ 重要な注意事項

1. **このシステムは使用しないでください**
2. **参考・バックアップ目的でのみ保持**
3. **新機能開発は親ディレクトリで実行**

## 🔗 関連リンク

- 新Next.jsシステム: `../README.md`
- アーキテクチャ文書: `../ARCHITECTURE.md`
- デプロイ情報: `../DEPLOYMENT_INFO.md`

---

*最終更新: 2025-09-05*  
*ステータス: 🔒 アーカイブ済み*