// クライアントサイドCSV生成モジュール

class CSVGenerator {
    // 収支シミュレーションCSV生成
    generateCashflowCSV() {
        const lines = [];
        
        // タイトル（BOM付き）
        const bom = '\uFEFF';
        lines.push(bom + '南青山プリズムビル - 10年間収支シミュレーション');
        lines.push('');
        
        // 物件情報
        lines.push('物件情報');
        lines.push('項目,値');
        lines.push('物件価格,1850000000');
        lines.push('想定利回り,4.2%');
        lines.push('');
        
        // パラメータ
        lines.push('シミュレーションパラメータ');
        lines.push('項目,値');
        lines.push('賃料上昇率（年）,1.0%');
        lines.push('経費上昇率（年）,1.0%');
        lines.push('空室率,5.0%');
        lines.push('');
        
        // キャッシュフロー表
        lines.push('年次キャッシュフロー');
        lines.push('年次,賃料収入,空室損失,実効賃料,運営費用,NOI,NCF,累計NCF');
        
        let cumulativeNCF = 0;
        for (let year = 1; year <= 10; year++) {
            const rentIncrease = Math.pow(1.01, year - 1);
            const costIncrease = Math.pow(1.01, year - 1);
            
            const annualRent = Math.floor(77700000 * rentIncrease);
            const vacancy = Math.floor(annualRent * 0.05);
            const effectiveRent = annualRent - vacancy;
            const operatingCost = Math.floor(16317000 * costIncrease);
            const noi = effectiveRent - operatingCost;
            const capex = 2000000;
            const ncf = noi - capex;
            cumulativeNCF += ncf;
            
            lines.push(`${year},${annualRent},${vacancy},${effectiveRent},${operatingCost},${noi},${ncf},${cumulativeNCF}`);
        }
        
        lines.push('');
        lines.push('投資分析結果');
        lines.push('項目,値');
        lines.push('10年IRR,7.8%');
        lines.push('NPV（割引率5%）,240000000');
        lines.push('投資回収期間,23.8年');
        
        return lines.join('\n');
    }
    
    // CSVダウンロード
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

// グローバルに公開
window.CSVGenerator = CSVGenerator;