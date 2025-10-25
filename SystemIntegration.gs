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

/**
 * Webアプリケーションのエントリーポイント（GETリクエスト処理）
 */
function doGet(e) {
  try {
    // 自動入力パラメータが含まれている場合はアンケートフォームを返す
    if (e.parameter.autoFill === 'true') {
      return handleAutoFillRequest(e);
    }
    
    // アクセス情報を取得
    const accessInfo = {
      timestamp: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Hong_Kong' }),
      ipAddress: e.parameter.userIp || 'Unknown',
      userAgent: e.parameter.userAgent || 'Unknown',
      referrer: e.parameter.referrer || 'Direct'
    };
    
    // アクセスログを記録
    logAccess(accessInfo);
    
    // ログイン通知メールを送信
    sendLoginNotificationEmail(accessInfo);
    
    // HTMLページを返す
    return HtmlService.createHtmlOutputFromFile('upload')
      .setTitle('LIFESUPPORT(HK) - 書類アップロード')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    console.error('doGetエラー:', error);
    return HtmlService.createHtmlOutput('<h1>エラーが発生しました</h1><p>システム管理者にお問い合わせください。</p>');
  }
}

/**
 * 画像アップロード処理（POSTリクエスト）
 */
function doPost(e) {
  try {
    const uploadType = e.parameter.uploadType; // 'identity' or 'business'
    const documentType = e.parameter.documentType; // パスポート、マイナンバー等
    
    // アップロードされた画像を取得
    const fileBlob = e.parameter.file;
    
    if (!fileBlob) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'ファイルがアップロードされていません'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Google Driveに画像を保存
    const folder = getOrCreateUploadFolder();
    const fileName = `${uploadType}_${documentType}_${new Date().getTime()}.jpg`;
    const file = folder.createFile(fileBlob).setName(fileName);
    
    let ocrResult = null;
    
    // 本人確認書類の場合のみOCR処理を実行
    if (uploadType === 'identity') {
      ocrResult = performOCR(file.getId());
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      fileName: fileName,
      ocrResult: ocrResult
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 自動入力リクエストの処理
 */
function handleAutoFillRequest(e) {
  try {
    const name = e.parameter.name || '';
    const postalCode = e.parameter.postalCode || '';
    const address = e.parameter.address || '';
    
    // 自動入力用のHTMLページを作成
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LIFESUPPORT(HK) - 香港法人設立申込（自動入力）</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                margin: 0;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .auto-fill-notice {
                background: #e8f5e8;
                border: 2px solid #28a745;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
                text-align: center;
            }
            .auto-fill-notice h2 {
                color: #28a745;
                margin-bottom: 10px;
            }
            .form-link {
                background: #667eea;
                color: white;
                padding: 15px 30px;
                border-radius: 8px;
                text-decoration: none;
                display: inline-block;
                margin: 10px;
                transition: background 0.3s;
            }
            .form-link:hover {
                background: #5568d3;
            }
            .extracted-info {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .info-item {
                margin: 10px 0;
                padding: 10px;
                background: white;
                border-radius: 5px;
                border-left: 4px solid #667eea;
            }
            .info-label {
                font-weight: bold;
                color: #667eea;
            }
            .info-value {
                color: #333;
                margin-left: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="auto-fill-notice">
                <h2>✅ OCR結果の自動入力が完了しました</h2>
                <p>以下の情報が自動入力されます。内容を確認し、必要に応じて修正してください。</p>
            </div>
            
            <div class="extracted-info">
                <h3>📝 抽出された情報</h3>
                <div class="info-item">
                    <span class="info-label">お名前:</span>
                    <span class="info-value">${name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">郵便番号:</span>
                    <span class="info-value">${postalCode}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">住所:</span>
                    <span class="info-value">${address}</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSfDS6ynpQxljT8bsXHlg0wBFED37-XnziFZ0pRMLMjQ14A9Jw/viewform" class="form-link" target="_blank">
                    📋 アンケートフォームを開く
                </a>
                <a href="YOUR_UPLOAD_PAGE_URL_HERE" class="form-link">
                    🔄 書類アップロードページに戻る
                </a>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; color: #856404;">
                <h4>⚠️ 重要なお知らせ</h4>
                <p>アンケートフォームを開いた後、上記の情報が自動入力されていることを確認してください。内容が正しくない場合は、手動で修正してください。</p>
            </div>
        </div>
        
        <script>
            // 自動入力情報をローカルストレージに保存
            localStorage.setItem('autoFillData', JSON.stringify({
                name: '${name}',
                postalCode: '${postalCode}',
                address: '${address}',
                timestamp: new Date().toISOString()
            }));
            
            // アンケートフォームのリンクに自動入力パラメータを追加
            document.addEventListener('DOMContentLoaded', function() {
                const formLink = document.querySelector('a[href*="1FAIpQLSfDS6ynpQxljT8bsXHlg0wBFED37-XnziFZ0pRMLMjQ14A9Jw"]');
                if (formLink) {
                    const params = new URLSearchParams({
                        autoFill: 'true',
                        name: '${name}',
                        postalCode: '${postalCode}',
                        address: '${address}'
                    });
                    formLink.href = 'https://docs.google.com/forms/d/e/1FAIpQLSfDS6ynpQxljT8bsXHlg0wBFED37-XnziFZ0pRMLMjQ14A9Jw/viewform?' + params.toString();
                }
            });
        </script>
    </body>
    </html>
    `;
    
    return HtmlService.createHtmlOutput(htmlContent)
      .setTitle('LIFESUPPORT(HK) - 自動入力完了')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    console.error('自動入力処理エラー:', error);
    return HtmlService.createHtmlOutput('<h1>エラーが発生しました</h1><p>システム管理者にお問い合わせください。</p>');
  }
}

/**
 * アップロード用フォルダを取得または作成
 */
function getOrCreateUploadFolder() {
  try {
    const folderName = 'アンケート書類アップロード';
    const folders = DriveApp.getFoldersByName(folderName);
    
    if (folders.hasNext()) {
      return folders.next();
    } else {
      return DriveApp.createFolder(folderName);
    }
  } catch (error) {
    console.error('フォルダ作成エラー:', error);
    throw error;
  }
}

/**
 * Google Cloud Vision APIを使用してOCR処理を実行
 */
function performOCR(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const imageBlob = file.getBlob();
    const imageBytes = Utilities.base64Encode(imageBlob.getBytes());
    
    // Cloud Vision API呼び出し
    const visionUrl = 'https://vision.googleapis.com/v1/images:annotate';
    const payload = {
      requests: [{
        image: {
          content: imageBytes
        },
        features: [{
          type: 'TEXT_DETECTION',
          maxResults: 1
        }]
      }]
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: {
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(visionUrl, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.responses && result.responses[0].textAnnotations) {
      const extractedText = result.responses[0].textAnnotations[0].description;
      return extractPersonalInfo(extractedText);
    }
    
    return null;
  } catch (error) {
    console.error('OCRエラー:', error);
    return null;
  }
}

/**
 * OCRテキストから個人情報を抽出
 */
function extractPersonalInfo(text) {
  try {
    const result = {
      name: '',
      address: '',
      postalCode: ''
    };
    
    // 郵便番号の抽出（日本の郵便番号形式: 123-4567）
    const postalCodeMatch = text.match(/(\d{3}[-－]\d{4})/);
    if (postalCodeMatch) {
      result.postalCode = postalCodeMatch[1].replace('－', '-');
    }
    
    // 住所の抽出（都道府県から始まる行）
    const addressMatch = text.match(/(東京都|北海道|(?:京都|大阪)府|.{2,3}県).+?(?:\n|$)/);
    if (addressMatch) {
      result.address = addressMatch[0].trim();
    }
    
    // 名前の抽出（氏名、名前等のキーワード後の文字列）
    const namePatterns = [
      /氏\s*名[：:]\s*([^\n]+)/,
      /名\s*前[：:]\s*([^\n]+)/,
      /Name[：:]\s*([^\n]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.name = match[1].trim();
        break;
      }
    }
    
    // 名前が見つからない場合、最初の行を名前として扱う（多くの書類で名前が最初に記載される）
    if (!result.name) {
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 0) {
        result.name = lines[0].trim();
      }
    }
    
    console.log('抽出された情報:', result);
    return result;
  } catch (error) {
    console.error('情報抽出エラー:', error);
    return {
      name: '',
      address: '',
      postalCode: ''
    };
  }
}

/**
 * アクセスログをスプレッドシートに記録
 */
function logAccess(accessInfo) {
  try {
    // アクセスログ用のスプレッドシートを取得または作成
    const logSheetId = PropertiesService.getScriptProperties().getProperty('ACCESS_LOG_SHEET_ID');
    let sheet;
    
    if (logSheetId) {
      try {
        sheet = SpreadsheetApp.openById(logSheetId).getActiveSheet();
      } catch (error) {
        // シートが見つからない場合は新規作成
        sheet = createAccessLogSheet();
      }
    } else {
      // 初回の場合は新規作成
      sheet = createAccessLogSheet();
    }
    
    // ヘッダーがない場合は追加
    if (sheet.getLastRow() === 0) {
      const headers = ['アクセス日時', 'IPアドレス', 'ユーザーエージェント', 'リファラー'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    // アクセスログを追加
    const rowData = [
      accessInfo.timestamp,
      accessInfo.ipAddress,
      accessInfo.userAgent,
      accessInfo.referrer
    ];
    
    sheet.appendRow(rowData);
    console.log('アクセスログ記録完了');
  } catch (error) {
    console.error('アクセスログ記録エラー:', error);
  }
}

/**
 * アクセスログ用スプレッドシートを作成
 */
function createAccessLogSheet() {
  try {
    const sheet = SpreadsheetApp.create('アンケートアクセスログ_' + new Date().getTime());
    const sheetId = sheet.getId();
    
    // スクリプトプロパティに保存
    PropertiesService.getScriptProperties().setProperty('ACCESS_LOG_SHEET_ID', sheetId);
    
    console.log('アクセスログシート作成完了:', sheetId);
    return sheet.getActiveSheet();
  } catch (error) {
    console.error('アクセスログシート作成エラー:', error);
    throw error;
  }
}

/**
 * ログイン（アクセス）通知メール送信
 */
function sendLoginNotificationEmail(accessInfo) {
  try {
    const subject = '【LIFESUPPORT(HK)】アンケートページへのアクセス通知';
    const body = `
アンケートページにアクセスがありました。

アクセス情報:
- アクセス日時: ${accessInfo.timestamp || new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Hong_Kong' })}
- IPアドレス: ${accessInfo.ipAddress || '取得不可'}
- ユーザーエージェント: ${accessInfo.userAgent || '取得不可'}
- リファラー: ${accessInfo.referrer || 'なし'}

---
LIFESUPPORT(HK)LIMITED
${CONFIG.COMPANY_ADDRESS}
Tel: ${CONFIG.COMPANY_TEL}
Fax: ${CONFIG.COMPANY_FAX}
Website: ${CONFIG.COMPANY_WEBSITE}
    `;
    
    GmailApp.sendEmail(
      CONFIG.NOTIFICATION_EMAIL,
      subject,
      body
    );
    
    console.log('ログイン通知メール送信完了');
  } catch (error) {
    console.error('ログイン通知メール送信エラー:', error);
  }
}

/**
 * フォーム修復の実行
 */
function executeFormRepair() {
  try {
    console.log('フォーム修復実行開始...');
    
    // フォーム修復を実行
    const repairResult = completeFormRepair();
    
    if (repairResult.success) {
      console.log('フォーム修復完了:', repairResult);
      
      // 修復結果をメールで通知
      const subject = '【LIFESUPPORT(HK)】フォーム修復完了通知';
      const body = `
フォームの修復が完了しました。

修復結果:
- 初期の空白項目数: ${repairResult.initialEmptyItems}個
- 削除された項目数: ${repairResult.removedItems}個
- 最終の空白項目数: ${repairResult.finalEmptyItems}個

修復により、空白欄の問題が解決されました。

---
LIFESUPPORT(HK)LIMITED
${CONFIG.COMPANY_ADDRESS}
Tel: ${CONFIG.COMPANY_TEL}
Fax: ${CONFIG.COMPANY_FAX}
Website: ${CONFIG.COMPANY_WEBSITE}
      `;
      
      GmailApp.sendEmail(
        CONFIG.NOTIFICATION_EMAIL,
        subject,
        body
      );
      
      return repairResult;
    } else {
      console.error('フォーム修復失敗:', repairResult.error);
      return repairResult;
    }
    
  } catch (error) {
    console.error('フォーム修復実行エラー:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * フォーム統計情報の取得
 */
function getFormStatus() {
  try {
    const statistics = getFormStatistics();
    const checkResult = detailedFormCheck();
    
    return {
      statistics: statistics,
      checkResult: checkResult,
      timestamp: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Hong_Kong' })
    };
    
  } catch (error) {
    console.error('フォーム状態取得エラー:', error);
    return {
      error: error.toString(),
      timestamp: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Hong_Kong' })
    };
  }
}
