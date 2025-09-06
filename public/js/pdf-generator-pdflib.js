// pdf-libを使用した日本語対応PDF生成モジュール

class PDFGeneratorPdfLib {
    constructor() {
        this.loadPdfLib();
    }

    // pdf-libライブラリを動的に読み込み
    async loadPdfLib() {
        if (typeof window.PDFLib === 'undefined') {
            // pdf-libをCDNから読み込み
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
            document.head.appendChild(script);
            
            // fontkitもCDNから読み込み
            const fontkitScript = document.createElement('script');
            fontkitScript.src = 'https://unpkg.com/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js';
            document.head.appendChild(fontkitScript);
            
            return new Promise((resolve) => {
                script.onload = () => {
                    fontkitScript.onload = () => {
                        console.log('pdf-lib and fontkit loaded');
                        resolve();
                    };
                };
            });
        }
    }

    // 物件概要書PDF生成（pdf-lib版）
    async generatePropertyOverview() {
        await this.loadPdfLib();
        
        const { PDFDocument, rgb, StandardFonts, degrees, PageSizes } = PDFLib;
        
        // 新しいPDFドキュメントを作成
        const pdfDoc = await PDFDocument.create();
        
        // fontkitを登録
        pdfDoc.registerFontkit(fontkit);
        
        // 日本語フォントを読み込み
        let notoFont;
        try {
            // Noto Sans JPフォント（Google Fontsから直接）
            const fontUrl = 'https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf';
            const fontResponse = await fetch(fontUrl);
            
            if (!fontResponse.ok) {
                throw new Error('Font fetch failed');
            }
            
            const fontBytes = await fontResponse.arrayBuffer();
            
            // フォントを埋め込み（subset: falseを明示的に指定）
            notoFont = await pdfDoc.embedFont(fontBytes, { subset: false });
            
            console.log('Japanese font loaded successfully');
        } catch (error) {
            console.error('Failed to load Japanese font:', error);
            // フォールバック: 標準フォントを使用
            notoFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }
        
        // 標準フォントも読み込み
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // A4サイズのページを追加
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
        const { width, height } = page.getSize();
        
        // ブランドカラー
        const colors = {
            primary: rgb(26/255, 54/255, 93/255),
            primaryLight: rgb(70/255, 130/255, 180/255),
            white: rgb(1, 1, 1),
            text: rgb(51/255, 51/255, 51/255),
            textLight: rgb(102/255, 102/255, 102/255),
            background: rgb(248/255, 249/255, 250/255)
        };
        
        // ヘッダー背景（シンプルな青背景）
        page.drawRectangle({
            x: 0,
            y: height - 60,
            width: width,
            height: 60,
            color: colors.primary,
        });
        
        // ヘッダー下部にアクセントライン
        page.drawRectangle({
            x: 0,
            y: height - 62,
            width: width,
            height: 2,
            color: colors.primaryLight,
        });
        
        // ドキュメント名（左上）
        page.drawText('物件概要書', {
            x: 50,
            y: height - 40,
            size: 18,
            font: notoFont,
            color: colors.white,
        });
        
        // PRISMロゴ画像を右上に配置
        try {
            const logoUrl = '/assets/images/logo/prism-white.png';
            const logoResponse = await fetch(logoUrl);
            
            if (logoResponse.ok) {
                const logoBytes = await logoResponse.arrayBuffer();
                const logoImage = await pdfDoc.embedPng(logoBytes);
                
                // ロゴのサイズを小さく調整
                const logoDims = logoImage.scale(0.12);
                
                page.drawImage(logoImage, {
                    x: width - logoDims.width - 50,
                    y: height - 50,
                    width: logoDims.width,
                    height: logoDims.height,
                });
            }
        } catch (error) {
            console.error('Failed to load logo:', error);
        }
        
        // 物件名と住所（白い背景の上部）
        let yPos = height - 90;
        
        // 物件名（大きく表示）
        page.drawText('南青山プリズムビル', {
            x: 50,
            y: yPos,
            size: 24,
            font: notoFont,
            color: colors.primary,
        });
        
        yPos -= 25;
        
        // 住所
        page.drawText('東京都港区南青山3-15-8', {
            x: 50,
            y: yPos,
            size: 12,
            font: notoFont,
            color: colors.text,
        });
        
        yPos -= 20;
        
        // 区切り線
        page.drawLine({
            start: { x: 50, y: yPos },
            end: { x: width - 50, y: yPos },
            thickness: 1,
            color: rgb(0.9, 0.9, 0.9),
        });
        
        // 物件写真セクション
        yPos -= 30;
        
        // 物件写真を追加（実際の写真があれば）
        try {
            const photoUrl = '/assets/images/properties/001/main.jpg';
            const photoResponse = await fetch(photoUrl);
            
            if (photoResponse.ok) {
                const photoBytes = await photoResponse.arrayBuffer();
                const photoImage = await pdfDoc.embedJpg(photoBytes);
                
                // 写真のサイズを調整
                const photoDims = photoImage.scale(0.4);
                
                // 中央に配置
                page.drawImage(photoImage, {
                    x: (width - photoDims.width) / 2,
                    y: yPos - photoDims.height,
                    width: photoDims.width,
                    height: photoDims.height,
                });
                
                yPos -= photoDims.height + 20;
            }
        } catch (error) {
            console.log('Property photo not available');
        }
        
        // セクションタイトル（投資ハイライト）
        // 左側にアクセントライン
        page.drawRectangle({
            x: 40,
            y: yPos - 25,
            width: 4,
            height: 25,
            color: colors.primaryLight,
        });
        
        page.drawText('投資ハイライト', {
            x: 55,
            y: yPos - 20,
            size: 16,
            font: notoFont,
            color: colors.primary,
        });
        
        // セクション下線
        page.drawLine({
            start: { x: 40, y: yPos - 30 },
            end: { x: width - 40, y: yPos - 30 },
            thickness: 0.5,
            color: rgb(0.85, 0.85, 0.85),
        });
        
        yPos -= 45;
        
        // 投資ハイライトの内容（カード風デザイン）
        const highlights = [
            { icon: '📍', text: '表参道駅徒歩5分の一等地立地' },
            { icon: '🏢', text: '2019年築・新耐震基準適合の築浅物件' },
            { icon: '📈', text: '表面利回り9.0%（満室時10.8%の高利回り）' },
            { icon: '💰', text: 'NOI利回り6.9%・安定収益' },
            { icon: '📊', text: '現在稼働率83.3%・満室へのアップサイド' },
            { icon: '⭐', text: '高級ブランド・IT企業等の優良テナント' }
        ];
        
        // ハイライトを2列で表示
        let columnX = 60;
        let columnY = yPos;
        
        for (let i = 0; i < highlights.length; i++) {
            const highlight = highlights[i];
            
            // 背景ボックス
            page.drawRectangle({
                x: columnX - 10,
                y: columnY - 18,
                width: 250,
                height: 22,
                color: i % 2 === 0 ? colors.background : rgb(1, 1, 1),
                borderColor: rgb(0.9, 0.9, 0.9),
                borderWidth: 0.5,
            });
            
            // チェックマーク
            page.drawText('✓', {
                x: columnX,
                y: columnY - 12,
                size: 10,
                font: notoFont,
                color: colors.primaryLight,
            });
            
            page.drawText(highlight.text, {
                x: columnX + 20,
                y: columnY - 12,
                size: 10,
                font: notoFont,
                color: colors.text,
            });
            
            if (i === 2) {
                // 3つ目の後で右列に移動
                columnX = 320;
                columnY = yPos;
            } else if (i < 2) {
                columnY -= 28;
            } else {
                columnY -= 28;
            }
        }
        
        yPos = Math.min(columnY, yPos - 90);
        
        // 物件詳細情報セクション
        yPos -= 30;
        
        // セクションタイトル（物件詳細情報）
        // 左側にアクセントライン
        page.drawRectangle({
            x: 40,
            y: yPos - 25,
            width: 4,
            height: 25,
            color: colors.primaryLight,
        });
        
        page.drawText('物件詳細情報', {
            x: 55,
            y: yPos - 20,
            size: 16,
            font: notoFont,
            color: colors.primary,
        });
        
        // セクション下線
        page.drawLine({
            start: { x: 40, y: yPos - 30 },
            end: { x: width - 40, y: yPos - 30 },
            thickness: 0.5,
            color: rgb(0.85, 0.85, 0.85),
        });
        
        yPos -= 45;
        
        // 物件詳細をテーブル形式で表示（よりプロフェッショナルなデザイン）
        const propertyDetails = [
            { label: '物件名称', value: '南青山プリズムビル', highlight: true },
            { label: '所在地', value: '東京都港区南青山' },
            { label: '最寄駅', value: '東京メトロ表参道駅 徒歩5分' },
            { label: '築年月', value: '2019年（築5年）' },
            { label: '構造・階数', value: '鉄骨造 地上5階建' },
            { label: '延床面積', value: '495㎡' },
            { label: '土地面積', value: '180㎡' },
            { label: '現在稼働率', value: '83.3%（6室中5室入居）', highlight: true },
            { label: '月額賃料収入', value: '289万円' },
            { label: '年間賃料収入', value: '3,468万円' },
            { label: '売買価格', value: '3億8,500万円', highlight: true },
            { label: '表面利回り', value: '9.0%', highlight: true }
        ];
        
        for (let i = 0; i < propertyDetails.length; i++) {
            const detail = propertyDetails[i];
            
            // 背景デザイン
            if (detail.highlight) {
                // 重要項目は薄い青背景
                page.drawRectangle({
                    x: 45,
                    y: yPos - 24,
                    width: width - 90,
                    height: 26,
                    color: rgb(0.95, 0.97, 1),
                    borderColor: colors.primaryLight,
                    borderWidth: 0.5,
                });
            } else if (i % 2 === 0) {
                // 通常項目は交互に背景色
                page.drawRectangle({
                    x: 45,
                    y: yPos - 24,
                    width: width - 90,
                    height: 26,
                    color: colors.background,
                });
            }
            
            // 左側のライン
            page.drawLine({
                start: { x: 45, y: yPos - 24 },
                end: { x: 45, y: yPos + 2 },
                thickness: 2,
                color: detail.highlight ? colors.primaryLight : rgb(0.9, 0.9, 0.9),
            });
            
            // ラベル
            page.drawText(detail.label, {
                x: 60,
                y: yPos - 15,
                size: 11,
                font: notoFont,
                color: detail.highlight ? colors.primary : colors.text,
            });
            
            // コロン
            page.drawText(':', {
                x: 200,
                y: yPos - 15,
                size: 11,
                font: notoFont,
                color: colors.textLight,
            });
            
            // 値
            page.drawText(detail.value, {
                x: 220,
                y: yPos - 15,
                size: 11,
                font: notoFont,
                color: detail.highlight ? colors.primary : colors.text,
            });
            
            yPos -= 28;
            
            // ページが足りなくなったら新しいページを追加
            if (yPos < 100) {
                const newPage = pdfDoc.addPage([595.28, 841.89]);
                page = newPage;  // ページ参照を更新
                yPos = height - 50;
            }
        }
        
        // フッター
        const pageCount = pdfDoc.getPageCount();
        const pages = pdfDoc.getPages();
        
        for (let i = 0; i < pageCount; i++) {
            const currentPage = pages[i];
            const pageHeight = currentPage.getSize().height;
            
            // フッターライン
            currentPage.drawLine({
                start: { x: 50, y: 50 },
                end: { x: width - 50, y: 50 },
                thickness: 1,
                color: colors.primary,
            });
            
            // ページ番号
            currentPage.drawText(`${i + 1} / ${pageCount}`, {
                x: width / 2 - 15,
                y: 30,
                size: 9,
                font: helveticaBold,
                color: colors.textLight,
            });
            
            // 日付
            const now = new Date();
            const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日作成`;
            currentPage.drawText(dateStr, {
                x: width - 150,
                y: 30,
                size: 9,
                font: notoFont,
                color: colors.textLight,
            });
        }
        
        // PDFをダウンロード
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '南青山プリズムビル_物件概要書.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// グローバルに公開
window.PDFGeneratorPdfLib = PDFGeneratorPdfLib;