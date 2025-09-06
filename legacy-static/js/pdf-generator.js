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
                    fontScript.onload = () => resolve();
                };
            });
        }
    }

    // 物件概要書PDF生成
    async generatePropertyOverview() {
        await this.loadJsPDF();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // タイトル
        doc.setFontSize(20);
        doc.text('Property Overview', 105, 30, { align: 'center' });
        doc.setFontSize(16);
        doc.text('Minamiaoyama PRISM Building', 105, 40, { align: 'center' });
        
        // 基本情報テーブル
        const propertyData = [
            ['Property Name', 'Minamiaoyama PRISM Building'],
            ['Location', 'Minato-ku, Tokyo 5-10-5'],
            ['Access', 'Omotesando Station 3 min walk'],
            ['Built Year', '2019 March'],
            ['Structure', 'SRC 8 floors'],
            ['Land Area', '234.56 sqm'],
            ['Building Area', '1,234.56 sqm'],
            ['Occupancy Rate', '100%'],
            ['Monthly Rent', '10,265,360 JPY']
        ];
        
        doc.autoTable({
            head: [['Item', 'Details']],
            body: propertyData,
            startY: 60,
            styles: { fontSize: 11 },
            headStyles: { fillColor: [0, 102, 204] }
        });
        
        // テナント情報
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Tenant Information', 20, 30);
        
        const tenantData = [
            ['8F', 'Premium Design', '154.32', '1,234,560'],
            ['7F', 'Global Consulting', '154.32', '1,234,560'],
            ['6F', 'Fashion Brand A', '154.32', '1,388,880'],
            ['5F', 'IT Company B', '154.32', '1,080,240'],
            ['4F', 'Law Office C', '154.32', '1,543,200'],
            ['3F', 'Beauty Clinic', '154.32', '1,697,520'],
            ['2F', 'Luxury Restaurant', '154.32', '925,920'],
            ['1F', 'Luxury Brand', '154.32', '2,160,480']
        ];
        
        doc.autoTable({
            head: [['Floor', 'Tenant', 'Area(sqm)', 'Monthly Rent(JPY)']],
            body: tenantData,
            startY: 40,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [0, 102, 204] }
        });
        
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