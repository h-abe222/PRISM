// 収支シミュレーションPDF生成モジュール（pdf-lib使用）

class PDFGeneratorFinancial {
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
                        console.log('pdf-lib and fontkit loaded for financial PDF');
                        resolve();
                    };
                };
            });
        }
    }

    // 収支シミュレーションPDF生成
    async generateFinancialSimulation() {
        console.log('PDFGeneratorFinancial: generateFinancialSimulation started');
        await this.loadPdfLib();
        
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        
        // 新しいPDFドキュメントを作成
        const pdfDoc = await PDFDocument.create();
        
        // fontkitを登録
        pdfDoc.registerFontkit(fontkit);
        
        // 日本語フォントを読み込み
        let notoFont;
        try {
            // Noto Sans JPフォント
            const fontUrl = 'https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf';
            const fontResponse = await fetch(fontUrl);
            
            if (!fontResponse.ok) {
                throw new Error('Font fetch failed');
            }
            
            const fontBytes = await fontResponse.arrayBuffer();
            notoFont = await pdfDoc.embedFont(fontBytes, { subset: false });
            
            console.log('Japanese font loaded successfully for financial PDF');
        } catch (error) {
            console.error('Failed to load Japanese font:', error);
            notoFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }
        
        // 標準フォントも読み込み
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // A4サイズのページを追加
        const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 in points
        const { width, height } = page1.getSize();
        
        // ブランドカラー
        const colors = {
            primary: rgb(26/255, 54/255, 93/255),
            primaryLight: rgb(70/255, 130/255, 180/255),
            white: rgb(1, 1, 1),
            text: rgb(51/255, 51/255, 51/255),
            textLight: rgb(102/255, 102/255, 102/255),
            background: rgb(248/255, 249/255, 250/255),
            success: rgb(34/255, 139/255, 34/255),
            warning: rgb(255/255, 165/255, 0/255),
            danger: rgb(220/255, 53/255, 69/255)
        };
        
        // ========== 1ページ目: 表紙 ==========
        // ヘッダー背景（青背景）
        const headerHeight = 100;
        page1.drawRectangle({
            x: 0,
            y: height - headerHeight,
            width: width,
            height: headerHeight,
            color: colors.primary,
        });
        
        // ヘッダー下部にアクセントライン
        page1.drawRectangle({
            x: 0,
            y: height - headerHeight - 2,
            width: width,
            height: 2,
            color: colors.primaryLight,
        });
        
        // PRISMロゴ画像を右上に配置
        let logoTopY = height - 50;
        try {
            const logoUrl = '/assets/images/logo/prism-white.png';
            const logoResponse = await fetch(logoUrl);
            
            if (logoResponse.ok) {
                const logoBytes = await logoResponse.arrayBuffer();
                const logoImage = await pdfDoc.embedPng(logoBytes);
                const logoDims = logoImage.scale(0.08);
                
                page1.drawImage(logoImage, {
                    x: width - logoDims.width - 50,
                    y: logoTopY - logoDims.height,
                    width: logoDims.width,
                    height: logoDims.height,
                });
            }
        } catch (error) {
            console.error('Failed to load logo:', error);
        }
        
        // ドキュメント名（左上）
        page1.drawText('収支シミュレーション', {
            x: 50,
            y: logoTopY - 18,
            size: 24,
            font: notoFont,
            color: colors.white,
        });
        
        // 物件名と住所
        let yPos = height - 175;
        
        // 物件名（大きく表示）
        page1.drawText('南青山プリズムビル', {
            x: 50,
            y: yPos,
            size: 28,
            font: notoFont,
            color: colors.primary,
        });
        
        yPos -= 35;
        
        // 住所
        page1.drawText('東京都港区南青山3-15-8', {
            x: 50,
            y: yPos,
            size: 14,
            font: notoFont,
            color: colors.text,
        });
        
        yPos -= 30;
        
        // 区切り線
        page1.drawLine({
            start: { x: 50, y: yPos },
            end: { x: width - 50, y: yPos },
            thickness: 1,
            color: rgb(0.9, 0.9, 0.9),
        });
        
        yPos -= 40;
        
        // 主要指標（サマリー）
        const summaryTitle = '投資収益サマリー';
        this.drawSectionTitle(page1, summaryTitle, yPos, colors, notoFont);
        yPos -= 45;
        
        // サマリーカード（横並び）
        const summaryCards = [
            { label: '物件価格', value: '3億8,500万円', color: colors.primary },
            { label: '満室想定収入', value: '4,170万円/年', color: colors.success },
            { label: '表面利回り（満室）', value: '10.8%', color: colors.primaryLight },
            { label: 'NOI利回り', value: '8.7%', color: colors.success }
        ];
        
        const cardWidth = (width - 100) / 2 - 10;
        const cardHeight = 80;
        let cardX = 50;
        let cardY = yPos - cardHeight;
        
        for (let i = 0; i < summaryCards.length; i++) {
            const card = summaryCards[i];
            
            // カード背景
            page1.drawRectangle({
                x: cardX,
                y: cardY,
                width: cardWidth,
                height: cardHeight,
                color: colors.background,
                borderColor: card.color,
                borderWidth: 2,
            });
            
            // ラベル
            page1.drawText(card.label, {
                x: cardX + 15,
                y: cardY + cardHeight - 25,
                size: 10,
                font: notoFont,
                color: colors.textLight,
            });
            
            // 値（大きく表示）
            page1.drawText(card.value, {
                x: cardX + 15,
                y: cardY + cardHeight - 50,
                size: 18,
                font: notoFont,
                color: card.color,
            });
            
            // 2列レイアウト
            if (i % 2 === 0) {
                cardX = width / 2 + 5;
            } else {
                cardX = 50;
                cardY -= cardHeight + 10;
            }
        }
        
        // 1ページ目はサマリー情報のみ（チャートは2ページ目に移動）
        
        // ========== 2ページ目: キャッシュフローグラフ＆詳細テーブル ==========
        const page2 = pdfDoc.addPage([595.28, 841.89]);
        
        // 2ページ目のヘッダー（青いロゴ配置）
        try {
            const logoUrl = '/assets/images/logo/prism-blue.png';
            const logoResponse = await fetch(logoUrl);
            
            if (logoResponse.ok) {
                const logoBytes = await logoResponse.arrayBuffer();
                const logoImage = await pdfDoc.embedPng(logoBytes);
                const logoDims = logoImage.scale(0.08);
                const logoTopY = height - 50;
                
                page2.drawImage(logoImage, {
                    x: width - logoDims.width - 50,
                    y: logoTopY - logoDims.height,
                    width: logoDims.width,
                    height: logoDims.height,
                });
                
                yPos = logoTopY - logoDims.height - 30;
            } else {
                yPos = height - 80;
            }
        } catch (error) {
            console.log('Logo not available for page 2');
            yPos = height - 80;
        }
        
        // キャッシュフロー予測グラフ（Chart.jsスタイル）- 2ページ目の上部
        this.drawSectionTitle(page2, '20年間キャッシュフロー予測', yPos, colors, notoFont);
        yPos -= 45;
        
        // Chart.js風の高品質グラフを作成（アスペクト比改善）
        const chartImage = await this.generateChartJSStyleGraph();
        console.log('Chart image generated:', chartImage ? 'success' : 'failed');
        if (chartImage) {
            try {
                console.log('Embedding chart image into PDF on page 2');
                // Chart.jsのUint8ArrayをPDFImageとして埋め込み
                const pdfImage = await pdfDoc.embedPng(chartImage);
                
                // より大きなサイズでアスペクト比を改善
                const chartHeight = 220; // 高さを増加
                const chartWidth = width - 100;
                
                // 中央に配置
                page2.drawImage(pdfImage, {
                    x: 50,
                    y: yPos - chartHeight,
                    width: chartWidth,
                    height: chartHeight,
                });
                
                yPos -= chartHeight + 30;
                console.log('Chart image successfully embedded on page 2');
            } catch (error) {
                console.error('Failed to embed chart image on page 2:', error);
                // フォールバック: シンプルなグラフ表示
                await this.drawFallbackChart(page2, yPos, width, colors, notoFont);
                yPos -= 200;
            }
        } else {
            // フォールバック: シンプルなグラフ表示
            await this.drawFallbackChart(page2, yPos, width, colors, notoFont);
            yPos -= 200;
        }
        
        // 20年間キャッシュフローテーブル
        this.drawSectionTitle(page2, '20年間詳細キャッシュフロー', yPos, colors, notoFont);
        yPos -= 30;
        
        // 20年間キャッシュフローデータを計算
        const cashflowData = [];
        for (let i = 1; i <= 20; i++) {
            const rental = Math.round(4170 * Math.pow(1.005, i - 1));
            const operating = Math.round(813 * Math.pow(1.01, i - 1));
            const noi = rental - operating;
            const loan = 1036;
            const netCF = noi - loan;
            
            cashflowData.push({
                year: i,
                rental: rental,
                operating: -operating,
                noi: noi,
                loan: -loan,
                netCF: netCF
            });
        }
        
        // キャッシュフローテーブルヘッダー
        const tableHeaders = ['年', '賃料収入', '運営費用', 'NOI', 'ローン返済', '純CF'];
        const columnWidths = [35, 75, 75, 75, 80, 75];
        let tableX = 50;
        
        // テーブル全幅を計算
        const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        
        // ヘッダー背景
        page2.drawRectangle({
            x: tableX,
            y: yPos - 30,
            width: tableWidth,
            height: 30,
            color: colors.primary,
        });
        
        // ヘッダーテキスト
        let headerX = tableX + 10;
        for (let i = 0; i < tableHeaders.length; i++) {
            page2.drawText(tableHeaders[i], {
                x: headerX,
                y: yPos - 20,
                size: 10,
                font: notoFont,
                color: colors.white,
            });
            headerX += columnWidths[i];
        }
        
        yPos -= 30;
        
        // キャッシュフローテーブル行（20年間、10行ずつ表示して収まるように調整）
        const rowsPerPage = Math.min(10, cashflowData.length);
        for (let i = 0; i < rowsPerPage; i++) {
            const cfData = cashflowData[i];
            const isEvenRow = i % 2 === 0;
            
            // 行背景
            page2.drawRectangle({
                x: tableX,
                y: yPos - 25,
                width: tableWidth,
                height: 25,
                color: isEvenRow ? colors.background : colors.white,
                borderColor: rgb(0.9, 0.9, 0.9),
                borderWidth: 0.5,
            });
            
            // データ表示
            let dataX = tableX + 5;
            const rowData = [
                `${cfData.year}年`,
                `${cfData.rental.toLocaleString()}万`,
                `${cfData.operating.toLocaleString()}万`,
                `${cfData.noi.toLocaleString()}万`,
                `${cfData.loan.toLocaleString()}万`,
                `${cfData.netCF.toLocaleString()}万`
            ];
            
            for (let j = 0; j < rowData.length; j++) {
                const textColor = j === 5 ? (cfData.netCF > 0 ? colors.success : colors.danger) : colors.text;
                page2.drawText(rowData[j], {
                    x: dataX,
                    y: yPos - 15,
                    size: 8,
                    font: notoFont,
                    color: textColor,
                });
                dataX += columnWidths[j];
            }
            
            yPos -= 25;
        }
        
        // 残りの10年間（11-20年）を表示するスペースがあれば続行
        if (yPos > 100 && cashflowData.length > 10) {
            yPos -= 10;
            page2.drawText('※11年目以降のデータは3ページ目に続く', {
                x: tableX,
                y: yPos,
                size: 9,
                font: notoFont,
                color: colors.textLight,
            });
        }
        
        // ========== 3ページ目: 20年間キャッシュフロー ==========
        const page3 = pdfDoc.addPage([595.28, 841.89]);
        
        // 3ページ目のヘッダー（青いロゴ配置）
        try {
            const logoUrl = '/assets/images/logo/prism-blue.png';
            const logoResponse = await fetch(logoUrl);
            
            if (logoResponse.ok) {
                const logoBytes = await logoResponse.arrayBuffer();
                const logoImage = await pdfDoc.embedPng(logoBytes);
                const logoDims = logoImage.scale(0.08);
                const logoTopY = height - 50;
                
                page3.drawImage(logoImage, {
                    x: width - logoDims.width - 50,
                    y: logoTopY - logoDims.height,
                    width: logoDims.width,
                    height: logoDims.height,
                });
                
                yPos = logoTopY - logoDims.height - 5;
            } else {
                yPos = height - 50;
            }
        } catch (error) {
            console.log('Logo not available for page 3');
            yPos = height - 50;
        }
        
        // 20年間キャッシュフロー詳細テーブル（11-20年）
        this.drawSectionTitle(page3, '20年間キャッシュフロー詳細（11-20年）', yPos, colors, notoFont);
        yPos -= 30;
        
        // 11-20年のキャッシュフローテーブルヘッダー（2ページ目と同じ形式）
        const cfHeaders = ['年', '賃料収入', '運営費用', 'NOI', 'ローン返済', '純CF'];
        const cfColWidths = [35, 75, 75, 75, 80, 75];
        const cfTableWidth = cfColWidths.reduce((sum, width) => sum + width, 0);
        
        // ヘッダー背景
        page3.drawRectangle({
            x: 50,
            y: yPos - 30,
            width: cfTableWidth,
            height: 30,
            color: colors.primary,
        });
        
        // ヘッダーテキスト
        let cfHeaderX = 55;
        for (let i = 0; i < cfHeaders.length; i++) {
            page3.drawText(cfHeaders[i], {
                x: cfHeaderX,
                y: yPos - 20,
                size: 10,
                font: notoFont,
                color: colors.white,
            });
            cfHeaderX += cfColWidths[i];
        }
        
        yPos -= 30;
        
        // 11-20年のキャッシュフローテーブル行
        const remainingData = cashflowData.slice(10); // 11-20年目のデータ
        for (let i = 0; i < remainingData.length; i++) {
            const cfData = remainingData[i];
            const isEvenRow = i % 2 === 0;
            
            // 行背景
            page3.drawRectangle({
                x: 50,
                y: yPos - 25,
                width: cfTableWidth,
                height: 25,
                color: isEvenRow ? colors.background : colors.white,
                borderColor: rgb(0.9, 0.9, 0.9),
                borderWidth: 0.5,
            });
            
            // データ表示
            let dataX = 55;
            const rowData = [
                `${cfData.year}年`,
                `${cfData.rental.toLocaleString()}万`,
                `${cfData.operating.toLocaleString()}万`,
                `${cfData.noi.toLocaleString()}万`,
                `${cfData.loan.toLocaleString()}万`,
                `${cfData.netCF.toLocaleString()}万`
            ];
            
            for (let j = 0; j < rowData.length; j++) {
                const textColor = j === 5 ? (cfData.netCF > 0 ? colors.success : colors.danger) : colors.text;
                page3.drawText(rowData[j], {
                    x: dataX,
                    y: yPos - 15,
                    size: 8,
                    font: notoFont,
                    color: textColor,
                });
                dataX += cfColWidths[j];
            }
            
            yPos -= 25;
        }
        
        // 単位注記
        page3.drawText('※単位：万円', {
            x: width - 100,
            y: yPos - 10,
            size: 8,
            font: notoFont,
            color: colors.textLight,
        });
        
        yPos -= 40;
        
        // 運営費用の内訳
        this.drawSectionTitle(page3, '運営費用内訳（年間）', yPos, colors, notoFont);
        yPos -= 45;
        
        // 運営費用の詳細
        const expenseData = [
            { category: '管理費', amount: '200万円', percentage: '24.6%', description: 'ビル管理・清掃・警備' },
            { category: '修繕積立金', amount: '150万円', percentage: '18.5%', description: '大規模修繕への積立' },
            { category: '固定資産税・都市計画税', amount: '350万円', percentage: '43.1%', description: '土地・建物の税金' },
            { category: '保険料', amount: '45万円', percentage: '5.5%', description: '火災保険・地震保険' },
            { category: 'その他経費', amount: '68万円', percentage: '8.3%', description: '水道光熱費・雑費等' }
        ];
        
        for (const expense of expenseData) {
            // 背景
            page3.drawRectangle({
                x: 50,
                y: yPos - 30,
                width: width - 100,
                height: 30,
                color: colors.background,
                borderColor: rgb(0.9, 0.9, 0.9),
                borderWidth: 0.5,
            });
            
            // カテゴリー
            page3.drawText(expense.category, {
                x: 60,
                y: yPos - 13,
                size: 10,
                font: notoFont,
                color: colors.primary,
            });
            
            // 金額
            page3.drawText(expense.amount, {
                x: 180,
                y: yPos - 13,
                size: 10,
                font: notoFont,
                color: colors.text,
            });
            
            // 割合
            page3.drawText(expense.percentage, {
                x: 260,
                y: yPos - 13,
                size: 9,
                font: notoFont,
                color: colors.textLight,
            });
            
            // 説明
            page3.drawText(expense.description, {
                x: 320,
                y: yPos - 13,
                size: 8,
                font: notoFont,
                color: colors.textLight,
            });
            
            yPos -= 32;
        }
        
        // 合計
        page3.drawRectangle({
            x: 50,
            y: yPos - 35,
            width: width - 100,
            height: 35,
            color: colors.danger,
        });
        
        page3.drawText('年間運営費用合計', {
            x: 60,
            y: yPos - 17,
            size: 12,
            font: notoFont,
            color: colors.white,
        });
        
        page3.drawText('813万円', {
            x: 180,
            y: yPos - 17,
            size: 12,
            font: notoFont,
            color: colors.white,
        });
        
        page3.drawText('（賃料収入の19.5%）', {
            x: 260,
            y: yPos - 17,
            size: 10,
            font: notoFont,
            color: colors.white,
        });
        
        // ========== 4ページ目: 投資分析 ==========
        const page4 = pdfDoc.addPage([595.28, 841.89]);
        
        // 4ページ目のヘッダー（青いロゴ配置）
        try {
            const logoUrl = '/assets/images/logo/prism-blue.png';
            const logoResponse = await fetch(logoUrl);
            
            if (logoResponse.ok) {
                const logoBytes = await logoResponse.arrayBuffer();
                const logoImage = await pdfDoc.embedPng(logoBytes);
                const logoDims = logoImage.scale(0.08);
                const logoTopY = height - 50;
                
                page4.drawImage(logoImage, {
                    x: width - logoDims.width - 50,
                    y: logoTopY - logoDims.height,
                    width: logoDims.width,
                    height: logoDims.height,
                });
                
                yPos = logoTopY - logoDims.height - 5;
            } else {
                yPos = height - 50;
            }
        } catch (error) {
            console.log('Logo not available for page 4');
            yPos = height - 50;
        }
        
        // 投資分析セクション
        this.drawSectionTitle(page4, '投資収益性分析', yPos, colors, notoFont);
        yPos -= 45;
        
        // 主要投資指標
        const investmentMetrics = [
            { label: '投資金額', value: '3億8,500万円', highlight: true },
            { label: '表面利回り（満室時）', value: '10.8%', highlight: true },
            { label: '実質利回り（満室時NOI）', value: '8.7%' },
            { label: '現在の表面利回り', value: '8.6%' },
            { label: '現在の実質利回り', value: '6.9%' },
            { label: '投資回収期間（満室時）', value: '11.5年', highlight: true },
            { label: '20年累計キャッシュフロー', value: '4億9,680万円', highlight: true },
            { label: '20年後売却想定価格', value: '3億5,000万円' },
            { label: '20年トータルリターン', value: '229%', highlight: true }
        ];
        
        for (const metric of investmentMetrics) {
            this.drawDetailRow(page4, metric, yPos, width, colors, notoFont);
            yPos -= 30;
        }
        
        yPos -= 20;
        
        // シミュレーション条件
        this.drawSectionTitle(page4, 'シミュレーション条件', yPos, colors, notoFont);
        yPos -= 45;
        
        const assumptions = [
            '賃料上昇率: 年率0.5%（インフレ連動）',
            '空室率: 初年度20%、2年目以降5%想定',
            '運営費用上昇率: 年率1.0%',
            '金利: 変動金利2.0%（35年ローン、自己資金30%）',
            '借入額: 2億6,950万円（LTV70%）',
            '年間返済額: 1,036万円（元利均等返済）',
            '売却時期: 20年後を想定',
            '売却時キャップレート: 5.5%想定'
        ];
        
        for (const assumption of assumptions) {
            page4.drawText('•', {
                x: 60,
                y: yPos,
                size: 10,
                font: notoFont,
                color: colors.text,
            });
            
            page4.drawText(assumption, {
                x: 75,
                y: yPos,
                size: 9,
                font: notoFont,
                color: colors.text,
            });
            
            yPos -= 20;
        }
        
        // フッター（全ページ共通）
        const pageCount = pdfDoc.getPageCount();
        const pages = pdfDoc.getPages();
        
        for (let i = 0; i < pageCount; i++) {
            const currentPage = pages[i];
            
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
            
            // PRISM copyright
            currentPage.drawText('© PRISM - Premium Real Estate Investment Solutions', {
                x: 50,
                y: 30,
                size: 8,
                font: helveticaBold,
                color: colors.textLight,
            });
        }
        
        // PDFをダウンロード
        console.log('Saving PDF document');
        const pdfBytes = await pdfDoc.save();
        console.log('PDF saved, size:', pdfBytes.length, 'bytes');
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '南青山プリズムビル_収支シミュレーション_20年.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    // Chart.js風の高品質グラフを生成
    async generateChartJSStyleGraph() {
        console.log('generateChartJSStyleGraph: Starting Chart.js generation');
        try {
            // Chart.jsが利用可能かチェック
            if (typeof window.Chart === 'undefined') {
                console.log('Chart.js not available, will use fallback');
                return null;
            }
            console.log('Chart.js is available, proceeding with chart generation');
            
            // 高解像度キャンバスを作成
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 高品質設定（アスペクト比改善）
            const scale = 2; // 高解像度用
            canvas.width = 800 * scale;
            canvas.height = 500 * scale; // 高さを増加してアスペクト比改善
            canvas.style.width = '800px';
            canvas.style.height = '500px';
            ctx.scale(scale, scale);
            
            // 実際のキャッシュフローデータ
            const cashFlowData = [
                2321, 2334, 2347, 2359, 2372, // 1-5年
                2385, 2398, 2411, 2424, 2435, // 6-10年  
                2448, 2461, 2474, 2487, 2499, // 11-15年
                2512, 2525, 2538, 2551, 2563  // 16-20年
            ];
            
            // 詳細な収支データ（HTMLページと完全一致）
            const rentIncome = [];
            const operatingCosts = [];
            const noiData = [];
            const loanPayments = Array(20).fill(-1036);
            const netCashFlow = [];
            
            // HTMLページと同じ計算式を使用
            for (let i = 1; i <= 20; i++) {
                // 賃料収入（年0.5%上昇）
                const rental = Math.round(4170 * Math.pow(1.005, i - 1));
                rentIncome.push(rental);
                
                // 運営費用（年1%上昇）
                const operating = Math.round(813 * Math.pow(1.01, i - 1));
                operatingCosts.push(-operating);  // マイナス値として格納
                
                // NOI = 賃料収入 - 運営費用
                const noi = rental - operating;
                noiData.push(noi);
                
                // 純CF = NOI - ローン返済
                netCashFlow.push(noi - 1036);
            }
            const cumulativeCF = netCashFlow.reduce((acc, cf, i) => {
                acc.push(i === 0 ? cf : acc[i-1] + cf);
                return acc;
            }, []);

            // Chart.jsで複合チャート作成（HTMLページと同じ構成）
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Array.from({length: 20}, (_, i) => `${i + 1}年`),
                    datasets: [
                        // 賃料収入（積み上げ棒グラフ）
                        {
                            label: '賃料収入',
                            data: rentIncome,
                            backgroundColor: 'rgba(54, 162, 235, 0.7)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            stack: 'stack1'
                        },
                        // 運営費用（積み上げ棒グラフ・負の値）
                        {
                            label: '運営費用',
                            data: operatingCosts,
                            backgroundColor: 'rgba(255, 99, 132, 0.7)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            stack: 'stack1'
                        },
                        // ローン返済（積み上げ棒グラフ・負の値）
                        {
                            label: 'ローン返済',
                            data: loanPayments,
                            backgroundColor: 'rgba(255, 159, 64, 0.7)',
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 1,
                            stack: 'stack1'
                        },
                        // NOI（積み上げ棒グラフ）
                        {
                            label: 'NOI',
                            data: noiData,
                            backgroundColor: 'rgba(75, 192, 192, 0.7)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            stack: 'stack1'
                        },
                        // 純CF（積み上げ棒グラフ）
                        {
                            label: '純CF',
                            data: netCashFlow,
                            backgroundColor: 'rgba(153, 102, 255, 0.7)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                            stack: 'stack1'
                        },
                        // 累計CF（線グラフ）
                        {
                            label: '累計CF',
                            data: cumulativeCF,
                            type: 'line',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderWidth: 3,
                            fill: false,
                            yAxisID: 'y1',
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: false,
                    animation: {
                        duration: 0
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: 11
                                },
                                usePointStyle: true,
                                padding: 15
                            }
                        },
                        title: {
                            display: true,
                            text: '20年間キャッシュフロー推移',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: 20
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: true,
                                color: 'rgba(0,0,0,0.1)'
                            },
                            ticks: {
                                color: '#333',
                                font: {
                                    size: 10
                                },
                                callback: function(value, index) {
                                    return index % 2 === 0 ? this.getLabelForValue(value) : '';
                                }
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            grid: {
                                color: 'rgba(0,0,0,0.1)',
                                lineWidth: 1
                            },
                            ticks: {
                                color: '#333',
                                font: {
                                    size: 10
                                }
                            },
                            title: {
                                display: true,
                                text: 'キャッシュフロー（万円）',
                                font: {
                                    size: 11
                                }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false,
                            },
                            ticks: {
                                color: '#333',
                                font: {
                                    size: 10
                                }
                            },
                            title: {
                                display: true,
                                text: '累計キャッシュフロー（万円）',
                                font: {
                                    size: 11
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            });
            
            // チャートの描画完了を待つ
            await new Promise(resolve => {
                chart.update('none');
                setTimeout(resolve, 100);
            });
            
            // 高品質画像として取得
            const imageData = canvas.toDataURL('image/png');
            const base64Data = imageData.split(',')[1];
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            console.log('Chart.js generation successful, image size:', imageBytes.length);
            
            // Chart.jsインスタンスをクリーンアップ
            chart.destroy();
            canvas.remove();
            
            return imageBytes;
            
        } catch (error) {
            console.error('Chart.js graph generation failed:', error);
            return null;
        }
    }
    
    // フォールバック用のシンプルグラフ描画
    async drawFallbackChart(page, yPos, width, colors, font) {
        const { rgb } = PDFLib;
        
        // グラフエリア
        const graphHeight = 180;
        const graphLeft = 70;
        const graphRight = width - 70;
        const graphBottom = yPos - graphHeight + 30;
        const graphTop = yPos - 30;
        const graphWidth = graphRight - graphLeft;
        
        // 背景
        page.drawRectangle({
            x: graphLeft - 20,
            y: graphBottom - 20,
            width: graphWidth + 40,
            height: graphHeight,
            color: colors.white,
            borderColor: colors.primaryLight,
            borderWidth: 1,
        });
        
        // 実際のキャッシュフローデータ（HTMLページの計算式を使用）
        const cashFlowData = [];
        for (let i = 1; i <= 20; i++) {
            const rental = Math.round(4170 * Math.pow(1.005, i - 1));
            const operating = Math.round(813 * Math.pow(1.01, i - 1));
            const noi = rental - operating;
            const netCF = noi - 1036;
            cashFlowData.push(netCF);
        }
        // 最初の10年分のデータ（フォールバックグラフ用）
        const first10Years = cashFlowData.slice(0, 10);
        
        // スケール設定（動的に計算）
        const minCF = Math.min(...first10Years) - 100;
        const maxCF = Math.max(...first10Years) + 100;
        const cfRange = maxCF - minCF;
        const graphInnerHeight = graphTop - graphBottom;
        const barWidth = graphWidth / 20;
        
        // Y軸グリッド線（動的に生成）
        const gridStep = Math.round(cfRange / 6);
        const yGridValues = [];
        for (let i = 0; i <= 6; i++) {
            yGridValues.push(Math.round(minCF + (gridStep * i)));
        }
        for (const gridValue of yGridValues) {
            const gridY = graphBottom + ((gridValue - minCF) / cfRange) * graphInnerHeight;
            
            page.drawLine({
                start: { x: graphLeft, y: gridY },
                end: { x: graphRight, y: gridY },
                thickness: 0.5,
                color: rgb(0.9, 0.9, 0.9),
            });
            
            page.drawText(gridValue.toString(), {
                x: graphLeft - 35,
                y: gridY - 3,
                size: 8,
                font: font,
                color: colors.text,
            });
        }
        
        // バー描画
        for (let i = 0; i < 20; i++) {
            const cf = cashFlowData[i];
            const barX = graphLeft + i * barWidth + 2;
            const barHeight = ((cf - minCF) / cfRange) * graphInnerHeight;
            const barY = graphBottom;
            
            let barColor;
            if (i < 5) {
                barColor = rgb(0.27, 0.51, 0.71);
            } else if (i < 10) {
                barColor = rgb(0.35, 0.60, 0.80);
            } else if (i < 15) {
                barColor = rgb(0.32, 0.70, 0.55);
            } else {
                barColor = rgb(0.20, 0.75, 0.45);
            }
            
            page.drawRectangle({
                x: barX,
                y: barY,
                width: barWidth - 4,
                height: barHeight,
                color: barColor,
            });
            
            // 年ラベル（2年ごと）
            if (i % 2 === 0) {
                page.drawText(`${i + 1}`, {
                    x: barX,
                    y: graphBottom - 15,
                    size: 7,
                    font: font,
                    color: colors.text,
                });
            }
        }
        
        // 軸描画
        page.drawLine({
            start: { x: graphLeft, y: graphBottom },
            end: { x: graphLeft, y: graphTop },
            thickness: 2,
            color: colors.text,
        });
        
        page.drawLine({
            start: { x: graphLeft, y: graphBottom },
            end: { x: graphRight, y: graphBottom },
            thickness: 2,
            color: colors.text,
        });
    }
    
    // セクションタイトルを描画するヘルパー関数
    drawSectionTitle(page, title, yPos, colors, font) {
        const { rgb } = PDFLib;
        
        // 左側にアクセントライン
        page.drawRectangle({
            x: 50,
            y: yPos - 25,
            width: 4,
            height: 25,
            color: colors.primaryLight,
        });
        
        page.drawText(title, {
            x: 65,
            y: yPos - 20,
            size: 16,
            font: font,
            color: colors.primary,
        });
        
        // セクション下線
        page.drawLine({
            start: { x: 50, y: yPos - 30 },
            end: { x: page.getSize().width - 50, y: yPos - 30 },
            thickness: 0.5,
            color: rgb(0.85, 0.85, 0.85),
        });
    }
    
    // 詳細情報の行を描画するヘルパー関数
    drawDetailRow(page, detail, yPos, width, colors, font) {
        const { rgb } = PDFLib;
        
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
        } else {
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
            font: font,
            color: detail.highlight ? colors.primary : colors.text,
        });
        
        // コロン
        page.drawText(':', {
            x: 250,
            y: yPos - 15,
            size: 11,
            font: font,
            color: colors.textLight,
        });
        
        // 値
        page.drawText(detail.value, {
            x: 270,
            y: yPos - 15,
            size: 11,
            font: font,
            color: detail.highlight ? colors.primary : colors.text,
        });
    }
}

// グローバルに公開
window.PDFGeneratorFinancial = PDFGeneratorFinancial;