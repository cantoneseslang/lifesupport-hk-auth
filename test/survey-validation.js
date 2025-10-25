/**
 * アンケート記入欄検証テスト
 * フォームの項目が正しく設定されているかをテスト
 */

const { expect } = require('chai');

class SurveyValidationTest {
  constructor() {
    this.testResults = [];
  }

  /**
   * フォーム項目の検証
   */
  async validateFormFields(formId) {
    console.log('🔍 フォーム項目検証を開始...');
    
    try {
      // モックデータでテスト
      const expectedFields = [
        'お名前',
        '会社名', 
        '部署名',
        '電話番号',
        'メールアドレス',
        'サービス満足度',
        '利用サービス',
        '推奨度',
        'ご意見・ご要望',
        'データ取り扱い同意'
      ];
      
      // 実際のフォーム取得（テスト環境ではモック）
      const formFields = await this.getFormFields(formId);
      
      const validationResults = {
        totalFields: expectedFields.length,
        foundFields: 0,
        missingFields: [],
        extraFields: []
      };
      
      // 必須項目の存在確認
      for (const expectedField of expectedFields) {
        const found = formFields.some(field => 
          (field.title && field.title.includes(expectedField)) || 
          (field.description && field.description.includes(expectedField))
        );
        
        if (found) {
          validationResults.foundFields++;
        } else {
          validationResults.missingFields.push(expectedField);
        }
      }
      
      // 余分な項目の検出
      for (const formField of formFields) {
        const isExpected = expectedFields.some(expected => 
          (formField.title && formField.title.includes(expected)) || 
          (formField.description && formField.description.includes(expected))
        );
        
        if (!isExpected) {
          validationResults.extraFields.push(formField.title);
        }
      }
      
      this.testResults.push({
        test: 'Form Fields Validation',
        status: validationResults.missingFields.length === 0 ? 'PASS' : 'FAIL',
        details: validationResults
      });
      
      console.log(`✅ フォーム項目検証完了: ${validationResults.foundFields}/${validationResults.totalFields} 項目発見`);
      
      return validationResults;
      
    } catch (error) {
      console.error('❌ フォーム項目検証エラー:', error);
      this.testResults.push({
        test: 'Form Fields Validation',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * フォーム項目取得（モック実装）
   */
  async getFormFields(formId) {
    // 実際の実装では Google Forms API を使用
    // テスト用のモックデータを返す
    return [
      { title: 'お名前', type: 'text', required: true },
      { title: '会社名', type: 'text', required: true },
      { title: '部署名', type: 'text', required: false },
      { title: '電話番号', type: 'text', required: true },
      { title: 'メールアドレス', type: 'text', required: true },
      { title: 'サービス満足度', type: 'scale', required: true },
      { title: '利用サービス', type: 'checkbox', required: true },
      { title: '推奨度', type: 'scale', required: true },
      { title: 'ご意見・ご要望', type: 'paragraph', required: false },
      { title: 'データ取り扱い同意', type: 'checkbox', required: true }
    ];
  }

  /**
   * 回答データの検証
   */
  async validateResponseData(responseData) {
    console.log('🔍 回答データ検証を開始...');
    
    const requiredFields = [
      'name', 'company', 'phone', 'email', 
      'satisfaction', 'services', 'recommendation', 'consent'
    ];
    
    const validationResults = {
      isValid: true,
      missingFields: [],
      invalidFields: []
    };
    
    // 必須項目の存在確認
    for (const field of requiredFields) {
      if (!responseData[field] || responseData[field].trim() === '') {
        validationResults.missingFields.push(field);
        validationResults.isValid = false;
      }
    }
    
    // データ形式の検証
    if (responseData.email && !this.isValidEmail(responseData.email)) {
      validationResults.invalidFields.push('email');
      validationResults.isValid = false;
    }
    
    if (responseData.phone && !this.isValidPhone(responseData.phone)) {
      validationResults.invalidFields.push('phone');
      validationResults.isValid = false;
    }
    
    this.testResults.push({
      test: 'Response Data Validation',
      status: validationResults.isValid ? 'PASS' : 'FAIL',
      details: validationResults
    });
    
    console.log(`✅ 回答データ検証完了: ${validationResults.isValid ? 'VALID' : 'INVALID'}`);
    
    return validationResults;
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
   * テスト結果の取得
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * テスト結果の表示
   */
  displayResults() {
    console.log('\n📊 テスト結果サマリー:');
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
    
    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const totalCount = this.testResults.length;
    
    console.log('\n' + '='.repeat(50));
    console.log(`📈 成功率: ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)`);
  }
}

// テスト実行
async function runSurveyValidationTests() {
  const tester = new SurveyValidationTest();
  
  try {
    // フォーム項目検証
    await tester.validateFormFields('test-form-id');
    
    // 回答データ検証
    const testResponseData = {
      name: 'テスト太郎',
      company: 'テスト株式会社',
      phone: '03-1234-5678',
      email: 'test@example.com',
      satisfaction: '5',
      services: 'コンサルティング,システム開発',
      recommendation: '5',
      consent: '同意'
    };
    
    await tester.validateResponseData(testResponseData);
    
    // 結果表示
    tester.displayResults();
    
    return tester.getTestResults();
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
    throw error;
  }
}

// メイン実行
if (require.main === module) {
  runSurveyValidationTests()
    .then(results => {
      const hasFailures = results.some(r => r.status === 'FAIL' || r.status === 'ERROR');
      process.exit(hasFailures ? 1 : 0);
    })
    .catch(error => {
      console.error('テスト実行失敗:', error);
      process.exit(1);
    });
}

module.exports = { SurveyValidationTest, runSurveyValidationTests };
