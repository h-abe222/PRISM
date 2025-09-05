// PRISM 各種ドキュメントダウンロード用APIエンドポイント

const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ドキュメント生成関数
const documentGenerators = {
    // 物件概要書（詳細版）
    'property-overview': async () => {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        
        // ヘッダー
        doc.fontSize(24).font('Helvetica-Bold')
           .text('物件概要書（詳細版）', { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).text('南青山プリズムビル', { align: 'center' });
        doc.moveDown(2);
        
        // 基本情報セクション
        doc.fontSize(16).font('Helvetica-Bold').text('1. 物件基本情報');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        
        const basicInfo = [
            ['物件名称', '南青山プリズムビル'],
            ['所在地', '東京都港区南青山5-10-5'],
            ['交通アクセス', '東京メトロ銀座線・半蔵門線・千代田線「表参道」駅 徒歩3分'],
            ['', 'JR山手線・埼京線・湘南新宿ライン「渋谷」駅 徒歩8分'],
            ['竣工年月', '2019年3月（築5年）'],
            ['構造・規模', '鉄骨鉄筋コンクリート造 地上8階建'],
            ['敷地面積', '234.56㎡（70.95坪）'],
            ['建物延床面積', '1,234.56㎡（373.45坪）'],
            ['建ぺい率・容積率', '80% / 700%'],
            ['用途地域', '商業地域'],
            ['駐車場', '機械式駐車場6台']
        ];
        
        basicInfo.forEach(([label, value]) => {
            if (label) {
                doc.font('Helvetica-Bold').text(label + ':', { continued: true });
                doc.font('Helvetica').text(' ' + value);
            } else {
                doc.text(value, { indent: 100 });
            }
            doc.moveDown(0.5);
        });
        
        // 立地・環境セクション
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('2. 立地・環境');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text('表参道・青山エリアの中心部に位置し、周辺には高級ブランドショップ、おしゃれなカフェ・レストラン、クリエイティブ企業のオフィスが集積。都内屈指のブランド力を持つエリアで、安定した賃貸需要が見込めます。');
        doc.moveDown();
        
        const nearbyFacilities = [
            '表参道ヒルズ: 徒歩5分',
            '青山学院大学: 徒歩7分',
            'ブルーノート東京: 徒歩3分',
            '根津美術館: 徒歩8分',
            '明治神宮外苑: 徒歩10分'
        ];
        
        doc.font('Helvetica-Bold').text('主要施設までの距離:');
        doc.moveDown();
        nearbyFacilities.forEach(facility => {
            doc.font('Helvetica').text('• ' + facility);
        });
        
        // 建物仕様セクション
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('3. 建物仕様・設備');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        
        const specifications = [
            ['エレベーター', '乗用2基（13人乗り）'],
            ['空調設備', '個別空調（各フロア独立制御可能）'],
            ['電気容量', '60VA/㎡'],
            ['床荷重', '300kg/㎡'],
            ['天井高', '2,700mm'],
            ['OAフロア', '100mm'],
            ['セキュリティ', '24時間機械警備、オートロックシステム'],
            ['インターネット', '光ファイバー対応済み']
        ];
        
        specifications.forEach(([label, value]) => {
            doc.font('Helvetica-Bold').text(label + ':', { continued: true });
            doc.font('Helvetica').text(' ' + value);
            doc.moveDown(0.5);
        });
        
        // レントロール
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('4. レントロール（賃貸借状況）');
        doc.moveDown();
        doc.fontSize(10).font('Helvetica');
        
        // テーブルヘッダー
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 150;
        const col3 = 250;
        const col4 = 350;
        const col5 = 450;
        
        doc.font('Helvetica-Bold');
        doc.text('階数', col1, tableTop);
        doc.text('テナント名', col2, tableTop);
        doc.text('面積(㎡)', col3, tableTop);
        doc.text('月額賃料(円)', col4, tableTop);
        doc.text('契約期限', col5, tableTop);
        
        doc.moveTo(col1, doc.y + 5)
           .lineTo(520, doc.y + 5)
           .stroke();
        
        doc.moveDown();
        doc.font('Helvetica');
        
        const tenants = [
            ['8F', 'プレミアムデザイン', '154.32', '1,234,560', '2026年3月'],
            ['7F', 'グローバルコンサル', '154.32', '1,234,560', '2025年9月'],
            ['6F', 'ファッションブランドA', '154.32', '1,388,880', '2027年3月'],
            ['5F', 'IT企業B', '154.32', '1,080,240', '2026年12月'],
            ['4F', '法律事務所C', '154.32', '1,543,200', '2028年3月'],
            ['3F', '美容クリニック', '154.32', '1,697,520', '2029年3月'],
            ['2F', '高級レストラン', '154.32', '925,920', '2026年6月'],
            ['1F', 'ラグジュアリーブランド', '154.32', '2,160,480', '2030年3月']
        ];
        
        tenants.forEach(([floor, name, area, rent, expire]) => {
            const y = doc.y;
            doc.text(floor, col1, y);
            doc.text(name, col2, y);
            doc.text(area, col3, y);
            doc.text(rent, col4, y);
            doc.text(expire, col5, y);
            doc.moveDown();
        });
        
        doc.moveDown();
        doc.font('Helvetica-Bold');
        doc.text('合計賃料収入: 10,265,360円/月（123,184,320円/年）');
        doc.text('稼働率: 100%');
        
        // フッター
        doc.fontSize(10).font('Helvetica')
           .text('PRISM VIP - 物件概要書', 50, 750, { align: 'center' });
        
        doc.end();
        
        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        });
    },
    
    // 10年間収支シミュレーション（Excel）
    'cashflow-simulation': async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('10年間収支シミュレーション');
        
        // タイトル
        sheet.mergeCells('A1:H1');
        sheet.getCell('A1').value = '南青山プリズムビル - 10年間収支シミュレーション';
        sheet.getCell('A1').font = { size: 16, bold: true };
        sheet.getCell('A1').alignment = { horizontal: 'center' };
        
        // 物件情報
        sheet.getCell('A3').value = '物件価格';
        sheet.getCell('B3').value = 1850000000;
        sheet.getCell('B3').numFmt = '#,##0"円"';
        
        sheet.getCell('A4').value = '想定利回り';
        sheet.getCell('B4').value = 0.042;
        sheet.getCell('B4').numFmt = '0.0%';
        
        // パラメータセクション
        sheet.getCell('A6').value = 'シミュレーションパラメータ';
        sheet.getCell('A6').font = { bold: true };
        
        sheet.getCell('A7').value = '賃料上昇率（年）';
        sheet.getCell('B7').value = 0.01;
        sheet.getCell('B7').numFmt = '0.0%';
        
        sheet.getCell('A8').value = '経費上昇率（年）';
        sheet.getCell('B8').value = 0.01;
        sheet.getCell('B8').numFmt = '0.0%';
        
        sheet.getCell('A9').value = '空室率';
        sheet.getCell('B9').value = 0.05;
        sheet.getCell('B9').numFmt = '0.0%';
        
        // キャッシュフロー表
        sheet.getCell('A11').value = '年次キャッシュフロー';
        sheet.getCell('A11').font = { bold: true };
        
        // ヘッダー
        const headers = ['年次', '賃料収入', '空室損失', '実効賃料', '運営費用', 'NOI', 'NCF', '累計NCF'];
        headers.forEach((header, index) => {
            const cell = sheet.getCell(12, index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
        });
        
        // データ行
        let cumulativeNCF = 0;
        for (let year = 1; year <= 10; year++) {
            const row = 12 + year;
            const rentIncrease = Math.pow(1.01, year - 1);
            const costIncrease = Math.pow(1.01, year - 1);
            
            const annualRent = 77700000 * rentIncrease;
            const vacancy = annualRent * 0.05;
            const effectiveRent = annualRent - vacancy;
            const operatingCost = 16317000 * costIncrease;
            const noi = effectiveRent - operatingCost;
            const capex = 2000000; // 資本的支出
            const ncf = noi - capex;
            cumulativeNCF += ncf;
            
            sheet.getCell(row, 1).value = year;
            sheet.getCell(row, 2).value = annualRent;
            sheet.getCell(row, 3).value = vacancy;
            sheet.getCell(row, 4).value = effectiveRent;
            sheet.getCell(row, 5).value = operatingCost;
            sheet.getCell(row, 6).value = noi;
            sheet.getCell(row, 7).value = ncf;
            sheet.getCell(row, 8).value = cumulativeNCF;
            
            // 数値フォーマット
            for (let col = 2; col <= 8; col++) {
                sheet.getCell(row, col).numFmt = '#,##0"円"';
            }
        }
        
        // 列幅調整
        sheet.columns.forEach(column => {
            column.width = 15;
        });
        
        // IRR・NPV計算結果
        sheet.getCell('A25').value = '投資分析結果';
        sheet.getCell('A25').font = { bold: true };
        
        sheet.getCell('A26').value = '10年IRR';
        sheet.getCell('B26').value = 0.078;
        sheet.getCell('B26').numFmt = '0.0%';
        
        sheet.getCell('A27').value = 'NPV（割引率5%）';
        sheet.getCell('B27').value = 240000000;
        sheet.getCell('B27').numFmt = '#,##0"円"';
        
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    },
    
    // 融資提案書
    'loan-simulation': async () => {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        
        // タイトル
        doc.fontSize(24).font('Helvetica-Bold')
           .text('融資提案書', { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).text('南青山プリズムビル', { align: 'center' });
        doc.fontSize(14).text('25年返済シミュレーション', { align: 'center' });
        doc.moveDown(2);
        
        // 融資概要
        doc.fontSize(16).font('Helvetica-Bold').text('1. 融資条件概要');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        
        const loanTerms = [
            ['物件価格', '18億5,000万円'],
            ['借入希望額', '14億8,000万円（LTV 80%）'],
            ['自己資金', '3億7,000万円（20%）'],
            ['借入期間', '25年'],
            ['想定金利', '1.2%～1.5%（変動金利）'],
            ['返済方法', '元利均等返済'],
            ['担保', '本物件第一順位抵当権']
        ];
        
        loanTerms.forEach(([label, value]) => {
            doc.font('Helvetica-Bold').text(label + ':', { continued: true });
            doc.font('Helvetica').text(' ' + value);
            doc.moveDown(0.5);
        });
        
        // 返済シミュレーション
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('2. 月次返済シミュレーション');
        doc.moveDown();
        
        doc.fontSize(12).font('Helvetica-Bold').text('金利1.2%の場合:');
        doc.moveDown();
        doc.font('Helvetica');
        doc.text('月額返済額: 5,589,120円');
        doc.text('年間返済額: 67,069,440円');
        doc.text('総返済額: 1,676,736,000円');
        doc.text('DSCR: 1.16');
        doc.moveDown();
        
        doc.font('Helvetica-Bold').text('金利1.5%の場合:');
        doc.moveDown();
        doc.font('Helvetica');
        doc.text('月額返済額: 5,884,800円');
        doc.text('年間返済額: 70,617,600円');
        doc.text('総返済額: 1,765,440,000円');
        doc.text('DSCR: 1.10');
        
        // 推奨金融機関
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('3. 推奨金融機関');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        
        const banks = [
            {
                name: 'みずほ銀行',
                features: [
                    '大手メガバンクの信頼性',
                    '不動産融資実績豊富',
                    '優遇金利適用の可能性',
                    '繰上返済手数料優遇'
                ]
            },
            {
                name: '三井住友信託銀行',
                features: [
                    '不動産専門チーム',
                    '柔軟な融資条件',
                    'ノンリコースローン対応可',
                    'エクイティ投資も検討可能'
                ]
            },
            {
                name: 'オリックス銀行',
                features: [
                    '不動産投資ローン専門',
                    'スピーディーな審査',
                    'LTV85%まで対応可',
                    'オンライン完結可能'
                ]
            }
        ];
        
        banks.forEach(bank => {
            doc.font('Helvetica-Bold').text(bank.name);
            doc.moveDown(0.5);
            bank.features.forEach(feature => {
                doc.font('Helvetica').text('• ' + feature);
            });
            doc.moveDown();
        });
        
        // 必要書類
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('4. 融資申込必要書類');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        
        doc.text('【個人情報関連】');
        doc.text('□ 本人確認書類（運転免許証、パスポート等）');
        doc.text('□ 住民票（3ヶ月以内）');
        doc.text('□ 印鑑証明書（3ヶ月以内）');
        doc.text('□ 源泉徴収票（直近3年分）');
        doc.text('□ 確定申告書（直近3年分）');
        doc.text('□ 納税証明書');
        doc.moveDown();
        
        doc.text('【資産関連】');
        doc.text('□ 預金通帳のコピー');
        doc.text('□ 有価証券等の資産証明');
        doc.text('□ 既存借入の返済予定表');
        doc.moveDown();
        
        doc.text('【物件関連】');
        doc.text('□ 売買契約書案');
        doc.text('□ 重要事項説明書');
        doc.text('□ レントロール');
        doc.text('□ 建物図面');
        doc.text('□ 修繕履歴');
        
        doc.end();
        
        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        });
    },
    
    // 重要事項説明書
    'important-matters': async () => {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        
        doc.fontSize(20).font('Helvetica-Bold')
           .text('重要事項説明書（案）', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text('南青山プリズムビル', { align: 'center' });
        doc.moveDown(2);
        
        doc.fontSize(12).font('Helvetica');
        doc.text('宅地建物取引業法第35条の規定に基づき、以下の通り重要事項を説明いたします。');
        doc.moveDown();
        
        // 取引態様
        doc.fontSize(14).font('Helvetica-Bold').text('1. 取引態様');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica').text('売買の媒介');
        doc.moveDown();
        
        // 物件の表示
        doc.fontSize(14).font('Helvetica-Bold').text('2. 物件の表示');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text('所在地: 東京都港区南青山五丁目10番5号');
        doc.text('地番: 南青山五丁目10番5');
        doc.text('地目: 宅地');
        doc.text('地積: 234.56㎡');
        doc.text('建物構造: 鉄骨鉄筋コンクリート造8階建');
        doc.text('床面積: 1,234.56㎡');
        doc.text('建築年月: 2019年3月');
        doc.moveDown();
        
        // 法令上の制限
        doc.fontSize(14).font('Helvetica-Bold').text('3. 法令に基づく制限');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text('用途地域: 商業地域');
        doc.text('建ぺい率: 80%');
        doc.text('容積率: 700%');
        doc.text('防火地域: 防火地域');
        doc.text('その他: 東京都建築安全条例適用');
        doc.moveDown();
        
        // 私道負担
        doc.fontSize(14).font('Helvetica-Bold').text('4. 私道負担');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica').text('なし');
        doc.moveDown();
        
        // インフラ
        doc.fontSize(14).font('Helvetica-Bold').text('5. 飲用水・電気・ガスの供給施設および排水施設');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text('飲用水: 公営水道');
        doc.text('電気: 東京電力');
        doc.text('ガス: 東京ガス（都市ガス）');
        doc.text('排水: 公共下水');
        
        doc.end();
        
        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        });
    },
    
    // 売買契約書
    'sales-contract': async () => {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        
        doc.fontSize(20).font('Helvetica-Bold')
           .text('不動産売買契約書（案）', { align: 'center' });
        doc.moveDown(2);
        
        doc.fontSize(12).font('Helvetica');
        doc.text('売主（以下「甲」という）と買主（以下「乙」という）は、以下の通り不動産売買契約を締結する。');
        doc.moveDown();
        
        doc.fontSize(14).font('Helvetica-Bold').text('第1条（売買の目的物）');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text('甲は、その所有する下記の不動産（以下「本物件」という）を乙に売り渡し、乙はこれを買い受ける。');
        doc.moveDown();
        doc.text('物件名: 南青山プリズムビル');
        doc.text('所在: 東京都港区南青山五丁目10番5号');
        doc.text('土地: 234.56㎡');
        doc.text('建物: 鉄骨鉄筋コンクリート造8階建 1,234.56㎡');
        doc.moveDown();
        
        doc.fontSize(14).font('Helvetica-Bold').text('第2条（売買代金）');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text('売買代金は金1,850,000,000円（消費税込み）とする。');
        doc.moveDown();
        
        doc.fontSize(14).font('Helvetica-Bold').text('第3条（支払方法）');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text('1. 手付金: 契約締結時に金185,000,000円');
        doc.text('2. 残代金: 引渡時に金1,665,000,000円');
        doc.moveDown();
        
        doc.fontSize(14).font('Helvetica-Bold').text('第4条（引渡し）');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text('甲は、残代金の受領と同時に本物件を現状有姿にて乙に引き渡す。');
        doc.text('引渡予定日: 契約締結日より60日以内');
        doc.moveDown();
        
        doc.fontSize(14).font('Helvetica-Bold').text('第5条（所有権移転）');
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text('本物件の所有権は、乙が売買代金全額の支払を完了した時に、甲から乙に移転する。');
        
        doc.end();
        
        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        });
    }
};

// メインハンドラー
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
        
        if (!type || !documentGenerators[type]) {
            return res.status(400).json({
                error: 'Invalid document type',
                validTypes: Object.keys(documentGenerators)
            });
        }
        
        // ドキュメント生成
        const buffer = await documentGenerators[type]();
        
        // ファイル名とMIMEタイプを設定
        let filename, mimeType;
        switch (type) {
            case 'cashflow-simulation':
                filename = `南青山プリズムビル_10年間収支シミュレーション_${Date.now()}.xlsx`;
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            default:
                filename = `南青山プリズムビル_${type}_${Date.now()}.pdf`;
                mimeType = 'application/pdf';
        }
        
        // レスポンスヘッダー設定
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.setHeader('Content-Length', buffer.length);
        
        // ファイル送信
        res.send(buffer);
        
    } catch (error) {
        console.error('Document generation error:', error);
        res.status(500).json({
            error: 'Document generation failed',
            message: error.message
        });
    }
};