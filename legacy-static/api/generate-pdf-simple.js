// シンプルなPDF生成API（Vercel最適化版）

module.exports = async (req, res) => {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const { propertyId, docType, stage = 5 } = req.query;
        
        if (!propertyId || !docType) {
            return res.status(400).json({
                error: 'Missing required parameters'
            });
        }
        
        // 現時点では、サンプルPDFにリダイレクト
        // 本番環境では外部PDF生成サービスを使用することを推奨
        const samplePdfUrl = `https://prism-vip.vercel.app/report_sample/南青山プリズムビル_完全投資レポート_PRISM.pdf`;
        
        // リダイレクトまたはプロキシ
        res.redirect(samplePdfUrl);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            error: 'PDF generation failed',
            message: error.message,
            note: 'Puppeteerの実行にはVercel Proプランと追加設定が必要です。代替案として、外部PDF生成サービス（Browserless.io、PDFShift等）の使用を推奨します。'
        });
    }
};