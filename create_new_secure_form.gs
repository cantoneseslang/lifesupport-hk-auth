/**
 * 新しいセキュアアンケートフォームを実際に作成
 */

function createNewSecureForm() {
  try {
    // 新しいセキュアフォームを作成
    const form = FormApp.create('LIFESUPPORT(HK) セキュアアンケート v2');
    
    // フォームの基本設定
    form.setTitle('LIFESUPPORT(HK) セキュアアンケート v2')
         .setDescription('認証済み会員様向けのセキュアアンケートです。認証トークンが必要です。')
         .setConfirmationMessage('ご回答ありがとうございました。')
         .setAllowResponseEdits(false)
         .setAcceptingResponses(true);
    
    // 認証トークン（必須・隠しフィールド）
    form.addTextItem()
         .setTitle('認証トークン')
         .setRequired(true)
         .setHelpText('認証システムから自動で入力されます');
    
    // 基本情報
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
    
    // アンケート内容
    form.addPageBreakItem()
         .setTitle('アンケート内容');
    
    // 満足度
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
    
    // 利用サービス
    const checkboxItem = form.addCheckboxItem();
    checkboxItem.setTitle('利用しているサービス（複数選択可）')
               .setChoices([
                 checkboxItem.createChoice('Webサービス'),
                 checkboxItem.createChoice('モバイルアプリ'),
                 checkboxItem.createChoice('カスタマーサポート'),
                 checkboxItem.createChoice('その他')
               ])
               .setRequired(true);
    
    // 推奨度
    const scaleItem = form.addScaleItem();
    scaleItem.setTitle('推奨度（1-10）')
            .setBounds(1, 10)
            .setRequired(true);
    
    // 意見・要望
    form.addParagraphTextItem()
         .setTitle('ご意見・ご要望')
         .setRequired(false);
    
    // 回答先シートを設定
    const sheet = SpreadsheetApp.create('セキュアアンケート回答データ_v2_' + new Date().getTime());
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
    
    console.log('新しいセキュアフォーム作成完了');
    console.log('フォームURL:', form.getPublishedUrl());
    console.log('フォームID:', form.getId());
    console.log('シートID:', sheet.getId());
    
    return {
      success: true,
      formUrl: form.getPublishedUrl(),
      formId: form.getId(),
      sheetId: sheet.getId(),
      message: '新しいセキュアフォームが作成されました'
    };
  } catch (error) {
    console.error('セキュアフォーム作成エラー:', error);
    throw error;
  }
}
