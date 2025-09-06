# PRISM VIP 管理画面 レポート作成システム仕様書

## 1. システム概要

管理画面上で物件レポートを作成し、会員向けに公開するためのシステム。
JSON投入の前段階として、フォームベースの入力システムを提供。

### 1.1 主要機能
- **フォーム入力**: 構造化されたフォームでデータ入力
- **自動計算**: 利回り、NOI、キャッシュフロー等を自動計算
- **データ検証**: 入力値の妥当性をリアルタイムチェック
- **プレビュー**: 会員向け表示をリアルタイムプレビュー
- **承認フロー**: レビュー→承認→公開のワークフロー
- **一括管理**: 複数物件のレポートを一元管理

## 2. レポート作成インターフェース

### 2.1 管理画面メニュー構成

```
/admin
  /reports
    /list              # レポート一覧
    /create            # 新規作成
    /edit/{id}         # 編集
    /preview/{id}      # プレビュー
    /approval          # 承認待ち一覧
    /published         # 公開済み一覧
```

### 2.2 レポート作成フォーム構造

#### タブ構成
```typescript
interface ReportTabs {
  basic: '基本情報',
  stage1: 'ステージ1: 概要',
  stage2: 'ステージ2: 収益',
  stage3: 'ステージ3: 査定',
  stage4: 'ステージ4: 融資',
  stage5: 'ステージ5: 投資判断'
}
```

### 2.3 基本情報タブ

```html
<form id="basicInfoForm">
  <!-- 物件ID（自動生成） -->
  <div class="form-group">
    <label>物件ID*</label>
    <input type="text" name="propertyId" readonly value="PRISM-2024-001">
  </div>

  <!-- 物件名 -->
  <div class="form-group">
    <label>物件名*</label>
    <input type="text" name="title" required 
           placeholder="例: PRISM南青山プレミアムレジデンス">
    <span class="char-count">0/100</span>
  </div>

  <!-- 所在地 -->
  <div class="form-group">
    <label>所在地*</label>
    <div class="address-input">
      <select name="prefecture" required>
        <option value="">都道府県</option>
        <option value="東京都">東京都</option>
        <!-- ... -->
      </select>
      <input type="text" name="city" placeholder="区市町村" required>
      <input type="text" name="address" placeholder="詳細住所" required>
    </div>
  </div>

  <!-- 物件種別 -->
  <div class="form-group">
    <label>物件種別*</label>
    <select name="propertyType" required onchange="updateTemplate()">
      <option value="">選択してください</option>
      <optgroup label="住宅系">
        <option value="マンション">マンション</option>
        <option value="アパート">アパート</option>
        <option value="戸建て">戸建て</option>
      </optgroup>
      <optgroup label="商業系">
        <option value="オフィスビル">オフィスビル</option>
        <option value="店舗">店舗</option>
        <option value="倉庫">倉庫</option>
      </optgroup>
      <optgroup label="特殊">
        <option value="ホテル">ホテル</option>
        <option value="医療施設">医療施設</option>
      </optgroup>
    </select>
  </div>

  <!-- 価格情報 -->
  <div class="form-section">
    <h3>価格情報</h3>
    <div class="form-row">
      <div class="form-group">
        <label>販売価格*</label>
        <input type="number" name="price" required 
               oninput="calculateYield()">
        <span class="unit">円</span>
      </div>
      <div class="form-group">
        <label>想定年間収入*</label>
        <input type="number" name="annualIncome" required
               oninput="calculateYield()">
        <span class="unit">円</span>
      </div>
      <div class="form-group">
        <label>表面利回り</label>
        <input type="text" name="yieldRate" readonly>
        <span class="unit">%</span>
        <span class="auto-calc">自動計算</span>
      </div>
    </div>
  </div>

  <!-- 建物情報 -->
  <div class="form-section">
    <h3>建物情報</h3>
    <div class="form-row">
      <div class="form-group">
        <label>土地面積</label>
        <input type="number" name="landArea" step="0.01">
        <span class="unit">㎡</span>
      </div>
      <div class="form-group">
        <label>建物面積</label>
        <input type="number" name="buildingArea" step="0.01">
        <span class="unit">㎡</span>
      </div>
      <div class="form-group">
        <label>築年数</label>
        <input type="number" name="buildingAge">
        <span class="unit">年</span>
      </div>
    </div>
  </div>
</form>
```

### 2.4 ステージ1: 物件概要タブ

```html
<form id="stage1Form">
  <!-- 物件概要 -->
  <div class="form-group">
    <label>物件概要*</label>
    <div class="rich-editor">
      <div class="editor-toolbar">
        <button type="button" data-command="bold">B</button>
        <button type="button" data-command="italic">I</button>
        <button type="button" data-command="bulletList">•</button>
      </div>
      <textarea name="overview" rows="10" required
                placeholder="物件の特徴、立地の優位性、投資メリットなどを記載">
      </textarea>
    </div>
    <span class="helper-text">Markdown形式対応</span>
  </div>

  <!-- 物件写真 -->
  <div class="form-group">
    <label>物件写真</label>
    <div class="image-uploader">
      <div class="upload-area" onclick="selectImages()">
        <i class="icon-upload"></i>
        <p>クリックまたはドラッグ&ドロップ</p>
        <p class="file-types">JPG, PNG (最大10MB)</p>
      </div>
      <div class="image-preview-grid">
        <!-- アップロード済み画像表示 -->
      </div>
    </div>
  </div>

  <!-- エリア分析 -->
  <div class="form-group">
    <label>エリア分析</label>
    <div class="area-analysis">
      <div class="form-row">
        <input type="text" name="nearestStation" 
               placeholder="最寄り駅">
        <input type="number" name="stationDistance" 
               placeholder="徒歩分数">
      </div>
      <textarea name="areaFeatures" rows="5"
                placeholder="エリアの特徴、将来性など"></textarea>
    </div>
  </div>
</form>
```

### 2.5 ステージ2: 収益シミュレーション

```html
<form id="stage2Form">
  <!-- 収入詳細 -->
  <div class="income-table">
    <h3>収入内訳</h3>
    <table class="editable-table">
      <thead>
        <tr>
          <th>項目</th>
          <th>部屋番号/用途</th>
          <th>面積(㎡)</th>
          <th>月額賃料(円)</th>
          <th>年額(円)</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="incomeRows">
        <tr>
          <td><input type="text" value="住居"></td>
          <td><input type="text" value="101"></td>
          <td><input type="number" value="25.5"></td>
          <td><input type="number" value="120000" 
                     oninput="updateIncomeTotals()"></td>
          <td class="auto-calc">1,440,000</td>
          <td><button type="button" onclick="removeRow(this)">×</button></td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">合計</td>
          <td id="monthlyTotal">120,000</td>
          <td id="annualTotal">1,440,000</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
    <button type="button" onclick="addIncomeRow()">+ 行を追加</button>
  </div>

  <!-- 支出詳細 -->
  <div class="expense-table">
    <h3>支出内訳</h3>
    <table class="editable-table">
      <thead>
        <tr>
          <th>費目</th>
          <th>年額(円)</th>
          <th>備考</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="expenseRows">
        <tr>
          <td>
            <select>
              <option>管理費</option>
              <option>修繕積立金</option>
              <option>固定資産税</option>
              <option>保険料</option>
              <option>その他</option>
            </select>
          </td>
          <td><input type="number" value="240000"
                     oninput="updateExpenseTotals()"></td>
          <td><input type="text"></td>
          <td><button type="button" onclick="removeRow(this)">×</button></td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>合計</td>
          <td id="expenseTotal">240,000</td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    </table>
    <button type="button" onclick="addExpenseRow()">+ 行を追加</button>
  </div>

  <!-- NOI計算 -->
  <div class="noi-calculation">
    <h3>NOI（純収益）</h3>
    <div class="calc-display">
      <div class="calc-item">
        <span>年間収入</span>
        <span id="noiIncome">1,440,000円</span>
      </div>
      <div class="calc-item">
        <span>年間支出</span>
        <span id="noiExpense">-240,000円</span>
      </div>
      <div class="calc-result">
        <span>NOI</span>
        <span id="noiResult">1,200,000円</span>
      </div>
      <div class="calc-result">
        <span>実質利回り</span>
        <span id="netYield">5.5%</span>
      </div>
    </div>
  </div>
</form>
```

## 3. データ検証ルール

### 3.1 リアルタイム検証

```javascript
const validators = {
  // 価格妥当性チェック
  price: (value, context) => {
    const area = context.area;
    const avgPrice = getAreaAveragePrice(area);
    const deviation = Math.abs(value - avgPrice) / avgPrice;
    
    if (deviation > 0.5) {
      return {
        level: 'warning',
        message: 'エリア平均価格から50%以上乖離しています'
      };
    }
    return null;
  },

  // 利回り妥当性チェック
  yieldRate: (value, propertyType) => {
    const standards = {
      'マンション': { min: 3, max: 8 },
      'アパート': { min: 4, max: 10 },
      'オフィスビル': { min: 3.5, max: 7 },
      'ホテル': { min: 4, max: 12 }
    };
    
    const standard = standards[propertyType];
    if (value < standard.min) {
      return {
        level: 'error',
        message: `${propertyType}の利回りとしては低すぎます（標準: ${standard.min}-${standard.max}%）`
      };
    }
    if (value > standard.max) {
      return {
        level: 'warning',
        message: `${propertyType}の利回りとしては高すぎます。リスクを確認してください`
      };
    }
    return null;
  },

  // 築年数による減価チェック
  buildingAge: (age, price, buildingType) => {
    const depreciationRate = getDepreciationRate(buildingType);
    const expectedValue = calculateExpectedValue(age, depreciationRate);
    
    // 検証ロジック
    return null;
  }
};
```

### 3.2 自動計算機能

```javascript
// 利回り計算
function calculateYield() {
  const price = parseFloat(document.querySelector('[name="price"]').value) || 0;
  const annualIncome = parseFloat(document.querySelector('[name="annualIncome"]').value) || 0;
  
  if (price > 0) {
    const yieldRate = (annualIncome / price * 100).toFixed(2);
    document.querySelector('[name="yieldRate"]').value = yieldRate;
    
    // 検証実行
    const validation = validators.yieldRate(yieldRate, getPropertyType());
    showValidation('yieldRate', validation);
  }
}

// NOI計算
function calculateNOI() {
  const income = calculateTotalIncome();
  const expenses = calculateTotalExpenses();
  const noi = income - expenses;
  const price = getPrice();
  
  document.getElementById('noiResult').textContent = formatCurrency(noi);
  
  if (price > 0) {
    const netYield = (noi / price * 100).toFixed(2);
    document.getElementById('netYield').textContent = netYield + '%';
  }
}

// キャッシュフロー計算
function calculateCashflow() {
  const noi = getNOI();
  const loanAmount = getLoanAmount();
  const interestRate = getInterestRate();
  const loanTerm = getLoanTerm();
  
  const annualPayment = calculateAnnualPayment(loanAmount, interestRate, loanTerm);
  const cashflow = noi - annualPayment;
  
  return {
    noi: noi,
    debtService: annualPayment,
    beforeTaxCashflow: cashflow,
    dscr: noi / annualPayment  // Debt Service Coverage Ratio
  };
}
```

## 4. プレビュー・承認フロー

### 4.1 プレビュー機能

```javascript
// リアルタイムプレビュー
class ReportPreview {
  constructor() {
    this.previewFrame = document.getElementById('previewFrame');
    this.updateTimer = null;
  }

  update() {
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {
      this.renderPreview();
    }, 500);
  }

  renderPreview() {
    const data = this.collectFormData();
    const html = this.generateHTML(data);
    
    // iframeに表示
    this.previewFrame.srcdoc = html;
  }

  generateHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="/assets/css/property-report.css">
        </head>
        <body>
          <div class="property-report">
            <h1>${data.title}</h1>
            <div class="property-overview">
              ${data.overview}
            </div>
            <!-- ステージ別コンテンツ -->
          </div>
        </body>
      </html>
    `;
  }
}
```

### 4.2 承認ワークフロー

```javascript
class ApprovalWorkflow {
  constructor() {
    this.statuses = {
      DRAFT: 'draft',
      REVIEW_REQUESTED: 'review_requested',
      IN_REVIEW: 'in_review',
      APPROVED: 'approved',
      PUBLISHED: 'published',
      REJECTED: 'rejected'
    };
  }

  // 承認リクエスト送信
  async requestReview(reportId) {
    const report = await this.getReport(reportId);
    
    // データ完全性チェック
    const validation = this.validateCompleteness(report);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }
    
    // ステータス更新
    await this.updateStatus(reportId, this.statuses.REVIEW_REQUESTED);
    
    // 承認者に通知
    await this.notifyReviewers(reportId);
    
    return { success: true };
  }

  // データ完全性チェック
  validateCompleteness(report) {
    const errors = [];
    const requiredFields = [
      'title', 'price', 'location', 'overview',
      'stage1', 'stage2', 'stage3', 'stage4', 'stage5'
    ];
    
    requiredFields.forEach(field => {
      if (!report[field]) {
        errors.push(`${field}が入力されていません`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}
```

## 5. 管理画面UI実装

### 5.1 レポート一覧画面

```html
<div class="admin-reports">
  <div class="page-header">
    <h1>物件レポート管理</h1>
    <button class="btn-primary" onclick="createNewReport()">
      + 新規レポート作成
    </button>
  </div>

  <div class="filters">
    <select id="statusFilter">
      <option value="">全ステータス</option>
      <option value="draft">下書き</option>
      <option value="review">レビュー中</option>
      <option value="approved">承認済み</option>
      <option value="published">公開中</option>
    </select>
    <input type="text" id="searchBox" placeholder="物件名で検索">
  </div>

  <table class="reports-table">
    <thead>
      <tr>
        <th>物件ID</th>
        <th>物件名</th>
        <th>価格</th>
        <th>ステータス</th>
        <th>作成者</th>
        <th>最終更新</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>PRISM-2024-001</td>
        <td>南青山プレミアムレジデンス</td>
        <td>6.8億円</td>
        <td><span class="badge badge-draft">下書き</span></td>
        <td>管理者A</td>
        <td>2024/09/04 15:30</td>
        <td>
          <button onclick="editReport('001')">編集</button>
          <button onclick="previewReport('001')">プレビュー</button>
          <button onclick="deleteReport('001')">削除</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 5.2 レポート作成画面

```html
<div class="report-editor">
  <div class="editor-header">
    <h1>レポート作成</h1>
    <div class="header-actions">
      <button onclick="saveDraft()">下書き保存</button>
      <button onclick="showPreview()">プレビュー</button>
      <button onclick="requestApproval()" class="btn-primary">承認申請</button>
    </div>
  </div>

  <div class="editor-body">
    <div class="tabs">
      <button class="tab active" data-tab="basic">基本情報</button>
      <button class="tab" data-tab="stage1">ステージ1</button>
      <button class="tab" data-tab="stage2">ステージ2</button>
      <button class="tab" data-tab="stage3">ステージ3</button>
      <button class="tab" data-tab="stage4">ステージ4</button>
      <button class="tab" data-tab="stage5">ステージ5</button>
    </div>

    <div class="tab-content">
      <!-- 各タブのフォーム -->
    </div>

    <div class="validation-summary">
      <h3>入力チェック</h3>
      <div id="validationMessages"></div>
    </div>
  </div>

  <!-- プレビューモーダル -->
  <div id="previewModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>レポートプレビュー</h2>
        <button onclick="closePreview()">×</button>
      </div>
      <iframe id="previewFrame"></iframe>
    </div>
  </div>
</div>
```

## 6. データ保存形式

### 6.1 レポートデータ構造

```typescript
interface PropertyReport {
  // メタデータ
  id: string;
  propertyId: string;
  version: number;
  status: ReportStatus;
  
  // 基本情報
  basic: {
    title: string;
    location: {
      prefecture: string;
      city: string;
      address: string;
    };
    propertyType: string;
    price: number;
    annualIncome: number;
    yieldRate: number;  // 自動計算
    landArea?: number;
    buildingArea?: number;
    buildingAge?: number;
  };
  
  // ステージ1: 物件概要
  stage1: {
    overview: string;  // Markdown
    photos: Array<{
      url: string;
      caption?: string;
    }>;
    nearestStation?: string;
    stationDistance?: number;
    areaFeatures?: string;
  };
  
  // ステージ2: 収益シミュレーション
  stage2: {
    incomeDetails: Array<{
      type: string;
      unit: string;
      area: number;
      monthlyRent: number;
    }>;
    expenseDetails: Array<{
      category: string;
      annualAmount: number;
      note?: string;
    }>;
    noi: number;  // 自動計算
    netYield: number;  // 自動計算
  };
  
  // ステージ3: 価格査定
  stage3: {
    marketPrice: number;
    bankValuation: number;
    incomeApproach: number;
    costApproach: number;
    salesComparison: number;
    prismValuation: number;
    valuationComment: string;
  };
  
  // ステージ4: 融資計画
  stage4: {
    loanAmount: number;
    interestRate: number;
    loanTerm: number;
    monthlyPayment: number;  // 自動計算
    cashflow: {
      beforeTax: number;  // 自動計算
      afterTax: number;  // 自動計算
    };
    dscr: number;  // 自動計算
  };
  
  // ステージ5: 投資判断
  stage5: {
    investmentScore: 'S' | 'A' | 'B' | 'C';
    risks: Array<{
      type: string;
      level: 'high' | 'medium' | 'low';
      description: string;
    }>;
    recommendation: string;
    documents: Array<{
      name: string;
      type: string;
      url: string;
    }>;
  };
  
  // 監査情報
  audit: {
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
    approvedBy?: string;
    approvedAt?: Date;
    publishedAt?: Date;
  };
}
```

## 7. 実装優先順位

### Phase 1: 基本機能（1週間）
1. レポート一覧画面
2. 基本情報入力フォーム
3. データ保存機能
4. 簡易プレビュー

### Phase 2: 高度な機能（1週間）
1. 全ステージフォーム実装
2. 自動計算機能
3. リアルタイム検証
4. 画像アップロード

### Phase 3: ワークフロー（3日）
1. 承認フロー実装
2. ステータス管理
3. 通知機能
4. 公開管理

### Phase 4: 最適化（3日）
1. パフォーマンス改善
2. UX改善
3. エラーハンドリング
4. テスト実装

## 8. セキュリティ考慮事項

- 管理者権限の確認
- 入力値のサニタイズ
- XSS対策
- CSRF対策
- データ暗号化
- 監査ログ記録

---
*最終更新日: 2024年9月4日*