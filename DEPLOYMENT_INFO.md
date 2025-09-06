# PRISM デプロイメント情報

## 🌐 本番環境URL

### メイン環境（Next.js版）
**https://prism-vip.vercel.app**  
✅ **本番**: Next.js 15.5版（2025-09-05更新）

### 旧レガシー環境
**https://prism-next.vercel.app**  
⚠️ **非推奨**: 旧デプロイメント、使用しない

---

## 📍 重要なページ一覧（Next.js版）

| ページ | URL | 機能 |
|--------|-----|------|
| **トップページ** | https://prism-vip.vercel.app | 元デザイン100%維持 |
| **ログイン** | https://prism-vip.vercel.app/auth/login.html | デモアカウント対応 |
| **会員ページ** | https://prism-vip.vercel.app/member/ | 段階的情報開示 |
| **物件詳細** | https://prism-vip.vercel.app/properties/001 | 日本語PDF生成 |

### API エンドポイント
| API | URL | 機能 |
|-----|-----|------|
| **物件概要書** | /api/pdf/property-overview | 日本語PDF生成 |
| **融資提案書** | /api/pdf/loan-proposal | 25年返済計画 |
| **収支CSV** | /api/csv/cashflow | 10年間シミュレーション |

---

## 🚀 Next.js デプロイ情報

- **プロジェクト名**: prism-vip  
- **アカウント**: h-abe222s-projects
- **正式URL**: https://prism-vip.vercel.app
- **フレームワーク**: Next.js 15.5.2
- **言語**: TypeScript
- **PDF生成**: Puppeteer + Chromium
- **デプロイ日**: 2025-09-05

---

## 📝 デプロイコマンド

### デプロイ方法
```bash
vercel --prod --yes
```

### エイリアス設定（URLが変わった場合）
```bash
vercel alias set [deployment-url] prism-vip.vercel.app
```

### プロジェクト確認
```bash
vercel ls
```

---

## ⚠️ 注意事項

1. **必ず https://prism-vip.vercel.app を使用する**
   - prism-vip-chi.vercel.app などの他のURLは使用しない
   - デプロイ固有のハッシュ付きURLも使用しない

2. **PDF生成の制限**
   - 無料プランの場合、実行時間制限あり（10秒）
   - 大きなPDFは生成できない可能性がある

3. **キャッシュ戦略**
   - PDFは物件ベースでキャッシュ（7日間）
   - 複数ユーザーが同じPDFを共有

---

## 📞 サポート

問題が発生した場合：
1. Vercelダッシュボード: https://vercel.com/h-abe222s-projects/prism-vip
2. ログ確認: `vercel logs`
3. デプロイ状況: `vercel inspect prism-vip.vercel.app`

---

*最終更新: 2024年9月5日*
*作成者: Claude (h-abe222の指示により)*