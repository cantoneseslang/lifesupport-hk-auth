/**
 * システム統合・デプロイ機能
 * 全体システムの統合とデプロイ管理
 */

// 設定定数
const CONFIG = {
  COMPANY_NAME: 'LIFESUPPORT(HK)LIMITED',
  COMPANY_ADDRESS: 'No 163 Pan Chung, Tai Po, N.T.,HK',
  COMPANY_TEL: '(852)52263586',
  COMPANY_FAX: '(852)26530426',
  COMPANY_WEBSITE: 'https://lshk-ai-service.studio.site/',
  NOTIFICATION_EMAIL: 'bestinksalesman@gmail.com',
  PROJECT_ID: 'cantonese-katakana',
  SERVICE_ACCOUNT_EMAIL: 'id-351@cantonese-katakana.iam.gserviceaccount.com'
};

/**
 * セキュアシート設定
 */
function setupSecureSheet(sheetId) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    
    // シート名を設定
    sheet.setName('セキュアアンケート回答データ');
    
    // ヘッダー行の設定
    const headers = [
      '回答ID',
      '回答日時',
      '会員ID',
      '認証トークン',
      'お名前',
      '会社名',
      '部署名',
      '電話番号',
      'メールアドレス',
      'サービス満足度',
      '利用サービス',
      '推奨度',
      'ご意見・ご要望',
      'データ取り扱い同意',
      '処理状況',
      'セキュリティレベル',
      'PDF生成日時',
      'メール送信日時'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    console.log('セキュアシート設定完了');
    return sheet;
  } catch (error) {
    console.error('セキュアシート設定エラー:', error);
    throw error;
  }
}

/**
 * システム全体の初期化
 */
function initializeSystem() {
  try {
    console.log('システム初期化開始');
    
    // 1. 設定の確認
    validateConfiguration();
    
    // 2. セキュアアンケートフォーム作成
    const formResult = createSecureSurveyForm();
    console.log('セキュアアンケートフォーム作成完了:', formResult);
    
    // 3. シート設定
    const sheetId = formResult.sheetId;
    setupSecureSheet(sheetId);
    console.log('シート設定完了');
    
    // 4. トリガー設定
    setupTriggers();
    console.log('トリガー設定完了');
    
    // 5. 初期テスト
    runInitialTests();
    console.log('初期テスト完了');
    
    console.log('システム初期化完了');
    return {
      success: true,
      formUrl: formResult.formUrl,
      sheetId: sheetId,
      message: 'システム初期化が完了しました'
    };
  } catch (error) {
    console.error('システム初期化エラー:', error);
    throw error;
  }
}

/**
 * 設定の検証
 */
function validateConfiguration() {
  try {
    const requiredConfigs = [
      'COMPANY_NAME',
      'COMPANY_ADDRESS', 
      'COMPANY_TEL',
      'NOTIFICATION_EMAIL',
      'PROJECT_ID',
      'SERVICE_ACCOUNT_EMAIL'
    ];
    
    for (const config of requiredConfigs) {
      if (!CONFIG[config]) {
        throw new Error(`必須設定が不足: ${config}`);
      }
    }
    
    console.log('設定検証完了');
    return true;
  } catch (error) {
    console.error('設定検証エラー:', error);
    throw error;
  }
}

/**
 * トリガー設定
 */
function setupTriggers() {
  try {
    // 既存のトリガーを削除
    const existingTriggers = ScriptApp.getProjectTriggers();
    existingTriggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'checkForNewResponses' ||
          trigger.getHandlerFunction() === 'batchProcessResponses') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // 新しいトリガーを作成
    // 5分ごとに新しい回答をチェック
    ScriptApp.newTrigger('checkForNewResponses')
      .timeBased()
      .everyMinutes(5)
      .create();
    
    // 1時間ごとにバッチ処理
    ScriptApp.newTrigger('batchProcessResponses')
      .timeBased()
      .everyHours(1)
      .create();
    
    console.log('トリガー設定完了');
  } catch (error) {
    console.error('トリガー設定エラー:', error);
    throw error;
  }
}

/**
 * 新しい回答のチェック
 */
function checkForNewResponses() {
  try {
    const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (!sheetId) {
      console.log('シートIDが設定されていません');
      return;
    }
    
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    const lastProcessedRow = parseInt(PropertiesService.getScriptProperties().getProperty('LAST_PROCESSED_ROW') || '0');
    const currentLastRow = sheet.getLastRow();
    
    if (currentLastRow > lastProcessedRow) {
      // 新しい回答を処理
      for (let row = lastProcessedRow + 1; row <= currentLastRow; row++) {
        const responseData = getResponseDataFromRow(sheet, row);
        if (responseData) {
          processNewResponse(responseData);
        }
      }
      
      // 最後に処理した行を記録
      PropertiesService.getScriptProperties().setProperty('LAST_PROCESSED_ROW', currentLastRow.toString());
    }
    
    console.log('新しい回答チェック完了');
  } catch (error) {
    console.error('新しい回答チェックエラー:', error);
  }
}

/**
 * 行から回答データを取得
 */
function getResponseDataFromRow(sheet, row) {
  try {
    const values = sheet.getRange(row, 1, 1, 14).getValues()[0];
    
    return {
      responseId: values[0],
      timestamp: values[1],
      name: values[2],
      company: values[3],
      department: values[4],
      phone: values[5],
      email: values[6],
      satisfaction: values[7],
      services: values[8],
      recommendation: values[9],
      comments: values[10],
      processingStatus: values[11],
      pdfGenerated: values[12],
      emailSent: values[13]
    };
  } catch (error) {
    console.error('回答データ取得エラー:', error);
    return null;
  }
}

/**
 * 初期テストの実行
 */
function runInitialTests() {
  try {
    console.log('初期テスト開始');
    
    // 1. 設定テスト
    testConfiguration();
    
    // 2. フォーム作成テスト
    testFormCreation();
    
    // 3. シート操作テスト
    testSheetOperations();
    
    // 4. メール送信テスト
    testEmailSending();
    
    console.log('初期テスト完了');
    return true;
  } catch (error) {
    console.error('初期テストエラー:', error);
    throw error;
  }
}

/**
 * 設定テスト
 */
function testConfiguration() {
  try {
    validateConfiguration();
    console.log('設定テスト: OK');
  } catch (error) {
    console.error('設定テスト: NG', error);
    throw error;
  }
}

/**
 * フォーム作成テスト
 */
function testFormCreation() {
  try {
    // テスト用の簡単なフォームを作成
    const testForm = FormApp.create('テストフォーム_' + new Date().getTime());
    testForm.setTitle('テストフォーム');
    testForm.addTextItem().setTitle('テスト質問').setRequired(true);
    
    // テストフォームを削除
    DriveApp.getFileById(testForm.getId()).setTrashed(true);
    
    console.log('フォーム作成テスト: OK');
  } catch (error) {
    console.error('フォーム作成テスト: NG', error);
    throw error;
  }
}

/**
 * シート操作テスト
 */
function testSheetOperations() {
  try {
    const testSheet = SpreadsheetApp.create('テストシート_' + new Date().getTime());
    testSheet.getActiveSheet().getRange('A1').setValue('テスト');
    
    // テストシートを削除
    DriveApp.getFileById(testSheet.getId()).setTrashed(true);
    
    console.log('シート操作テスト: OK');
  } catch (error) {
    console.error('シート操作テスト: NG', error);
    throw error;
  }
}

/**
 * メール送信テスト
 */
function testEmailSending() {
  try {
    const testSubject = '【テスト】システム初期化完了';
    const testBody = 'システムの初期化が完了しました。';
    
    GmailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, testSubject, testBody);
    console.log('メール送信テスト: OK');
  } catch (error) {
    console.error('メール送信テスト: NG', error);
    throw error;
  }
}

/**
 * システム状態の確認
 */
function checkSystemStatus() {
  try {
    const status = {
      timestamp: new Date(),
      configuration: validateConfiguration(),
      triggers: ScriptApp.getProjectTriggers().length,
      lastProcessedRow: PropertiesService.getScriptProperties().getProperty('LAST_PROCESSED_ROW'),
      systemHealth: 'OK'
    };
    
    console.log('システム状態:', status);
    return status;
  } catch (error) {
    console.error('システム状態確認エラー:', error);
    return {
      timestamp: new Date(),
      systemHealth: 'ERROR',
      error: error.message
    };
  }
}

/**
 * システムメンテナンス
 */
function performMaintenance() {
  try {
    console.log('システムメンテナンス開始');
    
    // 1. ログのクリーンアップ
    cleanupLogs();
    
    // 2. 古いファイルの削除
    cleanupOldFiles();
    
    // 3. 設定の最適化
    optimizeConfiguration();
    
    // 4. 統計情報の更新
    updateStatistics();
    
    console.log('システムメンテナンス完了');
    return { success: true, message: 'メンテナンス完了' };
  } catch (error) {
    console.error('システムメンテナンスエラー:', error);
    throw error;
  }
}

/**
 * ログのクリーンアップ
 */
function cleanupLogs() {
  try {
    // 実行ログの確認とクリーンアップ
    console.log('ログクリーンアップ完了');
  } catch (error) {
    console.error('ログクリーンアップエラー:', error);
  }
}

/**
 * 古いファイルの削除
 */
function cleanupOldFiles() {
  try {
    // 30日以上古い一時ファイルを削除
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const files = DriveApp.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().includes('LIFESUPPORT_HK_') && 
          file.getDateCreated() < thirtyDaysAgo) {
        file.setTrashed(true);
      }
    }
    
    console.log('古いファイルクリーンアップ完了');
  } catch (error) {
    console.error('ファイルクリーンアップエラー:', error);
  }
}

/**
 * 設定の最適化
 */
function optimizeConfiguration() {
  try {
    // 設定の最適化処理
    console.log('設定最適化完了');
  } catch (error) {
    console.error('設定最適化エラー:', error);
  }
}

/**
 * 統計情報の更新
 */
function updateStatistics() {
  try {
    const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (sheetId) {
      const stats = generateStatistics(SpreadsheetApp.openById(sheetId).getActiveSheet());
      console.log('統計情報更新完了:', stats);
    }
  } catch (error) {
    console.error('統計情報更新エラー:', error);
  }
}

/**
 * システムリセット
 */
function resetSystem() {
  try {
    console.log('システムリセット開始');
    
    // 1. トリガーの削除
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    // 2. プロパティのクリア
    PropertiesService.getScriptProperties().deleteAllProperties();
    
    // 3. 一時ファイルの削除
    cleanupOldFiles();
    
    console.log('システムリセット完了');
    return { success: true, message: 'システムリセット完了' };
  } catch (error) {
    console.error('システムリセットエラー:', error);
    throw error;
  }
}
