/**
 * アンケートフォーム検証テスト
 * 空白問題の検出と修正のテスト
 */

class FormValidationTest {
  constructor() {
    this.testResults = [];
    this.detectedIssues = [];
    this.fixedIssues = [];
  }

  /**
   * フォーム空白問題検出テスト
   */
  async testFormBlankDetection(formData) {
    console.log('🔍 フォーム空白問題検出テストを開始...');
    
    try {
      const detectionResult = await this.detectBlankIssues(formData);
      
      const testResult = {
        test: 'Form Blank Detection',
        status: detectionResult.issuesFound ? 'PASS' : 'FAIL',
        details: {
          totalFields: detectionResult.totalFields,
          blankFields: detectionResult.blankFields,
          issuesFound: detectionResult.issuesFound,
          criticalIssues: detectionResult.criticalIssues,
          warningIssues: detectionResult.warningIssues
        }
      };
      
      this.testResults.push(testResult);
      this.detectedIssues.push(...detectionResult.issues);
      
      console.log(`✅ フォーム空白問題検出テスト完了: ${detectionResult.issues.length} 件の問題検出`);
      
      return detectionResult;
      
    } catch (error) {
      console.error('❌ フォーム空白問題検出テストエラー:', error);
      this.testResults.push({
        test: 'Form Blank Detection',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * 自動修正テスト
   */
  async testAutoFix(formData, detectedIssues) {
    console.log('🔧 自動修正テストを開始...');
    
    try {
      const fixResult = await this.performAutoFix(formData, detectedIssues);
      
      const testResult = {
        test: 'Auto Fix',
        status: fixResult.success ? 'PASS' : 'FAIL',
        details: {
          totalIssues: fixResult.totalIssues,
          fixedIssues: fixResult.fixedIssues,
          unfixedIssues: fixResult.unfixedIssues,
          fixRate: fixResult.fixRate,
          remainingIssues: fixResult.remainingIssues
        }
      };
      
      this.testResults.push(testResult);
      this.fixedIssues.push(...fixResult.fixedIssues);
      
      console.log(`✅ 自動修正テスト完了: ${fixResult.fixedIssues}/${fixResult.totalIssues} 件修正`);
      
      return fixResult;
      
    } catch (error) {
      console.error('❌ 自動修正テストエラー:', error);
      this.testResults.push({
        test: 'Auto Fix',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * フォーム完全性検証テスト
   */
  async testFormCompleteness(formData) {
    console.log('📋 フォーム完全性検証テストを開始...');
    
    try {
      const completenessResult = this.validateFormCompleteness(formData);
      
      const testResult = {
        test: 'Form Completeness',
        status: completenessResult.isComplete ? 'PASS' : 'FAIL',
        details: {
          isComplete: completenessResult.isComplete,
          completionRate: completenessResult.completionRate,
          missingRequired: completenessResult.missingRequired,
          missingOptional: completenessResult.missingOptional,
          totalFields: completenessResult.totalFields,
          filledFields: completenessResult.filledFields
        }
      };
      
      this.testResults.push(testResult);
      
      console.log(`✅ フォーム完全性検証テスト完了: ${completenessResult.completionRate}% 完了`);
      
      return completenessResult;
      
    } catch (error) {
      console.error('❌ フォーム完全性検証テストエラー:', error);
      this.testResults.push({
        test: 'Form Completeness',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * 空白問題の検出
   */
  async detectBlankIssues(formData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const issues = [];
        const blankFields = [];
        let criticalIssues = 0;
        let warningIssues = 0;
        
        // 必須項目のチェック
        const requiredFields = [
          { key: 'name', label: 'お名前', critical: true },
          { key: 'company', label: '会社名', critical: true },
          { key: 'phone', label: '電話番号', critical: true },
          { key: 'email', label: 'メールアドレス', critical: true },
          { key: 'establishmentType', label: '設立種類', critical: true },
          { key: 'capital', label: '資本金', critical: false },
          { key: 'address', label: '登記住所', critical: true }
        ];
        
        for (const field of requiredFields) {
          const value = formData[field.key];
          
          if (!value || value.trim() === '') {
            blankFields.push(field.key);
            
            const issue = {
              field: field.key,
              label: field.label,
              type: field.critical ? 'critical' : 'warning',
              message: `${field.label}が未記入です`,
              suggestion: this.getSuggestion(field.key)
            };
            
            issues.push(issue);
            
            if (field.critical) {
              criticalIssues++;
            } else {
              warningIssues++;
            }
          }
        }
        
        // データ形式の問題検出
        if (formData.email && !this.isValidEmail(formData.email)) {
          issues.push({
            field: 'email',
            label: 'メールアドレス',
            type: 'critical',
            message: 'メールアドレスの形式が不正です',
            suggestion: '正しいメールアドレス形式で入力してください'
          });
          criticalIssues++;
        }
        
        if (formData.phone && !this.isValidPhone(formData.phone)) {
          issues.push({
            field: 'phone',
            label: '電話番号',
            type: 'critical',
            message: '電話番号の形式が不正です',
            suggestion: '正しい電話番号形式で入力してください'
          });
          criticalIssues++;
        }
        
        const result = {
          issuesFound: issues.length > 0,
          totalFields: requiredFields.length,
          blankFields: blankFields.length,
          issues: issues,
          criticalIssues: criticalIssues,
          warningIssues: warningIssues
        };
        
        resolve(result);
      }, 300);
    });
  }

  /**
   * 自動修正の実行
   */
  async performAutoFix(formData, detectedIssues) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const fixedIssues = [];
        const remainingIssues = [];
        
        for (const issue of detectedIssues) {
          const fixResult = this.attemptFix(formData, issue);
          
          if (fixResult.success) {
            fixedIssues.push({
              ...issue,
              fixed: true,
              fixMethod: fixResult.method,
              newValue: fixResult.newValue
            });
          } else {
            remainingIssues.push({
              ...issue,
              fixed: false,
              reason: fixResult.reason
            });
          }
        }
        
        const result = {
          success: fixedIssues.length > 0,
          totalIssues: detectedIssues.length,
          fixedIssues: fixedIssues.length,
          unfixedIssues: remainingIssues.length,
          fixRate: Math.round((fixedIssues.length / detectedIssues.length) * 100),
          fixedIssues: fixedIssues,
          remainingIssues: remainingIssues
        };
        
        resolve(result);
      }, 500);
    });
  }

  /**
   * 個別問題の修正試行
   */
  attemptFix(formData, issue) {
    // メールアドレスの自動修正
    if (issue.field === 'email' && issue.type === 'critical') {
      const email = formData.email;
      if (email && !email.includes('@')) {
        // ドメインを推測して修正
        const fixedEmail = email + '@example.com';
        return {
          success: true,
          method: 'domain_suggestion',
          newValue: fixedEmail
        };
      }
    }
    
    // 電話番号の自動修正
    if (issue.field === 'phone' && issue.type === 'critical') {
      const phone = formData.phone;
      if (phone && !phone.includes('-')) {
        // ハイフンを追加して修正
        const fixedPhone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        return {
          success: true,
          method: 'format_fix',
          newValue: fixedPhone
        };
      }
    }
    
    // その他の問題は自動修正不可
    return {
      success: false,
      reason: 'manual_fix_required'
    };
  }

  /**
   * フォーム完全性の検証
   */
  validateFormCompleteness(formData) {
    const allFields = [
      'name', 'company', 'department', 'phone', 'email',
      'establishmentType', 'capital', 'address', 'satisfaction',
      'services', 'recommendation', 'feedback', 'consent'
    ];
    
    const requiredFields = [
      'name', 'company', 'phone', 'email', 'establishmentType', 'address'
    ];
    
    const optionalFields = allFields.filter(field => !requiredFields.includes(field));
    
    const filledFields = allFields.filter(field => 
      formData[field] && formData[field].trim() !== ''
    );
    
    const missingRequired = requiredFields.filter(field => 
      !formData[field] || formData[field].trim() === ''
    );
    
    const missingOptional = optionalFields.filter(field => 
      !formData[field] || formData[field].trim() === ''
    );
    
    const completionRate = Math.round((filledFields.length / allFields.length) * 100);
    const isComplete = missingRequired.length === 0;
    
    return {
      isComplete: isComplete,
      completionRate: completionRate,
      missingRequired: missingRequired,
      missingOptional: missingOptional,
      totalFields: allFields.length,
      filledFields: filledFields.length
    };
  }

  /**
   * 修正提案の取得
   */
  getSuggestion(fieldKey) {
    const suggestions = {
      name: 'お名前を入力してください',
      company: '会社名を入力してください',
      phone: '電話番号を入力してください（例：03-1234-5678）',
      email: 'メールアドレスを入力してください（例：user@example.com）',
      establishmentType: '設立種類を選択してください',
      capital: '資本金を入力してください（例：1,000,000香港ドル）',
      address: '登記住所を入力してください'
    };
    
    return suggestions[fieldKey] || 'この項目を入力してください';
  }

  /**
   * メールアドレス検証
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 電話番号検証
   */
  isValidPhone(phone) {
    const phoneRegex = /^[\d\-\+\(\)\s]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * 検出された問題の取得
   */
  getDetectedIssues() {
    return this.detectedIssues;
  }

  /**
   * 修正された問題の取得
   */
  getFixedIssues() {
    return this.fixedIssues;
  }

  /**
   * テスト結果の取得
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * テスト結果の表示
   */
  displayResults() {
    console.log('\n📊 フォーム検証テスト結果:');
    console.log('='.repeat(50));
    
    for (const result of this.testResults) {
      const status = result.status === 'PASS' ? '✅' : 
                    result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${status} ${result.test}: ${result.status}`);
      
      if (result.details) {
        console.log(`   詳細:`, JSON.stringify(result.details, null, 2));
      }
      
      if (result.error) {
        console.log(`   エラー: ${result.error}`);
      }
    }
    
    // 検出された問題の表示
    if (this.detectedIssues.length > 0) {
      console.log('\n🔍 検出された問題:');
      for (const issue of this.detectedIssues) {
        const severity = issue.type === 'critical' ? '🔴' : '🟡';
        console.log(`   ${severity} ${issue.label}: ${issue.message}`);
        console.log(`      提案: ${issue.suggestion}`);
      }
    }
    
    // 修正された問題の表示
    if (this.fixedIssues.length > 0) {
      console.log('\n🔧 修正された問題:');
      for (const issue of this.fixedIssues) {
        console.log(`   ✅ ${issue.label}: ${issue.fixMethod} → ${issue.newValue}`);
      }
    }
    
    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const totalCount = this.testResults.length;
    
    console.log('\n' + '='.repeat(50));
    console.log(`📈 成功率: ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)`);
  }
}

// テスト実行
async function runFormValidationTests() {
  const tester = new FormValidationTest();
  
  try {
    // テスト用フォームデータ（空白問題あり）
    const testFormData = {
      name: '', // 空白
      company: 'テスト株式会社',
      department: '開発部',
      phone: '0312345678', // 形式不正
      email: 'test@example', // 形式不正
      establishmentType: '', // 空白
      capital: '1,000,000香港ドル',
      address: '', // 空白
      satisfaction: '5',
      services: 'コンサルティング',
      recommendation: '5',
      feedback: '良いサービスです',
      consent: '同意'
    };
    
    // フォーム空白問題検出テスト
    const detectionResult = await tester.testFormBlankDetection(testFormData);
    
    // 自動修正テスト
    await tester.testAutoFix(testFormData, detectionResult.issues);
    
    // フォーム完全性検証テスト
    await tester.testFormCompleteness(testFormData);
    
    // 結果表示
    tester.displayResults();
    
    return tester.getTestResults();
    
  } catch (error) {
    console.error('❌ フォーム検証テスト実行エラー:', error);
    throw error;
  }
}

// メイン実行
if (require.main === module) {
  runFormValidationTests()
    .then(results => {
      const hasFailures = results.some(r => r.status === 'FAIL' || r.status === 'ERROR');
      process.exit(hasFailures ? 1 : 0);
    })
    .catch(error => {
      console.error('テスト実行失敗:', error);
      process.exit(1);
    });
}

module.exports = { FormValidationTest, runFormValidationTests };
