/**
 * 香港法人設立申込システム
 * 認証済みユーザー向けの香港法人設立申込フォーム
 */

// 設定定数
const HK_APPLICATION_CONFIG = {
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
 * 香港法人設立申込フォーム作成
 */
function createHKCompanyApplicationForm() {
  try {
    const form = FormApp.create('LIFESUPPORT(HK) 香港法人設立申込書');
    
    form.setTitle('LIFESUPPORT(HK) 香港法人設立申込書')
         .setDescription('認証済み会員様向けの香港法人設立申込フォームです。')
         .setConfirmationMessage('お申込みありがとうございました。担当者より折り返しご連絡いたします。')
         .setAllowResponseEdits(false)
         .setAcceptingResponses(true);
    
    // 申込フォーム質問項目を追加
    addApplicationQuestions(form);
    
    // 回答先シートを設定
    const responses = form.getResponses();
    const sheet = SpreadsheetApp.create('香港法人設立申込データ_' + new Date().getTime());
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
    
    // 申込シート設定
    setupApplicationSheet(sheet.getId());
    
    console.log('香港法人設立申込フォーム作成完了:', form.getPublishedUrl());
    return {
      formUrl: form.getPublishedUrl(),
      sheetId: sheet.getId(),
      formId: form.getId()
    };
  } catch (error) {
    console.error('香港法人設立申込フォーム作成エラー:', error);
    throw error;
  }
}

/**
 * 香港法人設立申込フォーム質問項目の追加
 */
function addApplicationQuestions(form) {
  try {
    // （１）お客様情報
    form.addPageBreakItem()
         .setTitle('（１）お客様情報');
    
    form.addTextItem()
         .setTitle('お名前')
         .setHelpText('OCRで自動入力された場合、内容を確認し必要に応じて修正してください')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('郵便番号')
         .setHelpText('OCRで自動入力された場合、内容を確認し必要に応じて修正してください')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('住所')
         .setHelpText('OCRで自動入力された場合、内容を確認し必要に応じて修正してください')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('会社名')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('メールアドレス')
         .setRequired(true)
         .setValidation(FormApp.createTextValidation()
           .setHelpText('有効なメールアドレスを入力してください')
           .requireTextMatchesPattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
           .build());
    
    form.addTextItem()
         .setTitle('メールアドレス（確認用）')
         .setRequired(true)
         .setValidation(FormApp.createTextValidation()
           .setHelpText('確認のため再度入力してください')
           .requireTextMatchesPattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
           .build());
    
    form.addTextItem()
         .setTitle('電話番号')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('携帯電話番号')
         .setRequired(false);
    
    // 本人確認書類セクション
    form.addPageBreakItem()
         .setTitle('本人確認書類のアップロード');
    
    form.addMultipleChoiceItem()
         .setTitle('本人確認書類の種類を選択してください')
         .setChoices([
           form.addMultipleChoiceItem().createChoice('パスポート'),
           form.addMultipleChoiceItem().createChoice('マイナンバーカード住所記載面'),
           form.addMultipleChoiceItem().createChoice('国際運転免許証'),
           form.addMultipleChoiceItem().createChoice('住民票')
         ])
         .setRequired(true);
    
    form.addParagraphTextItem()
         .setTitle('本人確認書類アップロードURL')
         .setHelpText('※カスタムアップロードページで画像をアップロードしてください。アップロード後、OCRで自動的に名前・住所・郵便番号が抽出され、上記のフィールドに自動入力されます。')
         .setRequired(false);
    
    // 事業活動証明書類セクション
    form.addPageBreakItem()
         .setTitle('事業活動を証明できる書類（香港会社と関連会社）');
    
    form.addCheckboxItem()
         .setTitle('提出する事業活動証明書類を選択してください（複数選択可）')
         .setChoices([
           form.addCheckboxItem().createChoice('会社案内'),
           form.addCheckboxItem().createChoice('ホームページ'),
           form.addCheckboxItem().createChoice('賃貸契約書')
         ])
         .setRequired(true);
    
    form.addParagraphTextItem()
         .setTitle('事業活動証明書類アップロードURL')
         .setHelpText('※カスタムアップロードページで画像をアップロードしてください。')
         .setRequired(false);
    
    // （２）香港法人設立種類
    form.addPageBreakItem()
         .setTitle('（２）香港法人設立種類');
    
    form.addMultipleChoiceItem()
         .setTitle('設立種類を選択してください')
         .setChoices([
           form.addMultipleChoiceItem().createChoice('新規法人設立（新たに会社を設立する場合）'),
           form.addMultipleChoiceItem().createChoice('シェルフカンパニー購入（すでに設立済みの会社を購入する場合）')
         ])
         .setRequired(true);
    
    // （３）会社名
    form.addPageBreakItem()
         .setTitle('（３）会社名');
    
    form.addTextItem()
         .setTitle('第一希望 - 英語名')
         .setHelpText('例：ABC Trading Limited')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('第一希望 - 中国語名（ご希望の場合）')
         .setHelpText('例：貿易有限公司')
         .setRequired(false);
    
    form.addTextItem()
         .setTitle('第二希望 - 英語名')
         .setRequired(false);
    
    form.addTextItem()
         .setTitle('第二希望 - 中国語名（ご希望の場合）')
         .setRequired(false);
    
    form.addTextItem()
         .setTitle('第三希望 - 英語名')
         .setRequired(false);
    
    form.addTextItem()
         .setTitle('第三希望 - 中国語名（ご希望の場合）')
         .setRequired(false);
    
    // （４）会社情報
    form.addPageBreakItem()
         .setTitle('（４）会社情報');
    
    form.addTextItem()
         .setTitle('簡単なビジネス概要')
         .setHelpText('例：貿易業')
         .setRequired(true);
    
    form.addMultipleChoiceItem()
         .setTitle('資本金')
         .setChoices([
           form.addMultipleChoiceItem().createChoice('10,000香港ドル'),
           form.addMultipleChoiceItem().createChoice('その他（次の質問で金額を入力）')
         ])
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('資本金（その他を選択した場合）')
         .setHelpText('香港ドルで入力してください')
         .setRequired(false);
    
    form.addMultipleChoiceItem()
         .setTitle('登記住所')
         .setChoices([
           form.addMultipleChoiceItem().createChoice('LIFESUPPORT(HK)LIMITED住所を使用'),
           form.addMultipleChoiceItem().createChoice('その他住所（次の質問で入力）')
         ])
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('登記住所（その他を選択した場合）')
         .setHelpText('香港内限定。英語で入力してください。')
         .setRequired(false);
    
    // （５）役員情報
    form.addPageBreakItem()
         .setTitle('（５）役員情報');
    
    form.addTextItem()
         .setTitle('姓名／会社名（英語）')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('住所')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('国籍')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('パスポート番号／HKID番号')
         .setRequired(true);
    
    form.addCheckboxItem()
         .setTitle('役員ノミニー')
         .setChoices([
           form.addCheckboxItem().createChoice('役員ノミニー（名義上の役員）を希望')
         ])
         .setRequired(false);
    
    // （６）株主情報
    form.addPageBreakItem()
         .setTitle('（６）株主情報');
    
    form.addTextItem()
         .setTitle('姓名／会社名（英語）')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('住所')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('国籍')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('パスポート番号／HKID番号')
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('株数')
         .setRequired(true);
    
    form.addCheckboxItem()
         .setTitle('株主ノミニー')
         .setChoices([
           form.addCheckboxItem().createChoice('株主ノミニー（名義上の株主）を希望')
         ])
         .setRequired(false);
    
    // （７）会社秘書役
    form.addPageBreakItem()
         .setTitle('（７）会社秘書役');
    
    form.addMultipleChoiceItem()
         .setTitle('会社秘書役')
         .setHelpText('香港の法律により香港法人か香港居住者の任命が義務となります')
         .setChoices([
           form.addMultipleChoiceItem().createChoice('LIFESUPPORT(HK)LIMITEDに会社秘書役を依頼'),
           form.addMultipleChoiceItem().createChoice('下記法人・個人に依頼（次の質問で入力）')
         ])
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('会社秘書役 - 名前・法人名')
         .setRequired(false);
    
    form.addTextItem()
         .setTitle('会社秘書役 - 登記番号・HKID')
         .setRequired(false);
    
    form.addTextItem()
         .setTitle('会社秘書役 - 住所')
         .setRequired(false);
    
    // （８）銀行口座サポート
    form.addPageBreakItem()
         .setTitle('（８）銀行口座サポート');
    
    form.addMultipleChoiceItem()
         .setTitle('銀行口座サポート')
         .setChoices([
           form.addMultipleChoiceItem().createChoice('必要'),
           form.addMultipleChoiceItem().createChoice('不要'),
           form.addMultipleChoiceItem().createChoice('その他（次の質問で入力）')
         ])
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('銀行口座サポート - その他の内容')
         .setRequired(false);
    
    // （９）銀行口座サイン権限者
    form.addPageBreakItem()
         .setTitle('（９）銀行口座サイン権限者');
    
    form.addMultipleChoiceItem()
         .setTitle('サイン権限')
         .setChoices([
           form.addMultipleChoiceItem().createChoice('下記権限者のうち1名でのサインで取引'),
           form.addMultipleChoiceItem().createChoice('下記権限者の共同サインで取引')
         ])
         .setRequired(true);
    
    form.addTextItem()
         .setTitle('権限者1 - お名前')
         .setRequired(false);
    
    form.addTextItem()
         .setTitle('権限者1 - 関係（役員/株主/その他）')
         .setRequired(false);
    
    form.addTextItem()
         .setTitle('権限者2 - お名前')
         .setRequired(false);
    
    form.addTextItem()
         .setTitle('権限者2 - 関係（役員/株主/その他）')
         .setRequired(false);
    
    console.log('香港法人設立申込フォーム質問項目追加完了');
  } catch (error) {
    console.error('香港法人設立申込フォーム質問項目追加エラー:', error);
  }
}

/**
 * 香港法人設立申込シート設定
 */
function setupApplicationSheet(sheetId) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    
    // シート名を設定
    sheet.setName('香港法人設立申込データ');
    
    // ヘッダー行の設定
    const headers = [
      '回答ID',
      '回答日時',
      'お名前',
      '会社名',
      'メールアドレス',
      'メールアドレス（確認用）',
      '住所',
      '電話番号',
      '携帯電話番号',
      '設立種類',
      '第一希望-英語名',
      '第一希望-中国語名',
      '第二希望-英語名',
      '第二希望-中国語名',
      '第三希望-英語名',
      '第三希望-中国語名',
      'ビジネス概要',
      '資本金',
      '資本金（その他）',
      '登記住所',
      '登記住所（その他）',
      '役員-姓名',
      '役員-住所',
      '役員-国籍',
      '役員-パスポート番号',
      '役員ノミニー',
      '株主-姓名',
      '株主-住所',
      '株主-国籍',
      '株主-パスポート番号',
      '株主-株数',
      '株主ノミニー',
      '会社秘書役',
      '会社秘書役-名前',
      '会社秘書役-登記番号',
      '会社秘書役-住所',
      '銀行口座サポート',
      '銀行口座サポート（その他）',
      'サイン権限',
      '権限者1-お名前',
      '権限者1-関係',
      '権限者2-お名前',
      '権限者2-関係',
      '処理状況',
      'PDF生成日時',
      'メール送信日時'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // データ保護設定
    applyDataProtection(sheet);
    
    console.log('香港法人設立申込シート設定完了');
  } catch (error) {
    console.error('香港法人設立申込シート設定エラー:', error);
  }
}

/**
 * データ保護設定の適用
 */
function applyDataProtection(sheet) {
  try {
    // シートの保護設定
    const protection = sheet.protect();
    protection.setDescription('香港法人設立申込データの保護');
    
    // 編集権限の設定
    const editors = protection.getEditors();
    protection.removeEditors(editors);
    protection.addEditor(Session.getActiveUser().getEmail());
    
    console.log('データ保護設定適用完了');
  } catch (error) {
    console.error('データ保護設定適用エラー:', error);
  }
}
