// クライアントサイドPDF生成モジュール

class PDFGenerator {
    constructor() {
        this.loadJsPDF();
    }

    // jsPDFライブラリを動的に読み込み
    async loadJsPDF() {
        if (typeof window.jspdf === 'undefined') {
            // jsPDFをCDNから読み込み
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            document.head.appendChild(script);
            
            // フォントサポート用
            const fontScript = document.createElement('script');
            fontScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
            document.head.appendChild(fontScript);
            
            return new Promise((resolve) => {
                script.onload = () => {
                    fontScript.onload = async () => {
                        await this.setupJapaneseFont();
                        resolve();
                    };
                };
            });
        } else {
            await this.setupJapaneseFont();
        }
    }

    // 日本語フォントの設定（軽量フォント埋め込み）
    async setupJapaneseFont() {
        if (window.jspdf && window.jspdf.jsPDF) {
            const { jsPDF } = window.jspdf;
            
            try {
                // M+ 1p Regular フォント（軽量な日本語フォント）を使用
                // CDNから取得
                const fontUrl = 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/m-plus-1p@0.2.3/fonts/MPlus1p-Regular.ttf';
                
                const response = await fetch(fontUrl);
                if (!response.ok) {
                    throw new Error('Font fetch failed');
                }
                
                const fontArrayBuffer = await response.arrayBuffer();
                const fontBase64 = this.arrayBufferToBase64(fontArrayBuffer);
                
                // jsPDFにフォントを登録
                const callAddFont = function() {
                    this.addFileToVFS('MPlus1p-Regular.ttf', fontBase64);
                    this.addFont('MPlus1p-Regular.ttf', 'MPlus1p', 'normal');
                };
                
                jsPDF.API.events.push(['addFonts', callAddFont]);
                
                this.isJapaneseFontReady = true;
                console.log('Japanese font loaded successfully');
                
            } catch (error) {
                console.warn('Japanese font setup failed, using fallback:', error);
                this.isJapaneseFontReady = false;
            }
        }
    }
    
    // ArrayBufferをBase64に変換
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // PRISMロゴを簡易版で作成（エラー回避）
    async createPRISMLogo() {
        try {
            // シンプルなテキストロゴとして作成
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 200;
            canvas.height = 40;
            
            // 白背景
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // PRISMテキストを描画
            ctx.fillStyle = '#1a365d';
            ctx.font = 'bold 24px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('PRISM', canvas.width / 2, canvas.height / 2);
            
            return canvas.toDataURL('image/png');
            
        } catch (error) {
            console.error('Logo creation failed:', error);
            return null;
        }
    }

    // 日本語テキストをPDFに追加（UTF-8対応）
    addJapaneseText(doc, text, x, y, options = {}) {
        const { fontSize = 12, color = [0, 0, 0], align = 'left', maxWidth = 0 } = options;
        
        // テキスト色を設定
        if (Array.isArray(color)) {
            doc.setTextColor(...color);
        } else if (typeof color === 'string') {
            // 16進数カラーをRGBに変換
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            doc.setTextColor(r, g, b);
        }
        
        doc.setFontSize(fontSize);
        
        // 日本語文字を直接描画（jsPDFのUTF-8サポートを使用）
        if (maxWidth > 0) {
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y, { align });
            return lines.length * (fontSize * 0.35); // 行高を返す
        } else {
            doc.text(text, x, y, { align });
            return fontSize * 0.35; // 高さを返す
        }
    }

    // 物件概要書PDF生成（プロフェッショナル版）
    async generatePropertyOverview() {
        await this.loadJsPDF();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // 日本語フォントを設定
        if (this.isJapaneseFontReady) {
            doc.setFont('MPlus1p');
        }
        
        // PRISM ブランドカラー定義
        const colors = {
            primary: [26, 54, 93],
            primaryLight: [70, 130, 180],
            background: [248, 249, 250],
            text: [51, 51, 51],
            textLight: [102, 102, 102],
            white: [255, 255, 255]
        };
        
        // ロゴの準備
        const logoBase64 = await this.createPRISMLogo();
        
        // === ヘッダー部分 ===
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, 210, 40, 'F');
        
        // PRISMロゴ
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 20, 15, 50, 12);
        } else {
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('PRISM', 20, 25);
        }
        
        // ヘッダータイトル
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        if (this.isJapaneseFontReady) {
            doc.setFont('MPlus1p', 'bold');
        } else {
            doc.setFont('helvetica', 'bold');
        }
        doc.text('物件概要書', 140, 25);
        
        // サブタイトル
        doc.setFontSize(12);
        if (this.isJapaneseFontReady) {
            doc.setFont('MPlus1p', 'normal');
        } else {
            doc.setFont('helvetica', 'normal');
        }
        doc.text('南青山プリズムビル', 140, 35);
        
        // === 物件基本情報（autoTableを使用） ===
        const propertyData = [
            ['物件名称', '南青山プリズムビル'],
            ['所在地', '東京都港区南青山'],
            ['最寄駅', '東京メトロ表参道駅 徒歩5分'],
            ['築年月', '2019年（築5年）'],
            ['構造・階数', '鉄骨造 地上5階建'],
            ['延床面積', '495㎡'],
            ['土地面積', '180㎡'],
            ['現在稼働率', '83.3%（6室中5室入居）'],
            ['月額賃料収入', '289万円'],
            ['年間賃料収入', '3,468万円'],
            ['売買価格', '3億8,500万円'],
            ['表面利回り', '9.0%'],
            ['NOI利回り', '6.9%']
        ];

        doc.autoTable({
            body: propertyData,
            startY: 50,
            theme: 'grid',
            styles: {
                font: this.isJapaneseFontReady ? 'MPlus1p' : 'helvetica',
                fontStyle: 'normal',
                fontSize: 10,
                cellPadding: 5,
                lineColor: colors.primary,
                lineWidth: 0.5
            },
            columnStyles: {
                0: { 
                    fillColor: colors.background,
                    textColor: colors.text,
                    fontStyle: 'bold',
                    cellWidth: 50
                },
                1: { 
                    textColor: colors.text,
                    cellWidth: 130
                }
            }
        });
        
        // === 投資ハイライト ===
        let yPos = doc.lastAutoTable.finalY + 15;
        
        doc.setFillColor(...colors.primaryLight);
        doc.rect(15, yPos, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        if (this.isJapaneseFontReady) {
            doc.setFont('MPlus1p', 'bold');
        } else {
            doc.setFont('helvetica', 'bold');
        }
        doc.text('投資ハイライト', 20, yPos + 5);
        
        yPos += 15;
        
        const highlights = [
            '• 表参道駅徒歩5分の一等地立地',
            '• 2019年築・新耐震基準適合の築浅物件',
            '• 表面利回り9.0%（満室時10.8%の高利回り）',
            '• NOI利回り6.9%・安定収益',
            '• 現在稼働率83.3%・満室へのアップサイド',
            '• 高級ブランド・IT企業等の優良テナント'
        ];
        
        doc.setTextColor(...colors.text);
        doc.setFontSize(10);
        if (this.isJapaneseFontReady) {
            doc.setFont('MPlus1p', 'normal');
        } else {
            doc.setFont('helvetica', 'normal');
        }
        
        highlights.forEach((highlight) => {
            doc.text(highlight, 20, yPos);
            yPos += 7;
        });
        
        // === 新しいページ - レントロール ===
        doc.addPage();
        
        // ページヘッダー
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        if (this.isJapaneseFontReady) {
            doc.setFont('MPlus1p', 'bold');
        } else {
            doc.setFont('helvetica', 'bold');
        }
        doc.text('テナント状況詳細', 20, 18);
        
        // === レントロールテーブル ===
        const rentRollData = [
            ['階層', 'テナント名', '面積', '月額賃料', '契約期間', '状況'],
            ['1階', '株式会社ABC', '85㎡', '85万円', '2024.01-2025.12', '入居中'],
            ['2階', '株式会社XYZ', '85㎡', '75万円', '2023.07-2025.06', '入居中'],
            ['3階', 'ファッションブランドJ', '85㎡', '68万円', '2024.04-2026.03', '入居中'],
            ['4階', '（空室）', '85㎡', '-', '-', '空室'],
            ['5階', 'テックスタートアップK', '75㎡', '60万円', '2023.10-2025.09', '入居中'],
            ['RF階', 'デザインスタジオ', '70㎡', '56万円', '2024.07-2026.06', '入居中']
        ];

        doc.autoTable({
            head: [rentRollData[0]],
            body: rentRollData.slice(1),
            startY: 35,
            theme: 'striped',
            styles: {
                font: this.isJapaneseFontReady ? 'MPlus1p' : 'helvetica',
                fontStyle: 'normal',
                fontSize: 9,
                cellPadding: 4,
                lineColor: colors.primary,
                lineWidth: 0.3
            },
            headStyles: {
                font: this.isJapaneseFontReady ? 'MPlus1p' : 'helvetica',
                fillColor: colors.primary,
                textColor: colors.white,
                fontStyle: 'bold'
            },
            bodyStyles: {
                font: this.isJapaneseFontReady ? 'MPlus1p' : 'helvetica',
                textColor: colors.text
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 50 },
                2: { cellWidth: 20 },
                3: { cellWidth: 25 },
                4: { cellWidth: 40 },
                5: { 
                    cellWidth: 25,
                    textColor: [40, 167, 69] // 緑色
                }
            },
            didParseCell: function(data) {
                // 空室の行は赤色に
                if (data.cell.section === 'body' && data.cell.raw === '空室') {
                    data.cell.styles.textColor = [220, 53, 69];
                }
            }
        });
        
        // === エリア・立地分析 ===
        yPos = doc.lastAutoTable.finalY + 15;
        
        doc.setFillColor(...colors.primaryLight);
        doc.rect(15, yPos, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        if (this.isJapaneseFontReady) {
            doc.setFont('MPlus1p', 'bold');
        } else {
            doc.setFont('helvetica', 'bold');
        }
        doc.text('エリア・立地分析', 20, yPos + 5);
        
        yPos += 15;
        
        const locationPoints = [
            '• 表参道・青山：東京最高級ショッピングエリア',
            '• 複数路線アクセス：地下鉄・JR線への優秀なアクセス',
            '• 国際的フラッグシップストアに囲まれた立地',
            '• 高い歩行者通行量・安定したテナント需要',
            '• 継続的な再開発・資産価値上昇が期待される'
        ];
        
        doc.setTextColor(...colors.text);
        doc.setFontSize(10);
        if (this.isJapaneseFontReady) {
            doc.setFont('MPlus1p', 'normal');
        } else {
            doc.setFont('helvetica', 'normal');
        }
        
        locationPoints.forEach((point) => {
            doc.text(point, 20, yPos);
            yPos += 7;
        });
        
        // === 投資収益分析 ===
        yPos += 10;
        
        doc.setFillColor(...colors.background);
        doc.rect(15, yPos - 5, 180, 40, 'F');
        doc.setDrawColor(...colors.primary);
        doc.rect(15, yPos - 5, 180, 40, 'S');
        
        doc.setTextColor(...colors.text);
        doc.setFontSize(12);
        if (this.isJapaneseFontReady) {
            doc.setFont('MPlus1p', 'bold');
        } else {
            doc.setFont('helvetica', 'bold');
        }
        doc.text('投資収益分析サマリー', 20, yPos);
        
        yPos += 10;
        
        const profitabilityData = [
            '• 表面利回り：9.0%（東京一等地エリアとして優秀な水準）',
            '• NOI利回り：6.9%（運営費用控除後の実質利回り）',
            '• 満室時利回り：10.8%（空室解消時のポテンシャル）',
            '• 20年累積ROI：156%（投資元本の1.56倍リターン）'
        ];
        
        doc.setFontSize(10);
        if (this.isJapaneseFontReady) {
            doc.setFont('MPlus1p', 'normal');
        } else {
            doc.setFont('helvetica', 'normal');
        }
        
        profitabilityData.forEach((point) => {
            doc.text(point, 22, yPos);
            yPos += 7;
        });
        
        // === フッター（全ページ共通） ===
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // フッターライン
            doc.setDrawColor(...colors.primary);
            doc.line(20, 280, 190, 280);
            
            // フッターテキスト
            doc.setFontSize(8);
            doc.setTextColor(...colors.textLight);
            doc.text(`${i} / ${pageCount}`, 105, 287, { align: 'center' });
            doc.text('PRISM - Premium Real Estate Investment Solutions', 105, 292, { align: 'center' });
            
            // 作成日時
            const now = new Date();
            const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日作成`;
            if (this.isJapaneseFontReady) {
                doc.setFont('MPlus1p', 'normal');
            } else {
                doc.setFont('helvetica', 'normal');
            }
            doc.text(dateStr, 190, 287, { align: 'right' });
        }
        
        return doc;
    }

    // 融資提案書PDF生成
    async generateLoanProposal() {
        await this.loadJsPDF();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Loan Proposal', 105, 30, { align: 'center' });
        doc.setFontSize(16);
        doc.text('25-Year Repayment Plan', 105, 40, { align: 'center' });
        
        const loanData = [
            ['Property Price', '1,850,000,000 JPY'],
            ['Loan Amount', '1,480,000,000 JPY (LTV 80%)'],
            ['Own Funds', '370,000,000 JPY (20%)'],
            ['Loan Period', '25 Years'],
            ['Interest Rate', '1.2% - 1.5%'],
            ['Repayment Method', 'Principal and Interest']
        ];
        
        doc.autoTable({
            head: [['Item', 'Details']],
            body: loanData,
            startY: 60,
            styles: { fontSize: 11 },
            headStyles: { fillColor: [0, 102, 204] }
        });
        
        // 返済シミュレーション
        doc.setFontSize(14);
        doc.text('Monthly Repayment Simulation', 20, doc.lastAutoTable.finalY + 20);
        
        const repaymentData = [
            ['1.2% (Best)', '5,589,120 JPY', '67,069,440 JPY/year', '1.16'],
            ['1.35% (Standard)', '5,736,480 JPY', '68,837,760 JPY/year', '1.13'],
            ['1.5% (Conservative)', '5,884,800 JPY', '70,617,600 JPY/year', '1.10']
        ];
        
        doc.autoTable({
            head: [['Interest Rate', 'Monthly Payment', 'Annual Payment', 'DSCR']],
            body: repaymentData,
            startY: doc.lastAutoTable.finalY + 30,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [0, 102, 204] }
        });
        
        return doc;
    }

    // 重要事項説明書PDF生成
    async generateImportantMatters() {
        await this.loadJsPDF();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Important Matters Explanation', 105, 30, { align: 'center' });
        
        const mattersData = [
            ['Transaction Type', 'Sales Mediation'],
            ['Location', 'Minato-ku, Tokyo 5-10-5'],
            ['Land Area', '234.56 sqm'],
            ['Building Structure', 'SRC 8 floors'],
            ['Building Area', '1,234.56 sqm'],
            ['Built Date', 'March 2019'],
            ['Use Area', 'Commercial Area'],
            ['Building Coverage', '80%'],
            ['Floor Area Ratio', '700%'],
            ['Fire Prevention', 'Fire Prevention Area']
        ];
        
        doc.autoTable({
            head: [['Item', 'Details']],
            body: mattersData,
            startY: 50,
            styles: { fontSize: 11 },
            headStyles: { fillColor: [0, 102, 204] }
        });
        
        return doc;
    }

    // 売買契約書PDF生成
    async generateSalesContract() {
        await this.loadJsPDF();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Sales Contract (Draft)', 105, 30, { align: 'center' });
        
        const contractData = [
            ['Property Name', 'Minamiaoyama PRISM Building'],
            ['Location', 'Minato-ku, Tokyo 5-10-5'],
            ['Sale Price', '1,850,000,000 JPY'],
            ['Earnest Money', '185,000,000 JPY'],
            ['Remaining Payment', '1,665,000,000 JPY'],
            ['Delivery Date', 'Within 60 days from contract'],
            ['Land Area', '234.56 sqm'],
            ['Building Area', '1,234.56 sqm']
        ];
        
        doc.autoTable({
            head: [['Item', 'Details']],
            body: contractData,
            startY: 50,
            styles: { fontSize: 11 },
            headStyles: { fillColor: [0, 102, 204] }
        });
        
        // 契約条項
        doc.setFontSize(12);
        doc.text('Terms and Conditions:', 20, doc.lastAutoTable.finalY + 20);
        
        const terms = [
            '1. Transfer of ownership upon full payment',
            '2. Property delivered in current condition',
            '3. Public charges settled by delivery date',
            '4. No warranty for hidden defects',
            '5. Cancellation terms as per agreement'
        ];
        
        let y = doc.lastAutoTable.finalY + 30;
        terms.forEach(term => {
            doc.text(term, 25, y);
            y += 10;
        });
        
        return doc;
    }

    // PDFをダウンロード
    downloadPDF(doc, filename) {
        doc.save(filename);
    }
}

// グローバルに公開
window.PDFGenerator = PDFGenerator;