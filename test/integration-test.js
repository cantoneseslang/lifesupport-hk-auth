/**
 * 統合テスト
 * アンケート記入から最終通知までの全体的な流れをテスト
 */

const { SurveyValidationTest } = require('./survey-validation');
const { SheetIntegrationTest } = require('./sheet-integration-test');
const { EmailNotificationTest } = require('./email-notification-test');
const { OCRAutoFillTest } = require('./ocr-auto-fill-test');
const { FileUploadTest } = require('./file-upload-test');
const { FormValidationTest } = require('./form-validation-test');

class IntegrationTest {
  constructor() {
    this.testResults = [];
    this.surveyTester = new SurveyValidationTest();
    this.sheetTester = new SheetIntegrationTest();
    this.emailTester = new EmailNotificationTest();
    this.ocrTester = new OCRAutoFillTest();
    this.uploadTester = new FileUploadTest();
    this.formTester = new FormValidationTest();
  }

  /**
   * エンドツーエンドテスト
   */
  async runEndToEndTest() {
    console.log('🚀 エンドツーエンドテストを開始...');
    
    try {
      // 1. フォーム項目検証
      console.log('\n📋 ステップ1: フォーム項目検証');
      await this.surveyTester.validateFormFields('test-form-id');
      
      // 2. 回答データ生成
      console.log('\n📝 ステップ2: 回答データ生成');
      const responseData = this.generateTestResponseData();
      await this.surveyTester.validateResponseData(responseData);
      
      // 3. シート連携テスト
      console.log('\n📊 ステップ3: シート連携テスト');
      const testSheetId = 'test-sheet-id';
      await this.sheetTester.testSheetConnection(testSheetId);
      await this.sheetTester.testDataWrite(testSheetId, responseData);
      await this.sheetTester.testDataValidation(testSheetId);
      
      // 4. ファイルアップロード・OCRテスト
      console.log('\n📁 ステップ4: ファイルアップロード・OCRテスト');
      const testFile = this.uploadTester.generateTestFileData();
      await this.uploadTester.testFileUpload(testFile);
      await this.uploadTester.testFileFormatValidation(testFile);
      await this.uploadTester.testImageProcessing(testFile);
      
      // 5. OCR・自動記入テスト
      console.log('\n🖼️ ステップ5: OCR・自動記入テスト');
      await this.ocrTester.testImageRecognition('test-form-image.jpg');
      const ocrResult = await this.ocrTester.testOCRFunction('test-form-image.jpg');
      await this.ocrTester.testAutoFill(responseData, ocrResult);
      
      // 6. フォーム検証テスト
      console.log('\n🔍 ステップ6: フォーム検証テスト');
      await this.formTester.testFormBlankDetection(responseData);
      await this.formTester.testFormCompleteness(responseData);
      
      // 7. メール通知テスト
      console.log('\n📧 ステップ7: メール通知テスト');
      const emailData = this.emailTester.generateTestEmailData();
      await this.emailTester.testEmailContent(emailData);
      await this.emailTester.testEmailSending('test@example.com', emailData);
      
      // 8. 統合結果の評価
      console.log('\n📈 ステップ8: 統合結果の評価');
      const integrationResult = this.evaluateIntegrationResults();
      
      this.testResults.push({
        test: 'End-to-End Integration',
        status: integrationResult.success ? 'PASS' : 'FAIL',
        details: integrationResult
      });
      
      console.log(`✅ エンドツーエンドテスト完了: ${integrationResult.success ? 'SUCCESS' : 'FAILED'}`);
      
      return integrationResult;
      
    } catch (error) {
      console.error('❌ エンドツーエンドテストエラー:', error);
      this.testResults.push({
        test: 'End-to-End Integration',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * パフォーマンステスト
   */
  async runPerformanceTest() {
    console.log('⚡ パフォーマンステストを開始...');
    
    const startTime = Date.now();
    
    try {
      // 並列テスト実行
      const promises = [
        this.surveyTester.validateFormFields('test-form-id'),
        this.sheetTester.testSheetConnection('test-sheet-id'),
        this.emailTester.testEmailContent(this.emailTester.generateTestEmailData())
      ];
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      const performanceResult = {
        executionTime: executionTime,
        targetTime: 5000, // 5秒目標
        isWithinTarget: executionTime <= 5000,
        parallelExecution: true
      };
      
      this.testResults.push({
        test: 'Performance Test',
        status: performanceResult.isWithinTarget ? 'PASS' : 'FAIL',
        details: performanceResult
      });
      
      console.log(`✅ パフォーマンステスト完了: ${executionTime}ms (目標: 5000ms)`);
      
      return performanceResult;
      
    } catch (error) {
      console.error('❌ パフォーマンステストエラー:', error);
      this.testResults.push({
        test: 'Performance Test',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * テスト用回答データの生成
   */
  generateTestResponseData() {
    return {
      name: 'テスト太郎',
      company: 'テスト株式会社',
      department: '開発部',
      phone: '03-1234-5678',
      email: 'test@example.com',
      satisfaction: '5',
      services: 'コンサルティング,システム開発',
      recommendation: '5',
      feedback: 'とても良いサービスです。継続利用を検討します。',
      consent: '同意'
    };
  }

  /**
   * 統合結果の評価
   */
  evaluateIntegrationResults() {
    const surveyResults = this.surveyTester.getTestResults();
    const sheetResults = this.sheetTester.getTestResults();
    const emailResults = this.emailTester.getTestResults();
    
    const allResults = [
      ...surveyResults, 
      ...sheetResults, 
      ...emailResults,
      ...this.ocrTester.getTestResults(),
      ...this.uploadTester.getTestResults(),
      ...this.formTester.getTestResults()
    ];
    
    const totalTests = allResults.length;
    const passedTests = allResults.filter(r => r.status === 'PASS').length;
    const failedTests = allResults.filter(r => r.status === 'FAIL').length;
    const errorTests = allResults.filter(r => r.status === 'ERROR').length;
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    return {
      success: successRate >= 80, // 80%以上で成功
      successRate: successRate,
      totalTests: totalTests,
      passedTests: passedTests,
      failedTests: failedTests,
      errorTests: errorTests,
        details: {
          surveyTests: surveyResults.length,
          sheetTests: sheetResults.length,
          emailTests: emailResults.length,
          ocrTests: this.ocrTester.getTestResults().length,
          uploadTests: this.uploadTester.getTestResults().length,
          formTests: this.formTester.getTestResults().length
        }
    };
  }

  /**
   * テスト結果の取得
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * 全テスト結果の表示
   */
  displayAllResults() {
    console.log('\n🎯 統合テスト結果サマリー:');
    console.log('='.repeat(60));
    
    // 各テストカテゴリの結果表示
    console.log('\n📋 アンケート検証テスト:');
    this.surveyTester.displayResults();
    
    console.log('\n📊 シート連携テスト:');
    this.sheetTester.displayResults();
    
    console.log('\n📧 メール通知テスト:');
    this.emailTester.displayResults();
    
    console.log('\n🎯 統合テスト結果:');
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
    
    // 全体統計
    const allResults = [
      ...this.surveyTester.getTestResults(),
      ...this.sheetTester.getTestResults(),
      ...this.emailTester.getTestResults(),
      ...this.testResults
    ];
    
    const totalTests = allResults.length;
    const passedTests = allResults.filter(r => r.status === 'PASS').length;
    const overallSuccessRate = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log(`🏆 全体成功率: ${passedTests}/${totalTests} (${overallSuccessRate}%)`);
    
    if (overallSuccessRate >= 80) {
      console.log('🎉 統合テスト成功！システムは正常に動作しています。');
    } else {
      console.log('⚠️ 統合テストに問題があります。詳細を確認してください。');
    }
  }
}

// テスト実行
async function runIntegrationTests() {
  const tester = new IntegrationTest();
  
  try {
    console.log('🚀 統合テストスイートを開始...');
    console.log('='.repeat(60));
    
    // エンドツーエンドテスト
    await tester.runEndToEndTest();
    
    // パフォーマンステスト
    await tester.runPerformanceTest();
    
    // 全結果表示
    tester.displayAllResults();
    
    return tester.getTestResults();
    
  } catch (error) {
    console.error('❌ 統合テスト実行エラー:', error);
    throw error;
  }
}

// メイン実行
if (require.main === module) {
  runIntegrationTests()
    .then(results => {
      const hasFailures = results.some(r => r.status === 'FAIL' || r.status === 'ERROR');
      process.exit(hasFailures ? 1 : 0);
    })
    .catch(error => {
      console.error('統合テスト実行失敗:', error);
      process.exit(1);
    });
}

module.exports = { IntegrationTest, runIntegrationTests };
