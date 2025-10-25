/**
 * システム初期化スクリプト
 * 全体システムの初期化とテスト実行
 */

/**
 * メイン初期化関数
 * この関数を実行してシステム全体を初期化
 */
function initializeCompleteSystem() {
  try {
    console.log('=== LIFESUPPORT(HK) セキュアアンケートシステム初期化開始 ===');
    
    // ステップ1: 設定の確認
    console.log('ステップ1: 設定確認中...');
    validateAllConfigurations();
    console.log('✅ 設定確認完了');
    
    // ステップ2: Supabaseデータベース初期化
    console.log('ステップ2: Supabaseデータベース初期化中...');
    const dbResult = initializeSupabaseDatabase();
    console.log('✅ Supabaseデータベース初期化完了:', dbResult);
    
    // ステップ3: 会員登録フォーム作成
    console.log('ステップ3: 会員登録フォーム作成中...');
    const registrationForm = createMemberRegistrationForm();
    console.log('✅ 会員登録フォーム作成完了:', registrationForm.formUrl);
    
    // ステップ4: セキュアアンケートフォーム作成
    console.log('ステップ4: セキュアアンケートフォーム作成中...');
    const surveyForm = createSecureSurveyForm();
    console.log('✅ セキュアアンケートフォーム作成完了:', surveyForm.formUrl);
    
    // ステップ5: シート設定
    console.log('ステップ5: シート設定中...');
    setupSecureSheet(surveyForm.sheetId);
    console.log('✅ シート設定完了');
    
    // ステップ6: トリガー設定
    console.log('ステップ6: トリガー設定中...');
    setupTriggers();
    console.log('✅ トリガー設定完了');
    
    // ステップ7: 初期テスト実行
    console.log('ステップ7: 初期テスト実行中...');
    const testResult = runInitialTests();
    console.log('✅ 初期テスト完了:', testResult);
    
    // ステップ8: 設定保存
    console.log('ステップ8: 設定保存中...');
    saveSystemConfiguration({
      registrationFormUrl: registrationForm.formUrl,
      surveyFormUrl: surveyForm.formUrl,
      sheetId: surveyForm.sheetId,
      formId: surveyForm.formId
    });
    console.log('✅ 設定保存完了');
    
    console.log('=== システム初期化完了 ===');
    
    // 初期化完了メール送信
    sendInitializationCompleteEmail({
      registrationFormUrl: registrationForm.formUrl,
      surveyFormUrl: surveyForm.formUrl,
      systemStatus: '初期化完了'
    });
    
    return {
      success: true,
      message: 'システム初期化が完了しました',
      registrationFormUrl: registrationForm.formUrl,
      surveyFormUrl: surveyForm.formUrl,
      sheetId: surveyForm.sheetId,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('システム初期化エラー:', error);
    
    // エラー通知メール送信
    sendInitializationErrorEmail(error);
    
    throw error;
  }
}

/**
 * 全設定の検証
 */
function validateAllConfigurations() {
  try {
    // Google設定の確認
    validateGoogleConfiguration();
    
    // Supabase設定の確認
    validateSupabaseConfiguration();
    
    // メール設定の確認
    validateEmailConfiguration();
    
    console.log('全設定検証完了');
    return true;
  } catch (error) {
    console.error('設定検証エラー:', error);
    throw error;
  }
}

/**
 * Google設定の検証
 */
function validateGoogleConfiguration() {
  try {
    // 必要なAPIの確認
    const requiredApis = ['Sheets', 'Forms', 'Gmail', 'Drive'];
    
    for (const api of requiredApis) {
      try {
        // APIアクセステスト
        testApiAccess(api);
      } catch (error) {
        throw new Error(`${api} API へのアクセスに失敗しました: ${error.message}`);
      }
    }
    
    console.log('Google設定検証完了');
    return true;
  } catch (error) {
    console.error('Google設定検証エラー:', error);
    throw error;
  }
}

/**
 * Supabase設定の検証
 */
function validateSupabaseConfiguration() {
  try {
    // Supabase接続テスト
    const connectionTest = checkSupabaseDatabaseStatus();
    
    if (!connectionTest.connection) {
      throw new Error('Supabaseデータベースへの接続に失敗しました');
    }
    
    console.log('Supabase設定検証完了');
    return true;
  } catch (error) {
    console.error('Supabase設定検証エラー:', error);
    throw error;
  }
}

/**
 * メール設定の検証
 */
function validateEmailConfiguration() {
  try {
    // メール送信テスト
    const testSubject = '【テスト】システム初期化確認';
    const testBody = 'システム初期化のテストメールです。';
    
    GmailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, testSubject, testBody);
    
    console.log('メール設定検証完了');
    return true;
  } catch (error) {
    console.error('メール設定検証エラー:', error);
    throw error;
  }
}

/**
 * APIアクセステスト
 */
function testApiAccess(apiName) {
  try {
    switch (apiName) {
      case 'Sheets':
        SpreadsheetApp.create('テストシート_' + new Date().getTime());
        break;
      case 'Forms':
        FormApp.create('テストフォーム_' + new Date().getTime());
        break;
      case 'Gmail':
        GmailApp.getInboxThreads(0, 1);
        break;
      case 'Drive':
        DriveApp.getFiles().hasNext();
        break;
    }
    
    console.log(`${apiName} API アクセステスト完了`);
    return true;
  } catch (error) {
    console.error(`${apiName} API アクセステストエラー:`, error);
    throw error;
  }
}

/**
 * システム設定の保存
 */
function saveSystemConfiguration(config) {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    properties.setProperty('REGISTRATION_FORM_URL', config.registrationFormUrl);
    properties.setProperty('SURVEY_FORM_URL', config.surveyFormUrl);
    properties.setProperty('SHEET_ID', config.sheetId);
    properties.setProperty('FORM_ID', config.formId);
    properties.setProperty('INITIALIZATION_DATE', new Date().toISOString());
    properties.setProperty('SYSTEM_STATUS', 'initialized');
    
    console.log('システム設定保存完了');
    return true;
  } catch (error) {
    console.error('システム設定保存エラー:', error);
    throw error;
  }
}

/**
 * 初期化完了メール送信
 */
function sendInitializationCompleteEmail(config) {
  try {
    const subject = '【LIFESUPPORT(HK)】システム初期化完了通知';
    const body = `
LIFESUPPORT(HK) セキュアアンケートシステムの初期化が完了しました。

システム情報:
- 会員登録フォーム: ${config.registrationFormUrl}
- セキュアアンケートフォーム: ${config.surveyFormUrl}
- システム状態: ${config.systemStatus}
- 初期化日時: ${new Date()}

システムは正常に動作しています。

---
LIFESUPPORT(HK)LIMITED
No 163 Pan Chung, Tai Po, N.T.,HK
Tel: (852)52263586
Fax: (852)26530426
Website: https://lshk-ai-service.studio.site/
    `;
    
    GmailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, subject, body);
    console.log('初期化完了メール送信完了');
  } catch (error) {
    console.error('初期化完了メール送信エラー:', error);
  }
}

/**
 * 初期化エラーメール送信
 */
function sendInitializationErrorEmail(error) {
  try {
    const subject = '【LIFESUPPORT(HK)】システム初期化エラー通知';
    const body = `
LIFESUPPORT(HK) セキュアアンケートシステムの初期化中にエラーが発生しました。

エラー情報:
- エラーメッセージ: ${error.message}
- 発生日時: ${new Date()}
- スタックトレース: ${error.stack}

システム管理者による対応が必要です。

---
LIFESUPPORT(HK)LIMITED
No 163 Pan Chung, Tai Po, N.T.,HK
Tel: (852)52263586
Fax: (852)26530426
Website: https://lshk-ai-service.studio.site/
    `;
    
    GmailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, subject, body);
    console.log('初期化エラーメール送信完了');
  } catch (error) {
    console.error('初期化エラーメール送信エラー:', error);
  }
}

/**
 * システム状態の確認
 */
function checkSystemStatus() {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    const status = {
      timestamp: new Date(),
      systemStatus: properties.getProperty('SYSTEM_STATUS') || 'not_initialized',
      initializationDate: properties.getProperty('INITIALIZATION_DATE'),
      registrationFormUrl: properties.getProperty('REGISTRATION_FORM_URL'),
      surveyFormUrl: properties.getProperty('SURVEY_FORM_URL'),
      sheetId: properties.getProperty('SHEET_ID'),
      formId: properties.getProperty('FORM_ID'),
      triggers: ScriptApp.getProjectTriggers().length,
      lastProcessedRow: properties.getProperty('LAST_PROCESSED_ROW')
    };
    
    console.log('システム状態:', status);
    return status;
  } catch (error) {
    console.error('システム状態確認エラー:', error);
    return {
      timestamp: new Date(),
      systemStatus: 'error',
      error: error.message
    };
  }
}

/**
 * システムリセット
 */
function resetSystem() {
  try {
    console.log('システムリセット開始');
    
    // トリガーの削除
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    // プロパティのクリア
    PropertiesService.getScriptProperties().deleteAllProperties();
    
    // 一時ファイルの削除
    cleanupOldFiles();
    
    console.log('システムリセット完了');
    return {
      success: true,
      message: 'システムリセットが完了しました'
    };
  } catch (error) {
    console.error('システムリセットエラー:', error);
    throw error;
  }
}

/**
 * 古いファイルのクリーンアップ
 */
function cleanupOldFiles() {
  try {
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

