// シンプルなダウンロードAPI（テスト用）

module.exports = async (req, res) => {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const { type } = req.query;
        
        // テスト用のシンプルなレスポンス
        const testData = {
            type: type,
            message: 'Test download endpoint',
            timestamp: new Date().toISOString()
        };
        
        // JSONレスポンスを返す
        res.status(200).json({
            success: true,
            data: testData
        });
        
    } catch (error) {
        console.error('Simple download error:', error);
        res.status(500).json({
            success: false,
            error: 'Download failed',
            message: error.message,
            stack: error.stack
        });
    }
};