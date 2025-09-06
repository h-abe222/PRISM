// 最もシンプルなテストAPI

module.exports = async (req, res) => {
    // CORSヘッダー
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    // OPTIONSリクエストへの対応
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // JSONレスポンス
    res.status(200).json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        method: req.method,
        query: req.query
    });
};