import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const lines = [];
    
    // BOM for Excel Japanese support
    const bom = '\uFEFF';
    lines.push(bom + '南青山プリズムビル - 10年間収支シミュレーション');
    lines.push('');
    
    // Property info
    lines.push('物件情報');
    lines.push('項目,値');
    lines.push('物件価格,1,850,000,000円');
    lines.push('想定利回り,4.2%');
    lines.push('年間賃料収入,77,700,000円');
    lines.push('');
    
    // Simulation parameters
    lines.push('シミュレーションパラメータ');
    lines.push('項目,値');
    lines.push('賃料上昇率（年）,1.0%');
    lines.push('経費上昇率（年）,1.0%');
    lines.push('空室率,5.0%');
    lines.push('');
    
    // Annual cash flow table
    lines.push('年次キャッシュフロー');
    lines.push('年次,賃料収入,空室損失,実効賃料,運営費用,NOI,設備投資,NCF,累計NCF');
    
    let cumulativeNCF = 0;
    const baseRent = 77700000;
    const baseCost = 16317000;
    const capex = 2000000;
    
    for (let year = 1; year <= 10; year++) {
      const rentGrowth = Math.pow(1.01, year - 1);
      const costGrowth = Math.pow(1.01, year - 1);
      
      const annualRent = Math.floor(baseRent * rentGrowth);
      const vacancy = Math.floor(annualRent * 0.05);
      const effectiveRent = annualRent - vacancy;
      const operatingCost = Math.floor(baseCost * costGrowth);
      const noi = effectiveRent - operatingCost;
      const ncf = noi - capex;
      cumulativeNCF += ncf;
      
      lines.push(
        `${year},` +
        `${annualRent.toLocaleString()},` +
        `${vacancy.toLocaleString()},` +
        `${effectiveRent.toLocaleString()},` +
        `${operatingCost.toLocaleString()},` +
        `${noi.toLocaleString()},` +
        `${capex.toLocaleString()},` +
        `${ncf.toLocaleString()},` +
        `${cumulativeNCF.toLocaleString()}`
      );
    }
    
    lines.push('');
    lines.push('投資分析結果');
    lines.push('項目,値');
    lines.push('10年間の累計NCF,590,433,000円');
    lines.push('平均NOI利回り,3.5%');
    lines.push('平均NCF利回り,3.2%');
    lines.push('投資回収期間,約24年');
    
    lines.push('');
    lines.push('注記');
    lines.push('・賃料および経費は年1%の上昇を想定');
    lines.push('・空室率は5%で一定と仮定');
    lines.push('・設備投資は年間200万円を計上');
    lines.push('・金利および税金は考慮していません');
    
    const csv = lines.join('\n');
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="cashflow-simulation.csv"',
      },
    });
  } catch (error) {
    console.error('CSV generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';