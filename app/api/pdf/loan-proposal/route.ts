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
    .highlight {
      background: #fff3cd;
      padding: 15px;
      border-left: 4px solid #ffc107;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header-info">
    <div class="logo">PRISM VIP</div>
    <div>作成日: ${new Date().toLocaleDateString('ja-JP')}</div>
  </div>
  
  <h1>融資提案書</h1>
  <h2>南青山プリズムビル - 25年返済計画</h2>
  
  <table>
    <tr>
      <th width="40%">項目</th>
      <th width="60%">詳細</th>
    </tr>
    <tr>
      <td>物件価格</td>
      <td>18.5億円</td>
    </tr>
    <tr>
      <td>借入金額</td>
      <td>14.8億円（LTV 80%）</td>
    </tr>
    <tr>
      <td>自己資金</td>
      <td>3.7億円（20%）</td>
    </tr>
    <tr>
      <td>借入期間</td>
      <td>25年</td>
    </tr>
    <tr>
      <td>想定金利</td>
      <td>1.2% ～ 1.5%（変動金利）</td>
    </tr>
    <tr>
      <td>返済方法</td>
      <td>元利均等返済</td>
    </tr>
  </table>
  
  <h2>月額返済シミュレーション</h2>
  <table>
    <tr>
      <th>金利</th>
      <th>月額返済額</th>
      <th>年間返済額</th>
      <th>DSCR</th>
      <th>評価</th>
    </tr>
    <tr>
      <td>1.2%（最優遇）</td>
      <td>5,589,120円</td>
      <td>67,069,440円</td>
      <td>1.16</td>
      <td>健全</td>
    </tr>
    <tr>
      <td>1.35%（標準）</td>
      <td>5,736,480円</td>
      <td>68,837,760円</td>
      <td>1.13</td>
      <td>適正</td>
    </tr>
    <tr>
      <td>1.5%（保守的）</td>
      <td>5,884,800円</td>
      <td>70,617,600円</td>
      <td>1.10</td>
      <td>許容範囲</td>
    </tr>
  </table>
  
  <div class="highlight">
    <h3>DSCR（債務回収比率）について</h3>
    <p>年間NOI（営業純利益）÷ 年間返済額で計算。1.0以上で返済可能、1.2以上が理想的。</p>
    <p>本物件のNOI: 77,700,000円（賃料収入から経費を差し引いた額）</p>
  </div>
  
  <h2>融資条件の詳細</h2>
  <table>
    <tr>
      <td>担保設定</td>
      <td>第一順位抵当権設定</td>
    </tr>
    <tr>
      <td>保証</td>
      <td>連帯保証人または保証会社利用</td>
    </tr>
    <tr>
      <td>火災保険</td>
      <td>質権設定必須</td>
    </tr>
    <tr>
      <td>繰上返済</td>
      <td>可能（手数料別途）</td>
    </tr>
    <tr>
      <td>金利見直し</td>
      <td>6ヶ月毎</td>
    </tr>
  </table>
  
  <h2>推奨金融機関</h2>
  <ul>
    <li>メガバンク各行（三菱UFJ、三井住友、みずほ）</li>
    <li>信託銀行（三井住友信託、三菱UFJ信託）</li>
    <li>地方銀行（横浜銀行、千葉銀行）</li>
    <li>ノンバンク（オリックス、三井住友ファイナンス&リース）</li>
  </ul>
  
  <div class="highlight">
    <h3>ご提案</h3>
    <p>現在の低金利環境と物件の優良性を考慮すると、金利1.2%～1.35%での調達が期待できます。</p>
    <p>複数の金融機関から見積もりを取得し、最適な条件での資金調達をサポートいたします。</p>
  </div>
</body>
</html>
    `;
    
    const pdfBuffer = await generatePDFFromHTML(html);
    
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="loan-proposal.pdf"',
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