/**
 * Googleアンケート自動集計・自動送信システム
 * メイン処理ファイル
 */

// 設定定数
const CONFIG = {
  COMPANY_NAME: 'LIFESUPPORT(HK)LIMITED',
  COMPANY_ADDRESS: 'No 163 Pan Chung, Tai Po, N.T.,HK',
  COMPANY_TEL: '(852)52263586',
  COMPANY_FAX: '(852)26530426',
  COMPANY_WEBSITE: 'https://lshk-ai-service.studio.site/',
  NOTIFICATION_EMAIL: 'bestinksalesman@gmail.com, info@lifesupporthk.com',
  PROJECT_ID: 'cantonese-katakana',
  SERVICE_ACCOUNT_EMAIL: 'id-351@cantonese-katakana.iam.gserviceaccount.com'
};

/**
 * 初期設定とトリガー設定
 */
function setupSystem() {
  try {
    // トリガーを削除（既存のものがある場合）
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'onFormSubmit') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // 新しいトリガーを作成
    ScriptApp.newTrigger('onFormSubmit')
      .timeBased()
      .everyMinutes(5) // 5分ごとにチェック
      .create();
    
    console.log('システム設定完了');
    return 'システム設定が完了しました';
  } catch (error) {
    console.error('システム設定エラー:', error);
    throw error;
  }
}

/**
 * 新しいセキュアシステムの初期化
 */
function initializeSecureSystem() {
  try {
    // 新しいセキュアフォームを作成
    const formResult = createSecureSurveyForm();
    
    // システム設定
    setupSystem();
    
    console.log('セキュアシステム初期化完了');
    console.log('新しいフォームURL:', formResult.formUrl);
    console.log('フォームID:', formResult.formId);
    console.log('シートID:', formResult.sheetId);
    
    return {
      success: true,
      message: 'セキュアシステムが初期化されました',
      formUrl: formResult.formUrl,
      formId: formResult.formId,
      sheetId: formResult.sheetId
    };
  } catch (error) {
    console.error('セキュアシステム初期化エラー:', error);
    throw error;
  }
}

/**
 * 新しいセキュアアンケートフォーム作成
 */
function createSecureSurveyForm() {
  try {
    // 新しいセキュアフォームを作成
    const form = FormApp.create('LIFESUPPORT(HK) セキュアアンケート');
    
    // フォームの基本設定
    form.setTitle('LIFESUPPORT(HK) セキュアアンケート')
         .setDescription('認証済み会員様向けのセキュアアンケートです。')
         .setConfirmationMessage('ご回答ありがとうございました。')
         .setAllowResponseEdits(false)
         .setAcceptingResponses(true);
    
    // セキュアな質問項目を追加
    addSecureFormQuestions(form);
    
    // 回答先シートを設定
    const sheet = SpreadsheetApp.create('セキュアアンケート回答データ_' + new Date().getTime());
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
    
    console.log('セキュアフォーム作成完了:', form.getPublishedUrl());
    return {
      formUrl: form.getPublishedUrl(),
      sheetId: sheet.getId(),
      formId: form.getId()
    };
  } catch (error) {
    console.error('セキュアフォーム作成エラー:', error);
    throw error;
  }
}

/**
 * セキュアなフォーム質問項目の追加
 */
function addSecureFormQuestions(form) {
  // 基本情報セクション
  form.addPageBreakItem()
       .setTitle('基本情報');
  
  form.addTextItem()
       .setTitle('お名前')
       .setRequired(true);
  
  form.addTextItem()
       .setTitle('会社名')
       .setRequired(true);
  
  form.addTextItem()
       .setTitle('部署名')
       .setRequired(false);
  
  form.addTextItem()
       .setTitle('電話番号')
       .setRequired(true);
  
  form.addTextItem()
       .setTitle('メールアドレス')
       .setRequired(true)
       .setValidation(FormApp.createTextValidation()
         .setHelpText('有効なメールアドレスを入力してください')
         .requireTextMatchesPattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
         .build());
  
  // アンケート内容セクション
  form.addPageBreakItem()
       .setTitle('アンケート内容');
  
  // 複数選択質問
  const multipleChoiceItem = form.addMultipleChoiceItem();
  multipleChoiceItem.setTitle('サービス満足度')
                   .setChoices([
                     multipleChoiceItem.createChoice('非常に満足'),
                     multipleChoiceItem.createChoice('満足'),
                     multipleChoiceItem.createChoice('普通'),
                     multipleChoiceItem.createChoice('不満'),
                     multipleChoiceItem.createChoice('非常に不満')
                   ])
                   .setRequired(true);
  
  // チェックボックス質問
  const checkboxItem = form.addCheckboxItem();
  checkboxItem.setTitle('利用しているサービス（複数選択可）')
             .setChoices([
               checkboxItem.createChoice('Webサービス'),
               checkboxItem.createChoice('モバイルアプリ'),
               checkboxItem.createChoice('カスタマーサポート'),
               checkboxItem.createChoice('その他')
             ])
             .setRequired(true);
  
  // 段落テキスト質問
  form.addParagraphTextItem()
       .setTitle('ご意見・ご要望')
       .setRequired(false);
  
  // スケール質問
  const scaleItem = form.addScaleItem();
  scaleItem.setTitle('推奨度（1-10）')
          .setBounds(1, 10)
          .setRequired(true);
}

/**
 * フォーム送信時の処理
 */
function onFormSubmit() {
  try {
    // フォームIDを取得
    const formId = '1FAIpQLSfDS6ynpQxljT8bsXHlg0wBFED37-XnziFZ0pRMLMjQ14A9Jw'; // 実際のフォームID
    const form = FormApp.openById(formId);
    const responses = form.getResponses();
    
    if (responses.length > 0) {
      const latestResponse = responses[responses.length - 1];
      processNewResponse(latestResponse);
    }
  } catch (error) {
    console.error('フォーム送信処理エラー:', error);
  }
}

/**
 * 新しい回答の処理
 */
function processNewResponse(response) {
  try {
    const itemResponses = response.getItemResponses();
    const responseData = {};
    
    // 回答データを整理
    itemResponses.forEach(itemResponse => {
      const question = itemResponse.getItem().getTitle();
      const answer = itemResponse.getResponse();
      responseData[question] = answer;
    });
    
    // シートにデータを追加
    addToSheet(responseData);
    
    // 通知メールを送信
    sendNotificationEmail(responseData);
    
    console.log('回答処理完了');
  } catch (error) {
    console.error('回答処理エラー:', error);
  }
}

/**
 * シートにデータを追加
 */
function addToSheet(responseData) {
  try {
    const sheetId = 'YOUR_SHEET_ID'; // 実際のシートIDに置き換え（フォーム作成時に生成される）
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    
    // ヘッダー行を設定（初回のみ）
    if (sheet.getLastRow() === 0) {
      const headers = [
        '回答日時', 'お名前', '会社名', '部署名', '電話番号', 
        'メールアドレス', 'サービス満足度', '利用サービス', '推奨度', 'ご意見・ご要望'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // データ行を追加
    const rowData = [
      new Date(),
      responseData['お名前'] || '',
      responseData['会社名'] || '',
      responseData['部署名'] || '',
      responseData['電話番号'] || '',
      responseData['メールアドレス'] || '',
      responseData['サービス満足度'] || '',
      responseData['利用しているサービス（複数選択可）'] || '',
      responseData['推奨度（1-10）'] || '',
      responseData['ご意見・ご要望'] || ''
    ];
    
    sheet.appendRow(rowData);
    console.log('シートにデータ追加完了');
  } catch (error) {
    console.error('シート追加エラー:', error);
  }
}

/**
 * 通知メール送信
 */
function sendNotificationEmail(responseData) {
  try {
    const subject = '【LIFESUPPORT(HK)】新しいアンケート回答が届きました';
    const body = `
新しいアンケート回答が届きました。

回答者情報:
- お名前: ${responseData['お名前'] || '未入力'}
- 会社名: ${responseData['会社名'] || '未入力'}
- メールアドレス: ${responseData['メールアドレス'] || '未入力'}
- 電話番号: ${responseData['電話番号'] || '未入力'}

回答内容:
- サービス満足度: ${responseData['サービス満足度'] || '未入力'}
- 利用サービス: ${responseData['利用しているサービス（複数選択可）'] || '未入力'}
- 推奨度: ${responseData['推奨度（1-10）'] || '未入力'}
- ご意見・ご要望: ${responseData['ご意見・ご要望'] || '未入力'}

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
    
    console.log('通知メール送信完了');
  } catch (error) {
    console.error('メール送信エラー:', error);
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
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('LIFESUPPORT(HK) - 香港法人設立申込')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    console.error('doGetエラー:', error);
    return HtmlService.createHtmlOutput('<h1>エラーが発生しました</h1><p>システム管理者にお問い合わせください。</p>');
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
                <a href="YOUR_SURVEY_FORM_URL_HERE" class="form-link" target="_blank">
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
                const formLink = document.querySelector('a[href="YOUR_SURVEY_FORM_URL_HERE"]');
                if (formLink) {
                    const params = new URLSearchParams({
                        autoFill: 'true',
                        name: '${name}',
                        postalCode: '${postalCode}',
                        address: '${address}'
                    });
                    formLink.href = 'YOUR_SURVEY_FORM_URL_HERE?' + params.toString();
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
 * シートをPDFに変換してメール送信
 */
function exportSheetToPDFAndEmail(sheetId, recipientEmail) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId);
    const file = DriveApp.getFileById(sheetId);
    
    // PDFとしてエクスポート
    const pdfBlob = file.getAs('application/pdf');
    const pdfName = 'アンケート回答データ_' + new Date().getTime() + '.pdf';
    
    // PDFファイルを作成
    const pdfFile = DriveApp.createFile(pdfBlob).setName(pdfName);
    
    // メール送信
    const subject = '【LIFESUPPORT(HK)】アンケート回答データ';
    const body = `
アンケート回答データをPDFでお送りします。

---
LIFESUPPORT(HK)LIMITED
${CONFIG.COMPANY_ADDRESS}
Tel: ${CONFIG.COMPANY_TEL}
Fax: ${CONFIG.COMPANY_FAX}
Website: ${CONFIG.COMPANY_WEBSITE}
    `;
    
    GmailApp.sendEmail(
      recipientEmail,
      subject,
      body,
      {
        attachments: [pdfFile.getBlob()]
      }
    );
    
    console.log('PDFメール送信完了');
  } catch (error) {
    console.error('PDFメール送信エラー:', error);
  }
}

/**
 * 手動でPDFエクスポートとメール送信を実行
 */
function manualExportAndEmail() {
  const sheetId = 'YOUR_SHEET_ID'; // 実際のシートIDに置き換え（フォーム作成時に生成される）
  const recipientEmail = CONFIG.NOTIFICATION_EMAIL;
  
  exportSheetToPDFAndEmail(sheetId, recipientEmail);
}

/**
 * 既存のフォームから認証トークンフィールドを削除
 */
function removeAuthTokenField() {
  try {
    const formId = '1FAIpQLSf5x8LE9Tm3IqnofJs5ajQC_c274_wgonL0dv-Zp2OznZ1qog';
    const form = FormApp.openById(formId);
    
    const items = form.getItems();
    let deleted = 0;
    
    items.forEach(item => {
      const title = item.getTitle();
      if (title.includes('認証トークン') || title.includes('authentication') || title.includes('token')) {
        form.deleteItem(item);
        deleted++;
      }
    });
    
    if (deleted > 0) {
      form.setDescription('認証済み会員様向けのセキュアアンケートです。');
      Logger.log('✅ ' + deleted + '個の認証トークンフィールドを削除しました');
      return '削除完了: ' + deleted + '個';
    } else {
      Logger.log('認証トークンフィールドが見つかりませんでした');
      return '削除対象なし';
    }
  } catch (error) {
    Logger.log('エラー: ' + error);
    throw error;
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
 * アップロードされた画像の一覧を取得
 */
function getUploadedImages() {
  try {
    const folder = getOrCreateUploadFolder();
    const files = folder.getFiles();
    const imageList = [];
    
    while (files.hasNext()) {
      const file = files.next();
      imageList.push({
        id: file.getId(),
        name: file.getName(),
        url: file.getUrl(),
        createdDate: file.getDateCreated()
      });
    }
    
    return imageList;
  } catch (error) {
    console.error('画像一覧取得エラー:', error);
    return [];
  }
}
