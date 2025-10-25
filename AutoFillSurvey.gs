/**
 * アンケートフォーム自動入力機能
 * OCR結果をアンケートフォームに自動入力する機能を提供
 */

/**
 * 自動入力対応のアンケートフォーム作成
 */
function createAutoFillSurveyForm() {
  try {
    const form = FormApp.create('LIFESUPPORT(HK) 香港法人設立申込書（自動入力対応）');
    
    form.setTitle('LIFESUPPORT(HK) 香港法人設立申込書（自動入力対応）')
         .setDescription('OCR機能により自動入力された情報を含む申込フォームです。')
         .setConfirmationMessage('お申込みありがとうございました。担当者より折り返しご連絡いたします。')
         .setAllowResponseEdits(false)
         .setAcceptingResponses(true);
    
    // 自動入力対応の質問項目を追加
    addAutoFillQuestions(form);
    
    // 回答先シートを設定
    const sheet = SpreadsheetApp.create('香港法人設立申込データ（自動入力）_' + new Date().getTime());
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
    
    // 自動入力用のスクリプトを追加
    addAutoFillScript(form);
    
    console.log('自動入力対応アンケートフォーム作成完了:', form.getPublishedUrl());
    return {
      formUrl: form.getPublishedUrl(),
      sheetId: sheet.getId(),
      formId: form.getId()
    };
  } catch (error) {
    console.error('自動入力対応アンケートフォーム作成エラー:', error);
    throw error;
  }
}

/**
 * 自動入力対応の質問項目を追加
 */
function addAutoFillQuestions(form) {
  try {
    // （１）お客様情報
    form.addPageBreakItem()
         .setTitle('（１）お客様情報');
    
    // 自動入力対応のフィールド
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
    
    // その他の質問項目（既存のSecureSurvey.gsからコピー）
    addAdditionalQuestions(form);
    
    console.log('自動入力対応質問項目追加完了');
  } catch (error) {
    console.error('自動入力対応質問項目追加エラー:', error);
  }
}

/**
 * 追加の質問項目を追加
 */
function addAdditionalQuestions(form) {
  try {
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
    
    // その他の質問項目は既存のSecureSurvey.gsからコピー
    // （４）会社情報以降の項目を追加
    addCompanyInformationQuestions(form);
    addOfficerInformationQuestions(form);
    addShareholderInformationQuestions(form);
    addCompanySecretaryQuestions(form);
    addBankingSupportQuestions(form);
    addBankingAuthorityQuestions(form);
    
  } catch (error) {
    console.error('追加質問項目追加エラー:', error);
  }
}

/**
 * 会社情報の質問項目を追加
 */
function addCompanyInformationQuestions(form) {
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
}

/**
 * 役員情報の質問項目を追加
 */
function addOfficerInformationQuestions(form) {
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
}

/**
 * 株主情報の質問項目を追加
 */
function addShareholderInformationQuestions(form) {
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
}

/**
 * 会社秘書役の質問項目を追加
 */
function addCompanySecretaryQuestions(form) {
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
}

/**
 * 銀行口座サポートの質問項目を追加
 */
function addBankingSupportQuestions(form) {
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
}

/**
 * 銀行口座サイン権限者の質問項目を追加
 */
function addBankingAuthorityQuestions(form) {
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
}

/**
 * 自動入力用のスクリプトを追加
 */
function addAutoFillScript(form) {
  try {
    // フォームに自動入力用のスクリプトを追加
    const script = `
    <script>
      // URLパラメータから自動入力データを取得
      function getAutoFillData() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
          name: urlParams.get('name') || '',
          postalCode: urlParams.get('postalCode') || '',
          address: urlParams.get('address') || '',
          autoFill: urlParams.get('autoFill') === 'true'
        };
      }
      
      // 自動入力データをフォームに適用
      function applyAutoFill() {
        const data = getAutoFillData();
        if (data.autoFill) {
      // フォームフィールドに自動入力（Googleフォームの実際のフィールド名を使用）
      const nameField = document.querySelector('input[aria-label*="お名前"], input[name*="お名前"]');
      if (nameField) nameField.value = data.name;
      
      const postalCodeField = document.querySelector('input[aria-label*="郵便番号"], input[name*="郵便番号"]');
      if (postalCodeField) postalCodeField.value = data.postalCode;
      
      const addressField = document.querySelector('input[aria-label*="住所"], input[name*="住所"]');
      if (addressField) addressField.value = data.address;
          
          // 自動入力されたことをユーザーに通知
          if (data.name || data.postalCode || data.address) {
            alert('OCR結果が自動入力されました。内容を確認し、必要に応じて修正してください。');
          }
        }
      }
      
      // ページ読み込み時に自動入力実行
      document.addEventListener('DOMContentLoaded', applyAutoFill);
    </script>
    `;
    
    // フォームの説明に自動入力スクリプトを追加
    const currentDescription = form.getDescription();
    form.setDescription(currentDescription + '\n\n' + script);
    
    console.log('自動入力スクリプト追加完了');
  } catch (error) {
    console.error('自動入力スクリプト追加エラー:', error);
  }
}

/**
 * 自動入力対応フォームの初期化
 */
function initializeAutoFillSurvey() {
  try {
    const result = createAutoFillSurveyForm();
    
    console.log('自動入力対応アンケートフォーム初期化完了');
    console.log('フォームURL:', result.formUrl);
    console.log('フォームID:', result.formId);
    console.log('シートID:', result.sheetId);
    
    return result;
  } catch (error) {
    console.error('自動入力対応アンケートフォーム初期化エラー:', error);
    throw error;
  }
}
