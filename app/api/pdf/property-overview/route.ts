import { NextResponse } from 'next/server';
import { generatePDFFromHTML } from '@/lib/chromium';

export async function GET() {
  try {
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');
    body {
      font-family: 'Noto Sans JP', sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #0066cc;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 10px;
      font-size: 28px;
    }
    h2 {
      color: #333;
      margin-top: 30px;
      font-size: 20px;
      background: #f5f5f5;
      padding: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #0066cc;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 500;
    }
    td {
      border: 1px solid #ddd;
      padding: 12px;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .header-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #0066cc;
    }
  </style>
</head>
<body>
  <div class="header-info">
    <div class="logo">PRISM VIP</div>
    <div>作成日: ${new Date().toLocaleDateString('ja-JP')}</div>
  </div>
  
  <h1>物件概要書</h1>
  <h2>南青山プリズムビル</h2>
  
  <table>
    <tr>
      <th width="30%">項目</th>
      <th width="70%">詳細</th>
    </tr>
    <tr>
      <td>物件名称</td>
      <td>南青山プリズムビル</td>
    </tr>
    <tr>
      <td>所在地</td>
      <td>東京都港区南青山5-10-5</td>
    </tr>
    <tr>
      <td>アクセス</td>
      <td>東京メトロ表参道駅 徒歩3分</td>
    </tr>
    <tr>
      <td>竣工年月</td>
      <td>2019年3月</td>
    </tr>
    <tr>
      <td>構造・規模</td>
      <td>鉄骨鉄筋コンクリート造 地上8階建</td>
    </tr>
    <tr>
      <td>敷地面積</td>
      <td>234.56㎡</td>
    </tr>
    <tr>
      <td>延床面積</td>
      <td>1,234.56㎡</td>
    </tr>
    <tr>
      <td>賃貸可能面積</td>
      <td>1,080.24㎡</td>
    </tr>
    <tr>
      <td>稼働率</td>
      <td>100%</td>
    </tr>
    <tr>
      <td>月額賃料収入</td>
      <td>10,265,360円</td>
    </tr>
    <tr>
      <td>年間賃料収入</td>
      <td>123,184,320円</td>
    </tr>
  </table>
  
  <h2>テナント情報</h2>
  <table>
    <tr>
      <th>階数</th>
      <th>テナント名</th>
      <th>業種</th>
      <th>面積(㎡)</th>
      <th>月額賃料(円)</th>
    </tr>
    <tr>
      <td>8F</td>
      <td>プレミアムデザイン株式会社</td>
      <td>デザイン事務所</td>
      <td>154.32</td>
      <td>1,234,560</td>
    </tr>
    <tr>
      <td>7F</td>
      <td>グローバルコンサルティング</td>
      <td>コンサルティング</td>
      <td>154.32</td>
      <td>1,234,560</td>
    </tr>
    <tr>
      <td>6F</td>
      <td>ファッションブランドA</td>
      <td>アパレル</td>
      <td>154.32</td>
      <td>1,388,880</td>
    </tr>
    <tr>
      <td>5F</td>
      <td>ITカンパニーB</td>
      <td>IT企業</td>
      <td>154.32</td>
      <td>1,080,240</td>
    </tr>
    <tr>
      <td>4F</td>
      <td>法律事務所C</td>
      <td>法律事務所</td>
      <td>154.32</td>
      <td>1,543,200</td>
    </tr>
    <tr>
      <td>3F</td>
      <td>ビューティークリニック</td>
      <td>美容クリニック</td>
      <td>154.32</td>
      <td>1,697,520</td>
    </tr>
    <tr>
      <td>2F</td>
      <td>高級レストラン</td>
      <td>飲食店</td>
      <td>154.32</td>
      <td>925,920</td>
    </tr>
    <tr>
      <td>1F</td>
      <td>ラグジュアリーブランド</td>
      <td>小売店</td>
      <td>154.32</td>
      <td>2,160,480</td>
    </tr>
  </table>
  
  <h2>投資ハイライト</h2>
  <ul>
    <li>表参道駅至近の希少な一棟ビル</li>
    <li>安定した高級テナント構成</li>
    <li>100%稼働の優良物件</li>
    <li>築5年の新しい建物</li>
    <li>年間賃料収入1.2億円超</li>
  </ul>
</body>
</html>
    `;
    
    const pdfBuffer = await generatePDFFromHTML(html);
    
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="property-overview.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;