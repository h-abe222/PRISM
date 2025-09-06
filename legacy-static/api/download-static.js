// 静的ファイルダウンロードAPI（Puppeteerを使わない）

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // CORSヘッダー
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const { type } = req.query;
        
        // サンプルPDFデータを生成（簡単なバイナリ）
        // 実際のPDFヘッダーとコンテンツの最小構成
        const pdfContent = Buffer.from([
            0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, // %PDF-1.4
            0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A, // 改行とバイナリマーカー
            // 最小限のPDF構造
            0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, // 1 0 obj
            0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, // <</Type/
            0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x2F, // Catalog/
            0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, // Pages 2 
            0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, // 0 R>>
            0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, // endobj
            // より多くのPDF構造を省略...
        ]);
        
        // ファイル名の設定
        const filename = `test_document_${type || 'default'}.pdf`;
        
        // レスポンスヘッダーの設定
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfContent.length);
        
        // PDFデータを送信
        res.status(200).send(pdfContent);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            error: 'Download failed',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};