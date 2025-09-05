// PRISM VIP PDF生成APIエンドポイント
// 複数ユーザーが同じ物件資料を閲覧するため、物件ベースのキャッシュを実装

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// キャッシュディレクトリ
const CACHE_DIR = path.join(process.cwd(), '.cache', 'pdf');

// PDFキャッシュ設定
const CACHE_CONFIG = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
    checkInterval: 60 * 60 * 1000,    // 1時間ごとに期限切れチェック
};

/**
 * キャッシュキーを生成
 * 物件IDとドキュメントタイプから一意のキーを生成
 */
function generateCacheKey(propertyId, docType, stage) {
    const data = `${propertyId}-${docType}-${stage}`;
    return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * キャッシュからPDFを取得
 */
async function getCachedPDF(cacheKey) {
    try {
        const filePath = path.join(CACHE_DIR, `${cacheKey}.pdf`);
        const metaPath = path.join(CACHE_DIR, `${cacheKey}.meta.json`);
        
        // メタデータを確認
        const metaData = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
        
        // 有効期限チェック
        if (Date.now() - metaData.created > CACHE_CONFIG.maxAge) {
            // 期限切れの場合は削除
            await fs.unlink(filePath).catch(() => {});
            await fs.unlink(metaPath).catch(() => {});
            return null;
        }
        
        // キャッシュからPDFを読み込み
        const pdfBuffer = await fs.readFile(filePath);
        console.log(`[Cache Hit] Key: ${cacheKey}, Created: ${new Date(metaData.created).toISOString()}`);
        
        // アクセス回数を更新
        metaData.accessCount = (metaData.accessCount || 0) + 1;
        metaData.lastAccessed = Date.now();
        await fs.writeFile(metaPath, JSON.stringify(metaData, null, 2));
        
        return pdfBuffer;
    } catch (error) {
        // キャッシュミスまたはエラー
        return null;
    }
}

/**
 * PDFをキャッシュに保存
 */
async function savePDFToCache(cacheKey, pdfBuffer, metadata = {}) {
    try {
        // キャッシュディレクトリを作成
        await fs.mkdir(CACHE_DIR, { recursive: true });
        
        const filePath = path.join(CACHE_DIR, `${cacheKey}.pdf`);
        const metaPath = path.join(CACHE_DIR, `${cacheKey}.meta.json`);
        
        // PDFを保存
        await fs.writeFile(filePath, pdfBuffer);
        
        // メタデータを保存
        const metaData = {
            ...metadata,
            created: Date.now(),
            size: pdfBuffer.length,
            accessCount: 1,
            lastAccessed: Date.now()
        };
        await fs.writeFile(metaPath, JSON.stringify(metaData, null, 2));
        
        console.log(`[Cache Save] Key: ${cacheKey}, Size: ${pdfBuffer.length} bytes`);
    } catch (error) {
        console.error('Cache save error:', error);
    }
}

/**
 * PDFを生成
 */
async function generatePDF(url, options = {}) {
    // Chromiumの設定
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
        
        // ビューポート設定
        await page.setViewport({
            width: 1280,
            height: 1024,
            deviceScaleFactor: 2
        });
        
        // カスタムヘッダー設定（PDF生成モード識別用）
        await page.setExtraHTTPHeaders({
            'X-PDF-Generation': 'true'
        });
        
        // ページ読み込み
        console.log(`Loading page: ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        // PDF専用スタイルを注入
        await page.addStyleTag({
            content: `
                @media print {
                    /* ヘッダー/フッター非表示 */
                    .no-print { display: none !important; }
                    
                    /* 改ページ制御 */
                    .page-break { page-break-after: always; }
                    .avoid-break { page-break-inside: avoid; }
                    
                    /* マージン調整 */
                    body { margin: 0; padding: 20px; }
                    
                    /* 背景色を印刷 */
                    * { -webkit-print-color-adjust: exact !important; }
                }
            `
        });
        
        // コンテンツが完全に表示されるまで待機
        await page.waitForTimeout(2000);
        
        // PDF生成オプション
        const pdfOptions = {
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
                    <span>PRISM VIP - 投資資料</span>
                </div>
            `,
            footerTemplate: `
                <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
                    <span class="pageNumber"></span> / <span class="totalPages"></span>
                </div>
            `,
            preferCSSPageSize: false,
            ...options
        };
        
        // PDF生成
        console.log('Generating PDF...');
        const pdfBuffer = await page.pdf(pdfOptions);
        console.log(`PDF generated: ${pdfBuffer.length} bytes`);
        
        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

/**
 * メインハンドラー
 */
module.exports = async (req, res) => {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // パラメータ取得
        const { propertyId, docType, stage = 5, forceRegenerate = false } = req.query;
        
        // 必須パラメータチェック
        if (!propertyId || !docType) {
            return res.status(400).json({
                error: 'Missing required parameters: propertyId, docType'
            });
        }
        
        // キャッシュキー生成
        const cacheKey = generateCacheKey(propertyId, docType, stage);
        
        // 強制再生成でない場合はキャッシュをチェック
        let pdfBuffer = null;
        if (!forceRegenerate) {
            pdfBuffer = await getCachedPDF(cacheKey);
        }
        
        // キャッシュミスまたは強制再生成の場合
        if (!pdfBuffer) {
            console.log(`[Cache Miss] Generating new PDF for ${propertyId}/${docType}/stage-${stage}`);
            
            // PDF生成URL構築
            const baseUrl = process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}`
                : 'http://localhost:3000';
                
            const pdfUrl = `${baseUrl}/pdf-view/${propertyId}?stage=${stage}&type=${docType}`;
            
            // PDF生成
            pdfBuffer = await generatePDF(pdfUrl);
            
            // キャッシュに保存
            await savePDFToCache(cacheKey, pdfBuffer, {
                propertyId,
                docType,
                stage,
                url: pdfUrl
            });
        }
        
        // ファイル名生成
        const fileName = `PRISM_${propertyId}_${docType}_stage${stage}_${Date.now()}.pdf`;
        
        // レスポンスヘッダー設定
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.setHeader('Cache-Control', 'public, max-age=3600'); // ブラウザ側でも1時間キャッシュ
        
        // PDF送信
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            error: 'PDF generation failed',
            message: error.message
        });
    }
};

/**
 * キャッシュクリーンアップ（定期実行用）
 */
async function cleanupCache() {
    try {
        const files = await fs.readdir(CACHE_DIR);
        const now = Date.now();
        
        for (const file of files) {
            if (!file.endsWith('.meta.json')) continue;
            
            const metaPath = path.join(CACHE_DIR, file);
            const metaData = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
            
            // 期限切れチェック
            if (now - metaData.created > CACHE_CONFIG.maxAge) {
                const pdfPath = metaPath.replace('.meta.json', '.pdf');
                await fs.unlink(pdfPath).catch(() => {});
                await fs.unlink(metaPath).catch(() => {});
                console.log(`[Cache Cleanup] Removed expired cache: ${file}`);
            }
        }
    } catch (error) {
        console.error('Cache cleanup error:', error);
    }
}

// 定期クリーンアップを設定（本番環境のみ）
if (process.env.NODE_ENV === 'production') {
    setInterval(cleanupCache, CACHE_CONFIG.checkInterval);
}