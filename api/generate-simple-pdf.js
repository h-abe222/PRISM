// シンプルなPDF生成API（Vercel Functions対応）

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
        
        // HTMLコンテンツを生成（インラインで定義）
        const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: sans-serif;
            padding: 40px;
            line-height: 1.6;
        }
        h1 { 
            color: #0066CC;
            font-size: 24px;
            text-align: center;
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f0f0f0;
        }
    </style>
</head>
<body>
    <h1>${getTitle(type)}</h1>
    <p style="text-align: center; font-size: 18px;">南青山プリズムビル</p>
    ${getContent(type)}
</body>
</html>
        `;
        
        // Puppeteerの動的インポート
        let chromium, puppeteer;
        try {
            chromium = require('@sparticuz/chromium');
            puppeteer = require('puppeteer-core');
        } catch (e) {
            // Puppeteerが使えない場合はHTMLを直接返す
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.status(200).send(htmlContent);
            return;
        }
        
        // Puppeteerの設定
        chromium.setHeadlessMode = true;
        chromium.setGraphicsMode = false;
        
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: 'new',
            ignoreHTTPSErrors: true
        });
        
        try {
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
            });
            
            // PDFを返す
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${getFileName(type)}"`)
            res.status(200).send(pdfBuffer);
            
        } finally {
            await browser.close();
        }
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            error: 'PDF generation failed',
            message: error.message
        });
    }
};

// タイトル取得
function getTitle(type) {
    const titles = {
        'property-overview': '物件概要書（詳細版）',
        'loan-simulation': '融資提案書',
        'important-matters': '重要事項説明書（案）',
        'sales-contract': '売買契約書（案）'
    };
    return titles[type] || 'ドキュメント';
}

// ファイル名取得
function getFileName(type) {
    const names = {
        'property-overview': '南青山プリズムビル_物件概要書.pdf',
        'loan-simulation': '南青山プリズムビル_融資提案書.pdf',
        'important-matters': '南青山プリズムビル_重要事項説明書.pdf',
        'sales-contract': '南青山プリズムビル_売買契約書.pdf'
    };
    return names[type] || 'document.pdf';
}

// コンテンツ取得
function getContent(type) {
    if (type === 'property-overview') {
        return `
            <h2>1. 物件基本情報</h2>
            <table>
                <tr><th>物件名称</th><td>南青山プリズムビル</td></tr>
                <tr><th>所在地</th><td>東京都港区南青山5-10-5</td></tr>
                <tr><th>交通</th><td>表参道駅 徒歩3分</td></tr>
                <tr><th>竣工年月</th><td>2019年3月</td></tr>
                <tr><th>構造</th><td>鉄骨鉄筋コンクリート造 8階建</td></tr>
                <tr><th>敷地面積</th><td>234.56㎡</td></tr>
                <tr><th>建物面積</th><td>1,234.56㎡</td></tr>
            </table>
            <h2>2. 賃貸状況</h2>
            <p>稼働率: 100%</p>
            <p>月額賃料収入: 10,265,360円</p>
        `;
    } else if (type === 'loan-simulation') {
        return `
            <h2>融資条件</h2>
            <table>
                <tr><th>物件価格</th><td>18億5,000万円</td></tr>
                <tr><th>借入額</th><td>14億8,000万円（LTV 80%）</td></tr>
                <tr><th>自己資金</th><td>3億7,000万円</td></tr>
                <tr><th>借入期間</th><td>25年</td></tr>
                <tr><th>想定金利</th><td>1.2%～1.5%</td></tr>
            </table>
            <h2>返済シミュレーション</h2>
            <p>月額返済額: 約560万円</p>
            <p>年間返済額: 約6,700万円</p>
        `;
    }
    return '<p>ドキュメント内容</p>';
}