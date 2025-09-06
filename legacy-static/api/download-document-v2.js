// PRISM 各種ドキュメントダウンロード用APIエンドポイント（日本語対応版）

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const ExcelJS = require('exceljs');

// HTMLテンプレート生成関数
const generateHTMLContent = (type) => {
    const templates = {
        'property-overview': `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @page { size: A4; margin: 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;
            line-height: 1.8;
            color: #333;
            padding: 20px;
        }
        h1 { 
            color: #0066CC;
            font-size: 28px;
            margin-bottom: 20px;
            text-align: center;
            padding: 20px;
            background: linear-gradient(to right, #f0f8ff, #ffffff);
            border-radius: 8px;
        }
        h2 {
            color: #0066CC;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #0066CC;
        }
        h3 {
            font-size: 16px;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #333;
        }
        .subtitle {
            text-align: center;
            font-size: 18px;
            margin-bottom: 30px;
            color: #666;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .info-table th {
            background: #f0f8ff;
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
            width: 35%;
            font-weight: 600;
        }
        .info-table td {
            padding: 12px;
            border: 1px solid #ddd;
        }
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        ul {
            margin-left: 20px;
            line-height: 2;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <h1>物件概要書（詳細版）</h1>
    <p class="subtitle">南青山プリズムビル</p>
    
    <div class="section">
        <h2>1. 物件基本情報</h2>
        <table class="info-table">
            <tr><th>物件名称</th><td>南青山プリズムビル</td></tr>
            <tr><th>所在地</th><td>東京都港区南青山5-10-5</td></tr>
            <tr><th>交通アクセス</th><td>東京メトロ銀座線・半蔵門線・千代田線「表参道」駅 徒歩3分<br>JR山手線・埼京線・湘南新宿ライン「渋谷」駅 徒歩8分</td></tr>
            <tr><th>竣工年月</th><td>2019年3月（築5年）</td></tr>
            <tr><th>構造・規模</th><td>鉄骨鉄筋コンクリート造 地上8階建</td></tr>
            <tr><th>敷地面積</th><td>234.56㎡（70.95坪）</td></tr>
            <tr><th>建物延床面積</th><td>1,234.56㎡（373.45坪）</td></tr>
            <tr><th>建ぺい率・容積率</th><td>80% / 700%</td></tr>
            <tr><th>用途地域</th><td>商業地域</td></tr>
            <tr><th>駐車場</th><td>機械式駐車場6台</td></tr>
        </table>
    </div>
    
    <div class="section page-break">
        <h2>2. 立地・環境</h2>
        <p>表参道・青山エリアの中心部に位置し、周辺には高級ブランドショップ、おしゃれなカフェ・レストラン、クリエイティブ企業のオフィスが集積。都内屈指のブランド力を持つエリアで、安定した賃貸需要が見込めます。</p>
        
        <h3>主要施設までの距離</h3>
        <ul>
            <li>表参道ヒルズ: 徒歩5分</li>
            <li>青山学院大学: 徒歩7分</li>
            <li>ブルーノート東京: 徒歩3分</li>
            <li>根津美術館: 徒歩8分</li>
            <li>明治神宮外苑: 徒歩10分</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>3. 建物仕様・設備</h2>
        <table class="info-table">
            <tr><th>エレベーター</th><td>乗用2基（13人乗り）</td></tr>
            <tr><th>空調設備</th><td>個別空調（各フロア独立制御可能）</td></tr>
            <tr><th>電気容量</th><td>60VA/㎡</td></tr>
            <tr><th>床荷重</th><td>300kg/㎡</td></tr>
            <tr><th>天井高</th><td>2,700mm</td></tr>
            <tr><th>OAフロア</th><td>100mm</td></tr>
            <tr><th>セキュリティ</th><td>24時間機械警備、オートロックシステム</td></tr>
            <tr><th>インターネット</th><td>光ファイバー対応済み</td></tr>
        </table>
    </div>
    
    <div class="section page-break">
        <h2>4. レントロール（賃貸借状況）</h2>
        <table class="info-table">
            <tr style="background: #0066CC; color: white;">
                <th style="background: #0066CC; color: white;">階数</th>
                <th style="background: #0066CC; color: white;">テナント名</th>
                <th style="background: #0066CC; color: white;">面積(㎡)</th>
                <th style="background: #0066CC; color: white;">月額賃料(円)</th>
                <th style="background: #0066CC; color: white;">契約期限</th>
            </tr>
            <tr><td>8F</td><td>プレミアムデザイン</td><td>154.32</td><td>1,234,560</td><td>2026年3月</td></tr>
            <tr><td>7F</td><td>グローバルコンサル</td><td>154.32</td><td>1,234,560</td><td>2025年9月</td></tr>
            <tr><td>6F</td><td>ファッションブランドA</td><td>154.32</td><td>1,388,880</td><td>2027年3月</td></tr>
            <tr><td>5F</td><td>IT企業B</td><td>154.32</td><td>1,080,240</td><td>2026年12月</td></tr>
            <tr><td>4F</td><td>法律事務所C</td><td>154.32</td><td>1,543,200</td><td>2028年3月</td></tr>
            <tr><td>3F</td><td>美容クリニック</td><td>154.32</td><td>1,697,520</td><td>2029年3月</td></tr>
            <tr><td>2F</td><td>高級レストラン</td><td>154.32</td><td>925,920</td><td>2026年6月</td></tr>
            <tr><td>1F</td><td>ラグジュアリーブランド</td><td>154.32</td><td>2,160,480</td><td>2030年3月</td></tr>
        </table>
        <p style="margin-top: 20px; font-size: 16px; font-weight: bold;">
            合計賃料収入: 10,265,360円/月（123,184,320円/年）<br>
            稼働率: 100%
        </p>
    </div>
</body>
</html>
        `,
        
        'loan-simulation': `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A4; margin: 15mm; }
        body { 
            font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
            line-height: 1.8;
            color: #333;
            padding: 20px;
        }
        h1 { 
            color: #0066CC;
            font-size: 28px;
            margin-bottom: 10px;
            text-align: center;
        }
        h2 {
            color: #0066CC;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 2px solid #0066CC;
            padding-bottom: 8px;
        }
        .subtitle {
            text-align: center;
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }
        .info-box {
            background: #f0f8ff;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table th {
            background: #0066CC;
            color: white;
            padding: 10px;
            text-align: left;
        }
        .table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        .bank-card {
            background: white;
            border: 2px solid #0066CC;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .bank-name {
            font-size: 18px;
            font-weight: bold;
            color: #0066CC;
            margin-bottom: 10px;
        }
        ul {
            margin-left: 20px;
        }
        .checklist {
            background: #fffbf0;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #ff9800;
        }
    </style>
</head>
<body>
    <h1>融資提案書</h1>
    <p class="subtitle">南青山プリズムビル - 25年返済シミュレーション</p>
    
    <div class="info-box">
        <h2>1. 融資条件概要</h2>
        <table class="table">
            <tr><td style="width: 40%;"><strong>物件価格</strong></td><td>18億5,000万円</td></tr>
            <tr><td><strong>借入希望額</strong></td><td>14億8,000万円（LTV 80%）</td></tr>
            <tr><td><strong>自己資金</strong></td><td>3億7,000万円（20%）</td></tr>
            <tr><td><strong>借入期間</strong></td><td>25年</td></tr>
            <tr><td><strong>想定金利</strong></td><td>1.2%～1.5%（変動金利）</td></tr>
            <tr><td><strong>返済方法</strong></td><td>元利均等返済</td></tr>
            <tr><td><strong>担保</strong></td><td>本物件第一順位抵当権</td></tr>
        </table>
    </div>
    
    <h2>2. 月次返済シミュレーション</h2>
    
    <table class="table">
        <tr>
            <th>金利シナリオ</th>
            <th>月額返済額</th>
            <th>年間返済額</th>
            <th>総返済額</th>
            <th>DSCR</th>
        </tr>
        <tr>
            <td>1.2%（最良）</td>
            <td>5,589,120円</td>
            <td>67,069,440円</td>
            <td>1,676,736,000円</td>
            <td>1.16</td>
        </tr>
        <tr>
            <td>1.35%（標準）</td>
            <td>5,736,480円</td>
            <td>68,837,760円</td>
            <td>1,720,944,000円</td>
            <td>1.13</td>
        </tr>
        <tr>
            <td>1.5%（保守的）</td>
            <td>5,884,800円</td>
            <td>70,617,600円</td>
            <td>1,765,440,000円</td>
            <td>1.10</td>
        </tr>
    </table>
    
    <h2>3. 推奨金融機関</h2>
    
    <div class="bank-card">
        <div class="bank-name">みずほ銀行</div>
        <ul>
            <li>大手メガバンクの信頼性</li>
            <li>不動産融資実績豊富</li>
            <li>優遇金利適用の可能性</li>
            <li>繰上返済手数料優遇</li>
        </ul>
    </div>
    
    <div class="bank-card">
        <div class="bank-name">三井住友信託銀行</div>
        <ul>
            <li>不動産専門チーム</li>
            <li>柔軟な融資条件</li>
            <li>ノンリコースローン対応可</li>
            <li>エクイティ投資も検討可能</li>
        </ul>
    </div>
    
    <div class="bank-card">
        <div class="bank-name">オリックス銀行</div>
        <ul>
            <li>不動産投資ローン専門</li>
            <li>スピーディーな審査</li>
            <li>LTV85%まで対応可</li>
            <li>オンライン完結可能</li>
        </ul>
    </div>
    
    <h2>4. 融資申込必要書類</h2>
    
    <div class="checklist">
        <h3>【個人情報関連】</h3>
        <p>□ 本人確認書類（運転免許証、パスポート等）</p>
        <p>□ 住民票（3ヶ月以内）</p>
        <p>□ 印鑑証明書（3ヶ月以内）</p>
        <p>□ 源泉徴収票（直近3年分）</p>
        <p>□ 確定申告書（直近3年分）</p>
        <p>□ 納税証明書</p>
        
        <h3 style="margin-top: 20px;">【資産関連】</h3>
        <p>□ 預金通帳のコピー</p>
        <p>□ 有価証券等の資産証明</p>
        <p>□ 既存借入の返済予定表</p>
        
        <h3 style="margin-top: 20px;">【物件関連】</h3>
        <p>□ 売買契約書案</p>
        <p>□ 重要事項説明書</p>
        <p>□ レントロール</p>
        <p>□ 建物図面</p>
        <p>□ 修繕履歴</p>
    </div>
</body>
</html>
        `,
        
        'important-matters': `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A4; margin: 15mm; }
        body { 
            font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif;
            line-height: 1.8;
            color: #333;
            padding: 20px;
        }
        h1 { 
            text-align: center;
            font-size: 24px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f0f0f0;
        }
        h2 {
            font-size: 18px;
            margin-top: 30px;
            margin-bottom: 15px;
            padding: 8px;
            background: #f8f8f8;
            border-left: 4px solid #0066CC;
        }
        .content {
            margin-left: 20px;
            margin-bottom: 20px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table th, .table td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        .table th {
            background: #f0f0f0;
            font-weight: bold;
        }
        .note {
            background: #fffbf0;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #ff9800;
        }
    </style>
</head>
<body>
    <h1>重要事項説明書（案）</h1>
    <p style="text-align: center; margin-bottom: 30px;">南青山プリズムビル</p>
    
    <p>宅地建物取引業法第35条の規定に基づき、以下の通り重要事項を説明いたします。</p>
    
    <h2>1. 取引態様</h2>
    <div class="content">
        <p>売買の媒介</p>
    </div>
    
    <h2>2. 物件の表示</h2>
    <table class="table">
        <tr><th>所在地</th><td>東京都港区南青山五丁目10番5号</td></tr>
        <tr><th>地番</th><td>南青山五丁目10番5</td></tr>
        <tr><th>地目</th><td>宅地</td></tr>
        <tr><th>地積</th><td>234.56㎡</td></tr>
        <tr><th>建物構造</th><td>鉄骨鉄筋コンクリート造8階建</td></tr>
        <tr><th>床面積</th><td>1,234.56㎡</td></tr>
        <tr><th>建築年月</th><td>2019年3月</td></tr>
    </table>
    
    <h2>3. 法令に基づく制限</h2>
    <table class="table">
        <tr><th>用途地域</th><td>商業地域</td></tr>
        <tr><th>建ぺい率</th><td>80%</td></tr>
        <tr><th>容積率</th><td>700%</td></tr>
        <tr><th>防火地域</th><td>防火地域</td></tr>
        <tr><th>その他</th><td>東京都建築安全条例適用</td></tr>
    </table>
    
    <h2>4. 私道負担</h2>
    <div class="content">
        <p>なし</p>
    </div>
    
    <h2>5. 飲用水・電気・ガスの供給施設および排水施設</h2>
    <table class="table">
        <tr><th>飲用水</th><td>公営水道</td></tr>
        <tr><th>電気</th><td>東京電力</td></tr>
        <tr><th>ガス</th><td>東京ガス（都市ガス）</td></tr>
        <tr><th>排水</th><td>公共下水</td></tr>
    </table>
    
    <h2>6. 未完成物件の場合の完成時の形状・構造</h2>
    <div class="content">
        <p>該当なし（完成物件）</p>
    </div>
    
    <h2>7. 建物状況調査の結果の概要</h2>
    <div class="content">
        <p>実施済み - 構造上の不具合なし</p>
    </div>
    
    <h2>8. 代金以外に授受される金銭</h2>
    <table class="table">
        <tr><th>固定資産税等精算金</th><td>日割り計算による</td></tr>
        <tr><th>管理費等精算金</th><td>日割り計算による</td></tr>
    </table>
    
    <div class="note">
        <p><strong>注意事項</strong></p>
        <p>本書は案であり、実際の取引時には最新の情報に基づいて作成される正式な重要事項説明書をご確認ください。</p>
    </div>
</body>
</html>
        `,
        
        'sales-contract': `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A4; margin: 15mm; }
        body { 
            font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif;
            line-height: 1.8;
            color: #333;
            padding: 20px;
        }
        h1 { 
            text-align: center;
            font-size: 24px;
            margin-bottom: 30px;
            padding: 20px;
            border: 2px solid #333;
        }
        h2 {
            font-size: 16px;
            margin-top: 25px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .article {
            margin-bottom: 20px;
        }
        .content {
            margin-left: 20px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table td {
            padding: 10px;
            border: 1px solid #ddd;
        }
        .table td:first-child {
            background: #f8f8f8;
            width: 30%;
            font-weight: bold;
        }
        .signature-area {
            margin-top: 50px;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .signature-line {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>不動産売買契約書（案）</h1>
    
    <p>売主（以下「甲」という）と買主（以下「乙」という）は、以下の通り不動産売買契約を締結する。</p>
    
    <div class="article">
        <h2>第1条（売買の目的物）</h2>
        <div class="content">
            <p>甲は、その所有する下記の不動産（以下「本物件」という）を乙に売り渡し、乙はこれを買い受ける。</p>
            <table class="table">
                <tr><td>物件名</td><td>南青山プリズムビル</td></tr>
                <tr><td>所在</td><td>東京都港区南青山五丁目10番5号</td></tr>
                <tr><td>土地</td><td>234.56㎡</td></tr>
                <tr><td>建物</td><td>鉄骨鉄筋コンクリート造8階建 1,234.56㎡</td></tr>
            </table>
        </div>
    </div>
    
    <div class="article">
        <h2>第2条（売買代金）</h2>
        <div class="content">
            <p>売買代金は金1,850,000,000円（消費税込み）とする。</p>
        </div>
    </div>
    
    <div class="article">
        <h2>第3条（支払方法）</h2>
        <div class="content">
            <p>1. 手付金: 契約締結時に金185,000,000円</p>
            <p>2. 残代金: 引渡時に金1,665,000,000円</p>
        </div>
    </div>
    
    <div class="article">
        <h2>第4条（引渡し）</h2>
        <div class="content">
            <p>甲は、残代金の受領と同時に本物件を現状有姿にて乙に引き渡す。</p>
            <p>引渡予定日: 契約締結日より60日以内</p>
        </div>
    </div>
    
    <div class="article">
        <h2>第5条（所有権移転）</h2>
        <div class="content">
            <p>本物件の所有権は、乙が売買代金全額の支払を完了した時に、甲から乙に移転する。</p>
        </div>
    </div>
    
    <div class="article">
        <h2>第6条（公租公課の負担）</h2>
        <div class="content">
            <p>本物件に対する公租公課は、引渡日の前日までは甲の負担とし、引渡日以降は乙の負担とする。</p>
        </div>
    </div>
    
    <div class="article">
        <h2>第7条（瑕疵担保責任）</h2>
        <div class="content">
            <p>甲は、本物件について瑕疵担保責任を負わないものとする。</p>
        </div>
    </div>
    
    <div class="article">
        <h2>第8条（契約違反による解除）</h2>
        <div class="content">
            <p>甲または乙が本契約に定める義務を履行しないときは、相手方は相当の期間を定めて催告の上、本契約を解除することができる。</p>
        </div>
    </div>
    
    <div class="article">
        <h2>第9条（特約事項）</h2>
        <div class="content">
            <p>1. 本物件の現況と登記簿の記載が異なる場合は、現況を優先する。</p>
            <p>2. 本物件に付属する什器備品等は、現状有姿にて引き渡す。</p>
        </div>
    </div>
    
    <div class="signature-area">
        <p>本契約成立の証として、本書2通を作成し、甲乙記名押印の上、各1通を保有する。</p>
        
        <p style="margin-top: 30px;">契約締結日: 令和　　年　　月　　日</p>
        
        <div class="signature-line">
            <div>
                <p>売主（甲）</p>
                <p>住所: ＿＿＿＿＿＿＿＿＿＿＿＿＿＿</p>
                <p>氏名: ＿＿＿＿＿＿＿＿＿＿＿＿ 印</p>
            </div>
        </div>
        
        <div class="signature-line">
            <div>
                <p>買主（乙）</p>
                <p>住所: ＿＿＿＿＿＿＿＿＿＿＿＿＿＿</p>
                <p>氏名: ＿＿＿＿＿＿＿＿＿＿＿＿ 印</p>
            </div>
        </div>
    </div>
</body>
</html>
        `
    };
    
    return templates[type] || null;
};

// PDF生成関数
async function generatePDF(htmlContent) {
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
        
        // HTMLコンテンツを設定
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });
        
        // PDF生成
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                right: '15mm',
                bottom: '15mm',
                left: '15mm'
            }
        });
        
        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

// Excelファイル生成（キャッシュフローシミュレーション）
async function generateExcel() {
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
}

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
        
        let buffer, filename, mimeType;
        
        if (type === 'cashflow-simulation') {
            // Excelファイル生成
            buffer = await generateExcel();
            filename = `南青山プリズムビル_10年間収支シミュレーション_${Date.now()}.xlsx`;
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } else {
            // PDF生成
            const htmlContent = generateHTMLContent(type);
            
            if (!htmlContent) {
                return res.status(400).json({
                    error: 'Invalid document type',
                    validTypes: ['property-overview', 'cashflow-simulation', 'loan-simulation', 'important-matters', 'sales-contract']
                });
            }
            
            buffer = await generatePDF(htmlContent);
            
            const typeNames = {
                'property-overview': '物件概要書_詳細版',
                'loan-simulation': '融資提案書_25年返済計画',
                'important-matters': '重要事項説明書案',
                'sales-contract': '売買契約書案'
            };
            
            filename = `南青山プリズムビル_${typeNames[type] || type}_${Date.now()}.pdf`;
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