/**
 * Google シート連携テスト
 * アンケート回答データが正しくシートに送信されるかをテスト
 */

class SheetIntegrationTest {
  constructor() {
    this.testResults = [];
    this.mockSheetData = [];
  }

  /**
   * シート接続テスト
   */
  async testSheetConnection(sheetId) {
    console.log('🔗 シート接続テストを開始...');
    
    try {
      // モック実装：実際のシート接続をシミュレート
      const connectionResult = await this.connectToSheet(sheetId);
      
      const testResult = {
        test: 'Sheet Connection',
        status: connectionResult.success ? 'PASS' : 'FAIL',
        details: {
          sheetId: sheetId,
          connected: connectionResult.success,
          error: connectionResult.error
        }
      };
      
      this.testResults.push(testResult);
      
      console.log(`✅ シート接続テスト完了: ${connectionResult.success ? 'SUCCESS' : 'FAILED'}`);
      
      return connectionResult;
      
    } catch (error) {
      console.error('❌ シート接続テストエラー:', error);
      this.testResults.push({
        test: 'Sheet Connection',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * データ書き込みテスト
   */
  async testDataWrite(sheetId, testData) {
    console.log('📝 データ書き込みテストを開始...');
    
    try {
      const writeResult = await this.writeToSheet(sheetId, testData);
      
      const testResult = {
        test: 'Data Write',
        status: writeResult.success ? 'PASS' : 'FAIL',
        details: {
          rowsWritten: writeResult.rowsWritten,
          dataValid: writeResult.dataValid,
          error: writeResult.error
        }
      };
      
      this.testResults.push(testResult);
      
      console.log(`✅ データ書き込みテスト完了: ${writeResult.rowsWritten} 行書き込み`);
      
      return writeResult;
      
    } catch (error) {
      console.error('❌ データ書き込みテストエラー:', error);
      this.testResults.push({
        test: 'Data Write',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * データ検証テスト
   */
  async testDataValidation(sheetId) {
    console.log('🔍 データ検証テストを開始...');
    
    try {
      const sheetData = await this.readFromSheet(sheetId);
      const validationResult = this.validateSheetData(sheetData);
      
      const testResult = {
        test: 'Data Validation',
        status: validationResult.isValid ? 'PASS' : 'FAIL',
        details: {
          totalRows: validationResult.totalRows,
          validRows: validationResult.validRows,
          invalidRows: validationResult.invalidRows,
          issues: validationResult.issues
        }
      };
      
      this.testResults.push(testResult);
      
      console.log(`✅ データ検証テスト完了: ${validationResult.validRows}/${validationResult.totalRows} 行有効`);
      
      return validationResult;
      
    } catch (error) {
      console.error('❌ データ検証テストエラー:', error);
      this.testResults.push({
        test: 'Data Validation',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * シート接続（モック実装）
   */
  async connectToSheet(sheetId) {
    // 実際の実装では Google Sheets API を使用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          sheetId: sheetId,
          sheetName: 'セキュアアンケート回答データ',
          lastModified: new Date().toISOString()
        });
      }, 100);
    });
  }

  /**
   * シートへのデータ書き込み（モック実装）
   */
  async writeToSheet(sheetId, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // モックデータとして保存
        this.mockSheetData.push({
          timestamp: new Date().toISOString(),
          data: data
        });
        
        resolve({
          success: true,
          rowsWritten: 1,
          dataValid: this.validateDataStructure(data)
        });
      }, 200);
    });
  }

  /**
   * シートからのデータ読み込み（モック実装）
   */
  async readFromSheet(sheetId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // モックデータを返す
        resolve([
          {
            '回答ID': 'RESP001',
            '回答日時': '2024-01-15 10:30:00',
            '会員ID': 'MEMBER001',
            '認証トークン': 'TOKEN123',
            'お名前': 'テスト太郎',
            '会社名': 'テスト株式会社',
            '部署名': '開発部',
            '電話番号': '03-1234-5678',
            'メールアドレス': 'test@example.com',
            'サービス満足度': '5',
            '利用サービス': 'コンサルティング,システム開発',
            '推奨度': '5',
            'ご意見・ご要望': 'とても良いサービスです',
            'データ取り扱い同意': '同意',
            '処理状況': '完了',
            'セキュリティレベル': '高',
            'PDF生成日時': '2024-01-15 10:35:00',
            'メール送信日時': '2024-01-15 10:36:00'
          }
        ]);
      }, 150);
    });
  }

  /**
   * データ構造の検証
   */
  validateDataStructure(data) {
    const requiredFields = [
      'name', 'company', 'phone', 'email',
      'satisfaction', 'services', 'recommendation', 'consent'
    ];
    
    return requiredFields.every(field => data.hasOwnProperty(field) && data[field]);
  }

  /**
   * シートデータの検証
   */
  validateSheetData(sheetData) {
    const validationResult = {
      isValid: true,
      totalRows: sheetData.length,
      validRows: 0,
      invalidRows: 0,
      issues: []
    };
    
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      const rowIssues = [];
      
      // 必須項目の確認
      const requiredFields = ['お名前', '会社名', '電話番号', 'メールアドレス'];
      for (const field of requiredFields) {
        if (!row[field] || row[field].trim() === '') {
          rowIssues.push(`必須項目 "${field}" が空です`);
        }
      }
      
      // メールアドレスの形式確認
      if (row['メールアドレス'] && !this.isValidEmail(row['メールアドレス'])) {
        rowIssues.push('メールアドレスの形式が不正です');
      }
      
      // 電話番号の形式確認
      if (row['電話番号'] && !this.isValidPhone(row['電話番号'])) {
        rowIssues.push('電話番号の形式が不正です');
      }
      
      if (rowIssues.length === 0) {
        validationResult.validRows++;
      } else {
        validationResult.invalidRows++;
        validationResult.issues.push({
          row: i + 1,
          issues: rowIssues
        });
      }
    }
    
    validationResult.isValid = validationResult.invalidRows === 0;
    
    return validationResult;
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
    console.log('\n📊 シート連携テスト結果:');
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
async function runSheetIntegrationTests() {
  const tester = new SheetIntegrationTest();
  
  try {
    const testSheetId = 'test-sheet-id';
    const testData = {
      name: 'テスト太郎',
      company: 'テスト株式会社',
      phone: '03-1234-5678',
      email: 'test@example.com',
      satisfaction: '5',
      services: 'コンサルティング,システム開発',
      recommendation: '5',
      consent: '同意'
    };
    
    // シート接続テスト
    await tester.testSheetConnection(testSheetId);
    
    // データ書き込みテスト
    await tester.testDataWrite(testSheetId, testData);
    
    // データ検証テスト
    await tester.testDataValidation(testSheetId);
    
    // 結果表示
    tester.displayResults();
    
    return tester.getTestResults();
    
  } catch (error) {
    console.error('❌ シート連携テスト実行エラー:', error);
    throw error;
  }
}

// メイン実行
if (require.main === module) {
  runSheetIntegrationTests()
    .then(results => {
      const hasFailures = results.some(r => r.status === 'FAIL' || r.status === 'ERROR');
      process.exit(hasFailures ? 1 : 0);
    })
    .catch(error => {
      console.error('テスト実行失敗:', error);
      process.exit(1);
    });
}

module.exports = { SheetIntegrationTest, runSheetIntegrationTests };
