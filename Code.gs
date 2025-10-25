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
  NOTIFICATION_EMAIL: 'bestinksalesman@gmail.com',
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
  // 認証情報セクション（隠しフィールド）
  form.addTextItem()
       .setTitle('認証トークン')
       .setRequired(true)
       .setHelpText('認証システムから自動で入力されます');
  
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
    // フォームIDを取得（実際のフォームIDに置き換える必要があります）
    const formId = '1FAIpQLSf5x8LE9Tm3IqnofJs5ajQC_c274_wgonL0dv-Zp2OznZ1qog'; // 実際のフォームID
    const form = FormApp.openById(formId);
    const responses = form.getResponses();
    
    if (responses.length > 0) {
      const latestResponse = responses[responses.length - 1];
      
      // 認証トークンを検証
      if (!validateAuthToken(latestResponse)) {
        console.error('認証トークンが無効です');
        return;
      }
      
      processNewResponse(latestResponse);
    }
  } catch (error) {
    console.error('フォーム送信処理エラー:', error);
  }
}

/**
 * 認証トークンの検証
 */
function validateAuthToken(response) {
  try {
    const itemResponses = response.getItemResponses();
    
    // 認証トークンの回答を探す
    for (let itemResponse of itemResponses) {
      const question = itemResponse.getItem().getTitle();
      if (question.includes('認証トークン')) {
        const authToken = itemResponse.getResponse();
        
        // トークンをデコード
        const tokenData = JSON.parse(atob(authToken));
        
        // 有効期限をチェック
        if (Date.now() > tokenData.expires) {
          console.error('認証トークンの有効期限が切れています');
          return false;
        }
        
        // タイムスタンプをチェック（24時間以内）
        if (Date.now() - tokenData.timestamp > 24 * 60 * 60 * 1000) {
          console.error('認証トークンが古すぎます');
          return false;
        }
        
        console.log('認証トークンが有効です');
        return true;
      }
    }
    
    console.error('認証トークンが見つかりません');
    return false;
  } catch (error) {
    console.error('認証トークン検証エラー:', error);
    return false;
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
