# PRISM VIP デプロイメント情報

## 🌐 本番環境URL
**https://prism-vip.vercel.app**

このURLを必ず使用してください。他のURLは使用しないでください。

---

## 📍 重要なページ一覧

| ページ | URL |
|--------|-----|
| トップページ | https://prism-vip.vercel.app |
| ログイン | https://prism-vip.vercel.app/auth/login.html |
| 会員ページ | https://prism-vip.vercel.app/member/ |
| 物件詳細（南青山） | https://prism-vip.vercel.app/properties/001/ |
| PDFテストページ | https://prism-vip.vercel.app/test-pdf.html |
| PDF専用ビュー | https://prism-vip.vercel.app/pdf-view/001/ |

---

## 🚀 Vercel デプロイ情報

- **プロジェクト名**: prism-vip
- **アカウント**: h-abe222
- **正式URL**: https://prism-vip.vercel.app
- **フレームワーク**: 静的HTML
- **APIエンドポイント**: /api/generate-pdf

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