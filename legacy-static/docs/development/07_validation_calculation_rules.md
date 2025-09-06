# PRISM VIP レポート作成システム 検証・計算ルール仕様書

## 1. 検証ルール概要

### 1.1 検証レベル

```typescript
enum ValidationLevel {
  ERROR = 'error',     // 保存不可
  WARNING = 'warning', // 保存可能だが注意喚起
  INFO = 'info'       // 参考情報
}
```

### 1.2 検証タイミング

- **リアルタイム**: 入力中（onChange）
- **フォーカスアウト**: 項目から離れた時（onBlur）
- **保存前**: 下書き保存・承認申請時
- **公開前**: 最終チェック

## 2. 基本情報の検証ルール

### 2.1 物件名

```javascript
const propertyNameValidation = {
  required: true,
  minLength: 5,
  maxLength: 100,
  pattern: /^[ぁ-んァ-ヶー一-龯a-zA-Z0-9\s\-・]+$/,
  
  validate: (value) => {
    // 必須チェック
    if (!value || value.trim() === '') {
      return {
        level: ValidationLevel.ERROR,
        message: '物件名は必須です'
      };
    }
    
    // 長さチェック
    if (value.length < 5) {
      return {
        level: ValidationLevel.ERROR,
        message: '物件名は5文字以上で入力してください'
      };
    }
    
    // 禁止ワードチェック
    const bannedWords = ['テスト', 'test', 'sample', '仮'];
    if (bannedWords.some(word => value.includes(word))) {
      return {
        level: ValidationLevel.WARNING,
        message: 'テスト用の名称が含まれています'
      };
    }
    
    return null;
  }
};
```

### 2.2 価格検証

```javascript
const priceValidation = {
  validate: (price, context) => {
    const errors = [];
    
    // 範囲チェック
    if (price < 10000000) { // 1000万円未満
      errors.push({
        level: ValidationLevel.ERROR,
        message: '価格は1,000万円以上で入力してください'
      });
    }
    
    if (price > 10000000000) { // 100億円超
      errors.push({
        level: ValidationLevel.WARNING,
        message: '価格が100億円を超えています。入力ミスではありませんか？'
      });
    }
    
    // エリア相場との比較
    const areaAverage = getAreaAveragePrice(context.area, context.propertyType);
    const deviation = (price - areaAverage) / areaAverage;
    
    if (Math.abs(deviation) > 0.5) {
      errors.push({
        level: ValidationLevel.WARNING,
        message: `エリア相場（${formatCurrency(areaAverage)}）から50%以上乖離しています`
      });
    }
    
    return errors;
  }
};
```

### 2.3 利回り検証

```javascript
const yieldRateValidation = {
  // 物件種別ごとの標準利回り範囲
  standards: {
    'マンション': { min: 3.0, max: 8.0, avg: 5.5 },
    'アパート': { min: 4.0, max: 10.0, avg: 7.0 },
    'オフィスビル': { min: 3.5, max: 7.0, avg: 5.0 },
    '店舗': { min: 4.0, max: 9.0, avg: 6.5 },
    'ホテル': { min: 4.0, max: 12.0, avg: 8.0 },
    '倉庫': { min: 5.0, max: 15.0, avg: 10.0 }
  },
  
  validate: (yieldRate, propertyType) => {
    const standard = this.standards[propertyType];
    if (!standard) return null;
    
    const errors = [];
    
    // 下限チェック
    if (yieldRate < standard.min) {
      errors.push({
        level: ValidationLevel.ERROR,
        message: `${propertyType}の利回りとしては低すぎます（標準: ${standard.min}〜${standard.max}%）`
      });
    }
    
    // 上限チェック
    if (yieldRate > standard.max) {
      errors.push({
        level: ValidationLevel.WARNING,
        message: `${propertyType}の利回りとしては高すぎます。リスクの確認が必要です`
      });
    }
    
    // 平均との乖離
    const deviation = Math.abs(yieldRate - standard.avg) / standard.avg;
    if (deviation > 0.3 && errors.length === 0) {
      errors.push({
        level: ValidationLevel.INFO,
        message: `平均的な${propertyType}の利回り（${standard.avg}%）と比較して${deviation > 0 ? '高め' : '低め'}です`
      });
    }
    
    return errors;
  }
};
```

## 3. 自動計算ルール

### 3.1 表面利回り計算

```javascript
/**
 * 表面利回り = 年間賃料収入 ÷ 物件価格 × 100
 */
function calculateGrossYield(annualIncome, propertyPrice) {
  if (propertyPrice <= 0) return 0;
  return (annualIncome / propertyPrice * 100).toFixed(2);
}
```

### 3.2 NOI（純収益）計算

```javascript
/**
 * NOI = 年間賃料収入 - 年間運営費用
 * ※ 減価償却費と支払利息は含まない
 */
function calculateNOI(incomeData, expenseData) {
  // 収入合計
  const totalIncome = incomeData.reduce((sum, item) => {
    return sum + (item.monthlyRent * 12);
  }, 0);
  
  // 運営費用合計（減価償却と支払利息を除く）
  const operatingExpenses = expenseData
    .filter(item => !['減価償却費', '支払利息'].includes(item.category))
    .reduce((sum, item) => sum + item.annualAmount, 0);
  
  return totalIncome - operatingExpenses;
}
```

### 3.3 実質利回り計算

```javascript
/**
 * 実質利回り = NOI ÷ (物件価格 + 購入時諸費用) × 100
 */
function calculateNetYield(noi, propertyPrice, purchaseCosts) {
  const totalInvestment = propertyPrice + purchaseCosts;
  if (totalInvestment <= 0) return 0;
  return (noi / totalInvestment * 100).toFixed(2);
}

/**
 * 購入時諸費用の概算
 * 一般的に物件価格の7-10%
 */
function estimatePurchaseCosts(propertyPrice, propertyType) {
  const rates = {
    'マンション': 0.08,
    'アパート': 0.08,
    'オフィスビル': 0.10,
    '店舗': 0.09,
    'ホテル': 0.10,
    '倉庫': 0.07
  };
  
  return propertyPrice * (rates[propertyType] || 0.08);
}
```

### 3.4 キャッシュフロー計算

```javascript
/**
 * 税引前キャッシュフロー = NOI - 年間返済額
 */
function calculateBeforeTaxCashflow(noi, annualDebtService) {
  return noi - annualDebtService;
}

/**
 * 年間返済額計算（元利均等）
 */
function calculateAnnualDebtService(loanAmount, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return loanAmount / years;
  }
  
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  
  return monthlyPayment * 12;
}

/**
 * 税引後キャッシュフロー = 税引前CF - (課税所得 × 税率)
 * 課税所得 = NOI - 減価償却費 - 支払利息
 */
function calculateAfterTaxCashflow(beforeTaxCF, noi, depreciation, interestExpense, taxRate) {
  const taxableIncome = noi - depreciation - interestExpense;
  const tax = Math.max(0, taxableIncome * taxRate);
  return beforeTaxCF - tax;
}
```

### 3.5 DSCR（債務支払余力比率）計算

```javascript
/**
 * DSCR = NOI ÷ 年間返済額
 * 1.0以上で返済可能、1.2以上が望ましい
 */
function calculateDSCR(noi, annualDebtService) {
  if (annualDebtService <= 0) return null;
  return (noi / annualDebtService).toFixed(2);
}

function validateDSCR(dscr) {
  if (dscr < 1.0) {
    return {
      level: ValidationLevel.ERROR,
      message: 'DSCR が1.0未満です。返済能力に問題があります'
    };
  }
  if (dscr < 1.2) {
    return {
      level: ValidationLevel.WARNING,
      message: 'DSCR が1.2未満です。余裕のある返済計画の検討を推奨します'
    };
  }
  if (dscr > 3.0) {
    return {
      level: ValidationLevel.INFO,
      message: 'DSCR が高く、借入余力があります'
    };
  }
  return null;
}
```

### 3.6 LTV（借入比率）計算

```javascript
/**
 * LTV = 借入金額 ÷ 物件価格 × 100
 */
function calculateLTV(loanAmount, propertyPrice) {
  if (propertyPrice <= 0) return 0;
  return (loanAmount / propertyPrice * 100).toFixed(1);
}

function validateLTV(ltv, propertyType) {
  const maxLTV = {
    'マンション': 80,
    'アパート': 75,
    'オフィスビル': 70,
    '店舗': 65,
    'ホテル': 60,
    '倉庫': 70
  };
  
  const max = maxLTV[propertyType] || 70;
  
  if (ltv > max) {
    return {
      level: ValidationLevel.WARNING,
      message: `LTVが${propertyType}の一般的な上限（${max}%）を超えています`
    };
  }
  return null;
}
```

## 4. 収益シミュレーション検証

### 4.1 賃料妥当性チェック

```javascript
function validateRent(rentPerSqm, area, propertyType) {
  const marketRent = getMarketRentPerSqm(area, propertyType);
  const deviation = (rentPerSqm - marketRent) / marketRent;
  
  if (Math.abs(deviation) > 0.3) {
    return {
      level: ValidationLevel.WARNING,
      message: `㎡単価が市場相場（${formatCurrency(marketRent)}/㎡）から30%以上乖離しています`
    };
  }
  return null;
}
```

### 4.2 空室率設定

```javascript
function calculateEffectiveIncome(grossIncome, vacancyRate = 0.05) {
  return grossIncome * (1 - vacancyRate);
}

function getDefaultVacancyRate(propertyType, area) {
  // エリアと物件種別に応じた標準空室率
  const rates = {
    '都心5区': {
      'マンション': 0.03,
      'オフィスビル': 0.04,
      '店舗': 0.05
    },
    '23区内': {
      'マンション': 0.05,
      'オフィスビル': 0.06,
      '店舗': 0.08
    },
    '首都圏': {
      'マンション': 0.08,
      'オフィスビル': 0.10,
      '店舗': 0.12
    }
  };
  
  return rates[area]?.[propertyType] || 0.10;
}
```

## 5. 価格査定の検証

### 5.1 収益還元法

```javascript
/**
 * 収益価格 = NOI ÷ キャップレート
 */
function calculateIncomeApproachValue(noi, capRate) {
  if (capRate <= 0) return 0;
  return Math.round(noi / (capRate / 100));
}

function getMarketCapRate(area, propertyType) {
  // 市場のキャップレート（例）
  const rates = {
    '港区': {
      'マンション': 3.5,
      'オフィスビル': 3.0
    },
    '渋谷区': {
      'マンション': 3.8,
      'オフィスビル': 3.2
    }
    // ...
  };
  
  return rates[area]?.[propertyType] || 5.0;
}
```

### 5.2 査定価格の妥当性チェック

```javascript
function validateValuation(askingPrice, valuations) {
  const { marketPrice, bankValuation, incomeApproach } = valuations;
  const errors = [];
  
  // 各査定価格との乖離をチェック
  const deviations = {
    market: (askingPrice - marketPrice) / marketPrice,
    bank: (askingPrice - bankValuation) / bankValuation,
    income: (askingPrice - incomeApproach) / incomeApproach
  };
  
  // 市場価格との乖離
  if (Math.abs(deviations.market) > 0.15) {
    errors.push({
      level: ValidationLevel.WARNING,
      message: `販売価格が市場価格から${(deviations.market * 100).toFixed(0)}%乖離しています`
    });
  }
  
  // 銀行評価との乖離
  if (deviations.bank > 0.2) {
    errors.push({
      level: ValidationLevel.WARNING,
      message: '販売価格が銀行評価を大きく上回っています。融資に影響する可能性があります'
    });
  }
  
  return errors;
}
```

## 6. 投資判断の自動評価

### 6.1 投資スコアリング

```javascript
function calculateInvestmentScore(metrics) {
  const scores = {
    yieldScore: scoreYield(metrics.netYield),
    dscrScore: scoreDSCR(metrics.dscr),
    ltvScore: scoreLTV(metrics.ltv),
    locationScore: scoreLocation(metrics.location),
    ageScore: scoreBuildingAge(metrics.buildingAge)
  };
  
  // 重み付け平均
  const weights = {
    yield: 0.30,
    dscr: 0.25,
    ltv: 0.20,
    location: 0.15,
    age: 0.10
  };
  
  const totalScore = 
    scores.yieldScore * weights.yield +
    scores.dscrScore * weights.dscr +
    scores.ltvScore * weights.ltv +
    scores.locationScore * weights.location +
    scores.ageScore * weights.age;
  
  // S/A/B/C評価
  if (totalScore >= 85) return 'S';
  if (totalScore >= 70) return 'A';
  if (totalScore >= 55) return 'B';
  return 'C';
}

function scoreYield(netYield) {
  if (netYield >= 7) return 100;
  if (netYield >= 6) return 85;
  if (netYield >= 5) return 70;
  if (netYield >= 4) return 55;
  return 40;
}

function scoreDSCR(dscr) {
  if (dscr >= 1.5) return 100;
  if (dscr >= 1.3) return 85;
  if (dscr >= 1.2) return 70;
  if (dscr >= 1.0) return 55;
  return 30;
}
```

### 6.2 リスク評価

```javascript
function assessRisks(property) {
  const risks = [];
  
  // 築年数リスク
  if (property.buildingAge > 20) {
    risks.push({
      type: '老朽化リスク',
      level: property.buildingAge > 30 ? 'high' : 'medium',
      description: `築${property.buildingAge}年のため、大規模修繕の可能性があります`
    });
  }
  
  // 立地リスク
  if (property.stationDistance > 15) {
    risks.push({
      type: '立地リスク',
      level: 'medium',
      description: '駅から離れているため、賃貸需要に影響する可能性があります'
    });
  }
  
  // 利回りリスク
  if (property.netYield < 4) {
    risks.push({
      type: '収益性リスク',
      level: 'high',
      description: '実質利回りが低く、収益性に課題があります'
    });
  }
  
  // 融資リスク
  if (property.dscr < 1.2) {
    risks.push({
      type: '返済リスク',
      level: property.dscr < 1.0 ? 'high' : 'medium',
      description: 'DSCRが低く、返済余力に懸念があります'
    });
  }
  
  return risks;
}
```

## 7. 完全性チェック

### 7.1 必須項目チェック

```javascript
function checkCompleteness(report) {
  const requiredSections = {
    basic: [
      'title', 'location', 'propertyType', 'price', 'annualIncome'
    ],
    stage1: [
      'overview', 'photos'
    ],
    stage2: [
      'incomeDetails', 'expenseDetails'
    ],
    stage3: [
      'marketPrice', 'prismValuation', 'valuationComment'
    ],
    stage4: [
      'loanAmount', 'interestRate', 'loanTerm'
    ],
    stage5: [
      'investmentScore', 'recommendation'
    ]
  };
  
  const missing = [];
  
  Object.keys(requiredSections).forEach(section => {
    requiredSections[section].forEach(field => {
      if (!report[section]?.[field]) {
        missing.push({
          section,
          field,
          message: `${section}.${field}が入力されていません`
        });
      }
    });
  });
  
  return {
    isComplete: missing.length === 0,
    missing
  };
}
```

### 7.2 公開前チェック

```javascript
function prePublishValidation(report) {
  const errors = [];
  
  // 完全性チェック
  const completeness = checkCompleteness(report);
  if (!completeness.isComplete) {
    errors.push({
      level: ValidationLevel.ERROR,
      message: '必須項目が入力されていません',
      details: completeness.missing
    });
  }
  
  // 数値整合性チェック
  const calculations = validateCalculations(report);
  if (calculations.errors.length > 0) {
    errors.push(...calculations.errors);
  }
  
  // 画像チェック
  if (!report.stage1.photos || report.stage1.photos.length < 3) {
    errors.push({
      level: ValidationLevel.WARNING,
      message: '物件写真が3枚未満です'
    });
  }
  
  // ドキュメントチェック
  if (!report.stage5.documents || report.stage5.documents.length === 0) {
    errors.push({
      level: ValidationLevel.WARNING,
      message: '資料が添付されていません'
    });
  }
  
  return {
    canPublish: errors.filter(e => e.level === ValidationLevel.ERROR).length === 0,
    errors
  };
}
```

## 8. エラー表示とユーザーガイダンス

### 8.1 エラー表示コンポーネント

```javascript
class ValidationDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }
  
  showValidation(fieldName, validation) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const wrapper = field.closest('.form-group');
    
    // 既存のメッセージを削除
    wrapper.querySelectorAll('.validation-message').forEach(el => el.remove());
    
    if (validation) {
      const message = document.createElement('div');
      message.className = `validation-message validation-${validation.level}`;
      message.textContent = validation.message;
      wrapper.appendChild(message);
      
      // フィールドにもクラスを追加
      field.classList.add(`field-${validation.level}`);
    } else {
      field.classList.remove('field-error', 'field-warning', 'field-info');
    }
  }
  
  showSummary(validations) {
    this.container.innerHTML = '';
    
    if (validations.length === 0) {
      this.container.innerHTML = '<p class="all-valid">✓ すべての項目が正しく入力されています</p>';
      return;
    }
    
    const grouped = {
      error: validations.filter(v => v.level === ValidationLevel.ERROR),
      warning: validations.filter(v => v.level === ValidationLevel.WARNING),
      info: validations.filter(v => v.level === ValidationLevel.INFO)
    };
    
    Object.keys(grouped).forEach(level => {
      if (grouped[level].length > 0) {
        const section = document.createElement('div');
        section.className = `validation-section ${level}`;
        
        const title = document.createElement('h4');
        title.textContent = this.getLevelTitle(level);
        section.appendChild(title);
        
        const list = document.createElement('ul');
        grouped[level].forEach(item => {
          const li = document.createElement('li');
          li.textContent = item.message;
          list.appendChild(li);
        });
        section.appendChild(list);
        
        this.container.appendChild(section);
      }
    });
  }
  
  getLevelTitle(level) {
    const titles = {
      error: 'エラー（修正が必要）',
      warning: '警告（確認推奨）',
      info: '情報'
    };
    return titles[level];
  }
}
```

---
*最終更新日: 2024年9月4日*