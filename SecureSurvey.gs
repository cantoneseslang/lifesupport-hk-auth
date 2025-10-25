/**
 * セキュアアンケートシステム
 * 認証済みユーザーのみがアクセス可能なアンケートシステム
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
 * 認証済みユーザー向けアンケートフォーム作成
 */
function createSecureSurveyForm() {
  try {
    const form = FormApp.create('LIFESUPPORT(HK) セキュアアンケート');
    
    form.setTitle('LIFESUPPORT(HK) セキュアアンケート')
         .setDescription('認証済み会員様向けのアンケートです。ログインが必要です。')
         .setConfirmationMessage('ご回答ありがとうございました。')
         .setAllowResponseEdits(false)
         .setAcceptingResponses(true);
    
    // 認証チェック機能を追加
    addAuthenticationCheck(form);
    
    // アンケート質問項目を追加
    addSecureSurveyQuestions(form);
    
    // 回答先シートを設定
    const responses = form.getResponses();
    const sheet = SpreadsheetApp.create('セキュアアンケート回答データ_' + new Date().getTime());
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
    
    // セキュアシート設定
    setupSecureSheet(sheet.getId());
    
    console.log('セキュアアンケートフォーム作成完了:', form.getPublishedUrl());
    return {
      formUrl: form.getPublishedUrl(),
      sheetId: sheet.getId(),
      formId: form.getId()
    };
  } catch (error) {
    console.error('セキュアアンケートフォーム作成エラー:', error);
    throw error;
  }
}

/**
 * 認証チェック機能の追加
 */
function addAuthenticationCheck(form) {
  try {
    // 認証状態を確認するための隠しフィールド
    form.addTextItem()
         .setTitle('認証トークン')
         .setRequired(true)
         .setHelpText('ログイン後に取得される認証トークン')
         .setValidation(FormApp.createTextValidation()
           .setHelpText('有効な認証トークンが必要です')
           .requireTextMatchesPattern('^[a-zA-Z0-9._-]+$')
           .build());
  } catch (error) {
    console.error('認証チェック機能追加エラー:', error);
  }
}

/**
 * セキュアアンケート質問項目の追加
 */
function addSecureSurveyQuestions(form) {
  try {
    // 基本情報セクション
    form.addPageBreakItem()
         .setTitle('基本情報');
    
    form.addTextItem()
         .setTitle('会員ID')
         .setRequired(true)
         .setHelpText('ログイン時に表示される会員ID');
    
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
    
    // サービス満足度
    const satisfactionItem = form.addMultipleChoiceItem();
    satisfactionItem.setTitle('サービス満足度')
                   .setChoices([
                     satisfactionItem.createChoice('非常に満足'),
                     satisfactionItem.createChoice('満足'),
                     satisfactionItem.createChoice('普通'),
                     satisfactionItem.createChoice('不満'),
                     satisfactionItem.createChoice('非常に不満')
                   ])
                   .setRequired(true);
    
    // 利用サービス
    const serviceItem = form.addCheckboxItem();
    serviceItem.setTitle('利用しているサービス（複数選択可）')
               .setChoices([
                 serviceItem.createChoice('Webサービス'),
                 serviceItem.createChoice('モバイルアプリ'),
                 serviceItem.createChoice('カスタマーサポート'),
                 serviceItem.createChoice('コンサルティング'),
                 serviceItem.createChoice('その他')
               ])
               .setRequired(true);
    
    // 推奨度
    const recommendationItem = form.addScaleItem();
    recommendationItem.setTitle('推奨度（1-10）')
                     .setBounds(1, 10)
                     .setRequired(true);
    
    // 詳細意見
    form.addParagraphTextItem()
         .setTitle('ご意見・ご要望')
         .setRequired(false);
    
    // セキュリティ質問
    form.addPageBreakItem()
         .setTitle('セキュリティ確認');
    
    form.addMultipleChoiceItem()
         .setTitle('データの取り扱いについて')
         .setChoices([
           form.addMultipleChoiceItem().createChoice('個人情報の取り扱いに同意します'),
           form.addMultipleChoiceItem().createChoice('回答データの分析利用に同意します'),
           form.addMultipleChoiceItem().createChoice('上記すべてに同意します')
         ])
         .setRequired(true);
    
    console.log('セキュアアンケート質問項目追加完了');
  } catch (error) {
    console.error('セキュアアンケート質問項目追加エラー:', error);
  }
}

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
    
    // セキュリティ設定
    applySecuritySettings(sheet);
    
    console.log('セキュアシート設定完了');
  } catch (error) {
    console.error('セキュアシート設定エラー:', error);
  }
}

/**
 * セキュリティ設定の適用
 */
function applySecuritySettings(sheet) {
  try {
    // シートの保護設定
    const protection = sheet.protect();
    protection.setDescription('セキュアアンケート回答データの保護');
    
    // 編集権限の設定
    const editors = protection.getEditors();
    protection.removeEditors(editors);
    protection.addEditor(Session.getActiveUser().getEmail());
    
    // 列の保護（認証トークン列を特に保護）
    const tokenColumn = sheet.getRange('D:D');
    const tokenProtection = tokenColumn.protect();
    tokenProtection.setDescription('認証トークン列の保護');
    
    // データ検証の設定
    setupSecureDataValidation(sheet);
    
    console.log('セキュリティ設定適用完了');
  } catch (error) {
    console.error('セキュリティ設定適用エラー:', error);
  }
}

/**
 * セキュアデータ検証の設定
 */
function setupSecureDataValidation(sheet) {
  try {
    // 認証トークンの検証
    const tokenRange = sheet.getRange('D:D');
    const tokenRule = SpreadsheetApp.newDataValidation()
      .requireTextMatchesPattern('^[a-zA-Z0-9._-]+$')
      .setAllowInvalid(false)
      .setHelpText('有効な認証トークンを入力してください')
      .build();
    tokenRange.setDataValidation(tokenRule);
    
    // 会員IDの検証
    const memberIdRange = sheet.getRange('C:C');
    const memberIdRule = SpreadsheetApp.newDataValidation()
      .requireTextMatchesPattern('^[a-zA-Z0-9._-]+$')
      .setAllowInvalid(false)
      .setHelpText('有効な会員IDを入力してください')
      .build();
    memberIdRange.setDataValidation(memberIdRule);
    
    console.log('セキュアデータ検証設定完了');
  } catch (error) {
    console.error('セキュアデータ検証設定エラー:', error);
  }
}

/**
 * 認証済み回答の処理
 */
function processSecureResponse(responseData) {
  try {
    // 認証トークンの検証
    const authResult = validateAuthenticationToken(responseData['認証トークン']);
    if (!authResult.valid) {
      throw new Error('認証トークンが無効です');
    }
    
    // 会員IDの検証
    const memberResult = validateMemberId(responseData['会員ID']);
    if (!memberResult.valid) {
      throw new Error('会員IDが無効です');
    }
    
    // セキュリティレベルを設定
    const securityLevel = calculateSecurityLevel(responseData);
    
    // 回答データをセキュアシートに追加
    const result = addSecureResponseToSheet(responseData, securityLevel);
    
    // セキュリティ通知を送信
    sendSecurityNotification(result);
    
    console.log('セキュア回答処理完了');
    return result;
  } catch (error) {
    console.error('セキュア回答処理エラー:', error);
    throw error;
  }
}

/**
 * 認証トークンの検証
 */
function validateAuthenticationToken(token) {
  try {
    // セッション情報から認証トークンを確認
    const sessionInfo = getSessionInfo();
    if (!sessionInfo || sessionInfo.accessToken !== token) {
      return { valid: false, message: '認証トークンが無効です' };
    }
    
    // トークンの有効期限を確認
    const expiresAt = new Date(sessionInfo.expiresAt);
    if (expiresAt < new Date()) {
      return { valid: false, message: '認証トークンの有効期限が切れています' };
    }
    
    return { valid: true, message: '認証トークンは有効です' };
  } catch (error) {
    console.error('認証トークン検証エラー:', error);
    return { valid: false, message: '認証トークンの検証に失敗しました' };
  }
}

/**
 * 会員IDの検証
 */
function validateMemberId(memberId) {
  try {
    // 会員データベースから会員IDを確認
    const memberData = getMemberFromDatabase(memberId);
    if (!memberData) {
      return { valid: false, message: '会員IDが存在しません' };
    }
    
    // 会員ステータスを確認
    if (memberData.status !== 'verified') {
      return { valid: false, message: '会員認証が完了していません' };
    }
    
    return { valid: true, message: '会員IDは有効です', member: memberData };
  } catch (error) {
    console.error('会員ID検証エラー:', error);
    return { valid: false, message: '会員IDの検証に失敗しました' };
  }
}

/**
 * セキュリティレベルの計算
 */
function calculateSecurityLevel(responseData) {
  try {
    let securityLevel = 'standard';
    
    // 高セキュリティ条件
    if (responseData['データ取り扱い同意'] === '上記すべてに同意します') {
      securityLevel = 'high';
    }
    
    // 推奨度が高い場合
    if (parseInt(responseData['推奨度']) >= 8) {
      securityLevel = 'high';
    }
    
    // 満足度が高い場合
    if (responseData['サービス満足度'] === '非常に満足') {
      securityLevel = 'high';
    }
    
    return securityLevel;
  } catch (error) {
    console.error('セキュリティレベル計算エラー:', error);
    return 'standard';
  }
}

/**
 * セキュア回答をシートに追加
 */
function addSecureResponseToSheet(responseData, securityLevel) {
  try {
    const sheetId = PropertiesService.getScriptProperties().getProperty('SECURE_SHEET_ID');
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    
    const responseId = generateSecureResponseId();
    const timestamp = new Date();
    
    const rowData = [
      responseId,                                    // 回答ID
      timestamp,                                     // 回答日時
      responseData['会員ID'],                        // 会員ID
      responseData['認証トークン'],                  // 認証トークン
      responseData['お名前'],                        // お名前
      responseData['会社名'],                        // 会社名
      responseData['部署名'] || '',                 // 部署名
      responseData['電話番号'],                      // 電話番号
      responseData['メールアドレス'],               // メールアドレス
      responseData['サービス満足度'],               // サービス満足度
      responseData['利用しているサービス（複数選択可）'], // 利用サービス
      responseData['推奨度（1-10）'],               // 推奨度
      responseData['ご意見・ご要望'] || '',         // ご意見・ご要望
      responseData['データの取り扱いについて'],      // データ取り扱い同意
      '処理中',                                      // 処理状況
      securityLevel,                                 // セキュリティレベル
      '',                                           // PDF生成日時
      ''                                            // メール送信日時
    ];
    
    sheet.appendRow(rowData);
    
    console.log('セキュア回答シート追加完了');
    return {
      success: true,
      responseId: responseId,
      securityLevel: securityLevel,
      timestamp: timestamp
    };
  } catch (error) {
    console.error('セキュア回答シート追加エラー:', error);
    throw error;
  }
}

/**
 * セキュア回答IDの生成
 */
function generateSecureResponseId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `SECURE_${timestamp}_${random}`;
}

/**
 * セキュリティ通知の送信
 */
function sendSecurityNotification(result) {
  try {
    const subject = '【LIFESUPPORT(HK)】セキュアアンケート回答受信';
    const body = `
セキュアアンケート回答が受信されました。

回答ID: ${result.responseId}
セキュリティレベル: ${result.securityLevel}
受信日時: ${result.timestamp}

---
LIFESUPPORT(HK)LIMITED
No 163 Pan Chung, Tai Po, N.T.,HK
Tel: (852)52263586
Fax: (852)26530426
Website: https://lshk-ai-service.studio.site/
    `;
    
    GmailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, subject, body);
    console.log('セキュリティ通知送信完了');
  } catch (error) {
    console.error('セキュリティ通知送信エラー:', error);
  }
}

/**
 * データベースから会員情報を取得
 */
function getMemberFromDatabase(memberId) {
  try {
    // 実際の実装では、Supabaseデータベースから会員情報を取得
    // ここでは仮の実装
    return {
      id: memberId,
      status: 'verified',
      email: 'member@example.com',
      name: '会員名'
    };
  } catch (error) {
    console.error('会員情報取得エラー:', error);
    return null;
  }
}
