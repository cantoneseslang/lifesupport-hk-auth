/**
 * OCR・自動記入機能テスト
 * 画像認識、OCR、自動記入機能のテスト
 */

class OCRAutoFillTest {
  constructor() {
    this.testResults = [];
    this.mockOCRResults = [];
    this.autoFillResults = [];
  }

  /**
   * 画像認識テスト
   */
  async testImageRecognition(imageFile) {
    console.log('🖼️ 画像認識テストを開始...');
    
    try {
      const recognitionResult = await this.recognizeImage(imageFile);
      
      const testResult = {
        test: 'Image Recognition',
        status: recognitionResult.success ? 'PASS' : 'FAIL',
        details: {
          imageType: recognitionResult.imageType,
          hasText: recognitionResult.hasText,
          confidence: recognitionResult.confidence,
          detectedElements: recognitionResult.detectedElements
        }
      };
      
      this.testResults.push(testResult);
      
      console.log(`✅ 画像認識テスト完了: ${recognitionResult.success ? 'SUCCESS' : 'FAILED'}`);
      
      return recognitionResult;
      
    } catch (error) {
      console.error('❌ 画像認識テストエラー:', error);
      this.testResults.push({
        test: 'Image Recognition',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * OCR機能テスト
   */
  async testOCRFunction(imageFile) {
    console.log('📝 OCR機能テストを開始...');
    
    try {
      const ocrResult = await this.performOCR(imageFile);
      
      const testResult = {
        test: 'OCR Function',
        status: ocrResult.success ? 'PASS' : 'FAIL',
        details: {
          extractedText: ocrResult.extractedText,
          confidence: ocrResult.confidence,
          language: ocrResult.language,
          textBlocks: ocrResult.textBlocks
        }
      };
      
      this.testResults.push(testResult);
      this.mockOCRResults.push(ocrResult);
      
      console.log(`✅ OCR機能テスト完了: ${ocrResult.extractedText.length} 文字抽出`);
      
      return ocrResult;
      
    } catch (error) {
      console.error('❌ OCR機能テストエラー:', error);
      this.testResults.push({
        test: 'OCR Function',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * 自動記入機能テスト
   */
  async testAutoFill(formData, ocrResult) {
    console.log('✏️ 自動記入機能テストを開始...');
    
    try {
      const autoFillResult = await this.performAutoFill(formData, ocrResult);
      
      const testResult = {
        test: 'Auto Fill Function',
        status: autoFillResult.success ? 'PASS' : 'FAIL',
        details: {
          filledFields: autoFillResult.filledFields,
          totalFields: autoFillResult.totalFields,
          accuracy: autoFillResult.accuracy,
          unmatchedFields: autoFillResult.unmatchedFields
        }
      };
      
      this.testResults.push(testResult);
      this.autoFillResults.push(autoFillResult);
      
      console.log(`✅ 自動記入機能テスト完了: ${autoFillResult.filledFields}/${autoFillResult.totalFields} 項目記入`);
      
      return autoFillResult;
      
    } catch (error) {
      console.error('❌ 自動記入機能テストエラー:', error);
      this.testResults.push({
        test: 'Auto Fill Function',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * 画像認識（モック実装）
   */
  async recognizeImage(imageFile) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // モック実装：実際の画像認識をシミュレート
        const mockResult = {
          success: true,
          imageType: 'form_document',
          hasText: true,
          confidence: 0.95,
          detectedElements: [
            { type: 'text_field', position: { x: 100, y: 200 }, label: 'お名前' },
            { type: 'text_field', position: { x: 100, y: 250 }, label: '会社名' },
            { type: 'radio_button', position: { x: 100, y: 300 }, label: '設立種類' },
            { type: 'text_field', position: { x: 100, y: 350 }, label: '資本金' },
            { type: 'text_field', position: { x: 100, y: 400 }, label: '登記住所' }
          ]
        };
        
        resolve(mockResult);
      }, 500);
    });
  }

  /**
   * OCR実行（モック実装）
   */
  async performOCR(imageFile) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // モック実装：実際のOCRをシミュレート
        const mockOCRResult = {
          success: true,
          extractedText: `
お名前: 田中太郎
会社名: 株式会社サンプル
設立種類: 新規法人設立
資本金: 1,000,000香港ドル
登記住所: 東京都渋谷区1-1-1
電話番号: 03-1234-5678
メールアドレス: tanaka@example.com
          `.trim(),
          confidence: 0.92,
          language: 'ja',
          textBlocks: [
            { text: 'お名前: 田中太郎', confidence: 0.95, position: { x: 100, y: 200 } },
            { text: '会社名: 株式会社サンプル', confidence: 0.90, position: { x: 100, y: 250 } },
            { text: '設立種類: 新規法人設立', confidence: 0.88, position: { x: 100, y: 300 } },
            { text: '資本金: 1,000,000香港ドル', confidence: 0.85, position: { x: 100, y: 350 } },
            { text: '登記住所: 東京都渋谷区1-1-1', confidence: 0.92, position: { x: 100, y: 400 } },
            { text: '電話番号: 03-1234-5678', confidence: 0.94, position: { x: 100, y: 450 } },
            { text: 'メールアドレス: tanaka@example.com', confidence: 0.96, position: { x: 100, y: 500 } }
          ]
        };
        
        resolve(mockOCRResult);
      }, 800);
    });
  }

  /**
   * 自動記入実行
   */
  async performAutoFill(formData, ocrResult) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // OCR結果から自動記入データを生成
        const autoFillData = this.generateAutoFillData(ocrResult);
        
        const result = {
          success: true,
          filledFields: Object.keys(autoFillData).length,
          totalFields: Object.keys(formData).length,
          accuracy: this.calculateAccuracy(autoFillData, formData),
          autoFillData: autoFillData,
          unmatchedFields: this.findUnmatchedFields(autoFillData, formData)
        };
        
        resolve(result);
      }, 300);
    });
  }

  /**
   * OCR結果から自動記入データを生成
   */
  generateAutoFillData(ocrResult) {
    const autoFillData = {};
    
    // OCR結果のテキストブロックから情報を抽出
    for (const block of ocrResult.textBlocks) {
      const text = block.text;
      
      // 名前の抽出
      if (text.includes('お名前:') || text.includes('名前:')) {
        autoFillData.name = this.extractValue(text, ['お名前:', '名前:']);
      }
      
      // 会社名の抽出
      if (text.includes('会社名:') || text.includes('会社:')) {
        autoFillData.company = this.extractValue(text, ['会社名:', '会社:']);
      }
      
      // 設立種類の抽出
      if (text.includes('設立種類:') || text.includes('設立:')) {
        autoFillData.establishmentType = this.extractValue(text, ['設立種類:', '設立:']);
      }
      
      // 資本金の抽出
      if (text.includes('資本金:') || text.includes('資本:')) {
        autoFillData.capital = this.extractValue(text, ['資本金:', '資本:']);
      }
      
      // 住所の抽出
      if (text.includes('登記住所:') || text.includes('住所:')) {
        autoFillData.address = this.extractValue(text, ['登記住所:', '住所:']);
      }
      
      // 電話番号の抽出
      if (text.includes('電話番号:') || text.includes('電話:')) {
        autoFillData.phone = this.extractValue(text, ['電話番号:', '電話:']);
      }
      
      // メールアドレスの抽出
      if (text.includes('メールアドレス:') || text.includes('メール:')) {
        autoFillData.email = this.extractValue(text, ['メールアドレス:', 'メール:']);
      }
    }
    
    return autoFillData;
  }

  /**
   * テキストから値を抽出
   */
  extractValue(text, prefixes) {
    for (const prefix of prefixes) {
      if (text.includes(prefix)) {
        return text.split(prefix)[1].trim();
      }
    }
    return '';
  }

  /**
   * 精度計算
   */
  calculateAccuracy(autoFillData, expectedData) {
    let correctFields = 0;
    let totalFields = 0;
    
    for (const [key, value] of Object.entries(autoFillData)) {
      if (expectedData[key]) {
        totalFields++;
        if (this.isValueMatch(value, expectedData[key])) {
          correctFields++;
        }
      }
    }
    
    return totalFields > 0 ? Math.round((correctFields / totalFields) * 100) : 0;
  }

  /**
   * 値の一致確認
   */
  isValueMatch(actual, expected) {
    if (typeof actual === 'string' && typeof expected === 'string') {
      return actual.toLowerCase().trim() === expected.toLowerCase().trim();
    }
    return actual === expected;
  }

  /**
   * マッチしない項目の検出
   */
  findUnmatchedFields(autoFillData, expectedData) {
    const unmatched = [];
    
    for (const [key, value] of Object.entries(expectedData)) {
      if (!autoFillData[key] || !this.isValueMatch(autoFillData[key], value)) {
        unmatched.push({
          field: key,
          expected: value,
          actual: autoFillData[key] || '未記入'
        });
      }
    }
    
    return unmatched;
  }

  /**
   * テスト結果の取得
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * OCR結果の取得
   */
  getOCRResults() {
    return this.mockOCRResults;
  }

  /**
   * 自動記入結果の取得
   */
  getAutoFillResults() {
    return this.autoFillResults;
  }

  /**
   * テスト結果の表示
   */
  displayResults() {
    console.log('\n📊 OCR・自動記入テスト結果:');
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
    
    // OCR結果の表示
    if (this.mockOCRResults.length > 0) {
      console.log('\n📝 OCR抽出結果:');
      for (const ocrResult of this.mockOCRResults) {
        console.log(`   抽出テキスト: ${ocrResult.extractedText.substring(0, 100)}...`);
        console.log(`   信頼度: ${Math.round(ocrResult.confidence * 100)}%`);
      }
    }
    
    // 自動記入結果の表示
    if (this.autoFillResults.length > 0) {
      console.log('\n✏️ 自動記入結果:');
      for (const autoFillResult of this.autoFillResults) {
        console.log(`   記入項目: ${autoFillResult.filledFields}/${autoFillResult.totalFields}`);
        console.log(`   精度: ${autoFillResult.accuracy}%`);
      }
    }
    
    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const totalCount = this.testResults.length;
    
    console.log('\n' + '='.repeat(50));
    console.log(`📈 成功率: ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)`);
  }
}

// テスト実行
async function runOCRAutoFillTests() {
  const tester = new OCRAutoFillTest();
  
  try {
    // テスト用画像ファイル（モック）
    const testImageFile = 'test-form-image.jpg';
    
    // 画像認識テスト
    await tester.testImageRecognition(testImageFile);
    
    // OCR機能テスト
    const ocrResult = await tester.testOCRFunction(testImageFile);
    
    // 自動記入機能テスト
    const expectedFormData = {
      name: '田中太郎',
      company: '株式会社サンプル',
      establishmentType: '新規法人設立',
      capital: '1,000,000香港ドル',
      address: '東京都渋谷区1-1-1',
      phone: '03-1234-5678',
      email: 'tanaka@example.com'
    };
    
    await tester.testAutoFill(expectedFormData, ocrResult);
    
    // 結果表示
    tester.displayResults();
    
    return tester.getTestResults();
    
  } catch (error) {
    console.error('❌ OCR・自動記入テスト実行エラー:', error);
    throw error;
  }
}

// メイン実行
if (require.main === module) {
  runOCRAutoFillTests()
    .then(results => {
      const hasFailures = results.some(r => r.status === 'FAIL' || r.status === 'ERROR');
      process.exit(hasFailures ? 1 : 0);
    })
    .catch(error => {
      console.error('テスト実行失敗:', error);
      process.exit(1);
    });
}

module.exports = { OCRAutoFillTest, runOCRAutoFillTests };
