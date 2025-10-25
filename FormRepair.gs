/**
 * フォーム修復機能
 * 空白欄や未設定の質問項目をチェック・修復する
 */

/**
 * フォームの空白欄をチェック・修復
 */
function checkAndRepairForm() {
  try {
    const formId = '1FAIpQLSfDS6ynpQxljT8bsXHlg0wBFED37-XnziFZ0pRMLMjQ14A9Jw';
    const form = FormApp.openById(formId);
    
    console.log('フォーム修復開始...');
    
    // フォーム項目を取得
    const items = form.getItems();
    let repairedCount = 0;
    let removedCount = 0;
    
    // 各項目をチェック
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemType = item.getType();
      
      // 空白のラジオボタン項目をチェック
      if (itemType === FormApp.ItemType.MULTIPLE_CHOICE) {
        const multipleChoiceItem = item.asMultipleChoiceItem();
        const title = multipleChoiceItem.getTitle();
        const choices = multipleChoiceItem.getChoices();
        
        // タイトルが空白または未設定の場合
        if (!title || title.trim() === '' || title === '質問' || title === 'Question') {
          console.log(`空白のラジオボタン項目を削除: ${i}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
        
        // 選択肢が空白の場合
        if (choices.length === 0) {
          console.log(`選択肢のないラジオボタン項目を削除: ${title}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
        
        // 空白の選択肢をチェック
        const validChoices = choices.filter(choice => 
          choice.getValue() && choice.getValue().trim() !== ''
        );
        
        if (validChoices.length === 0) {
          console.log(`有効な選択肢のない項目を削除: ${title}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
      }
      
      // 空白のチェックボックス項目をチェック
      if (itemType === FormApp.ItemType.CHECKBOX) {
        const checkboxItem = item.asCheckboxItem();
        const title = checkboxItem.getTitle();
        const choices = checkboxItem.getChoices();
        
        // タイトルが空白または未設定の場合
        if (!title || title.trim() === '' || title === '質問' || title === 'Question') {
          console.log(`空白のチェックボックス項目を削除: ${i}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
        
        // 選択肢が空白の場合
        if (choices.length === 0) {
          console.log(`選択肢のないチェックボックス項目を削除: ${title}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
      }
      
      // 空白のテキスト項目をチェック
      if (itemType === FormApp.ItemType.TEXT) {
        const textItem = item.asTextItem();
        const title = textItem.getTitle();
        
        // タイトルが空白または未設定の場合
        if (!title || title.trim() === '' || title === '質問' || title === 'Question') {
          console.log(`空白のテキスト項目を削除: ${i}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
      }
      
      // 空白の段落テキスト項目をチェック
      if (itemType === FormApp.ItemType.PARAGRAPH_TEXT) {
        const paragraphItem = item.asParagraphTextItem();
        const title = paragraphItem.getTitle();
        
        // タイトルが空白または未設定の場合
        if (!title || title.trim() === '' || title === '質問' || title === 'Question') {
          console.log(`空白の段落テキスト項目を削除: ${i}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
      }
      
      // 空白のスケール項目をチェック
      if (itemType === FormApp.ItemType.SCALE) {
        const scaleItem = item.asScaleItem();
        const title = scaleItem.getTitle();
        
        // タイトルが空白または未設定の場合
        if (!title || title.trim() === '' || title === '質問' || title === 'Question') {
          console.log(`空白のスケール項目を削除: ${i}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
      }
      
      // 空白の日付項目をチェック
      if (itemType === FormApp.ItemType.DATE) {
        const dateItem = item.asDateItem();
        const title = dateItem.getTitle();
        
        // タイトルが空白または未設定の場合
        if (!title || title.trim() === '' || title === '質問' || title === 'Question') {
          console.log(`空白の日付項目を削除: ${i}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
      }
      
      // 空白の時刻項目をチェック
      if (itemType === FormApp.ItemType.TIME) {
        const timeItem = item.asTimeItem();
        const title = timeItem.getTitle();
        
        // タイトルが空白または未設定の場合
        if (!title || title.trim() === '' || title === '質問' || title === 'Question') {
          console.log(`空白の時刻項目を削除: ${i}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
      }
      
      // 空白のリスト項目をチェック
      if (itemType === FormApp.ItemType.LIST) {
        const listItem = item.asListItem();
        const title = listItem.getTitle();
        const choices = listItem.getChoices();
        
        // タイトルが空白または未設定の場合
        if (!title || title.trim() === '' || title === '質問' || title === 'Question') {
          console.log(`空白のリスト項目を削除: ${i}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
        
        // 選択肢が空白の場合
        if (choices.length === 0) {
          console.log(`選択肢のないリスト項目を削除: ${title}`);
          form.deleteItem(item);
          removedCount++;
          continue;
        }
      }
    }
    
    console.log(`フォーム修復完了: ${removedCount}個の空白項目を削除`);
    
    return {
      success: true,
      removedCount: removedCount,
      message: `${removedCount}個の空白項目を削除しました`
    };
    
  } catch (error) {
    console.error('フォーム修復エラー:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * フォーム項目の詳細チェック
 */
function detailedFormCheck() {
  try {
    const formId = '1FAIpQLSfDS6ynpQxljT8bsXHlg0wBFED37-XnziFZ0pRMLMjQ14A9Jw';
    const form = FormApp.openById(formId);
    
    const items = form.getItems();
    const report = {
      totalItems: items.length,
      emptyItems: [],
      invalidItems: [],
      validItems: []
    };
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemType = item.getType();
      const title = item.getTitle();
      
      const itemInfo = {
        index: i,
        type: itemType.toString(),
        title: title,
        isEmpty: !title || title.trim() === '' || title === '質問' || title === 'Question'
      };
      
      if (itemInfo.isEmpty) {
        report.emptyItems.push(itemInfo);
      } else {
        report.validItems.push(itemInfo);
      }
    }
    
    console.log('フォーム詳細チェック結果:', report);
    return report;
    
  } catch (error) {
    console.error('フォーム詳細チェックエラー:', error);
    return null;
  }
}

/**
 * フォームの完全修復
 */
function completeFormRepair() {
  try {
    console.log('フォーム完全修復開始...');
    
    // 1. 詳細チェック
    const checkResult = detailedFormCheck();
    console.log('詳細チェック結果:', checkResult);
    
    // 2. 空白項目の修復
    const repairResult = checkAndRepairForm();
    console.log('修復結果:', repairResult);
    
    // 3. 最終チェック
    const finalCheck = detailedFormCheck();
    console.log('最終チェック結果:', finalCheck);
    
    return {
      success: true,
      initialEmptyItems: checkResult ? checkResult.emptyItems.length : 0,
      removedItems: repairResult.removedCount,
      finalEmptyItems: finalCheck ? finalCheck.emptyItems.length : 0,
      message: 'フォームの完全修復が完了しました'
    };
    
  } catch (error) {
    console.error('フォーム完全修復エラー:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * フォーム項目の統計情報
 */
function getFormStatistics() {
  try {
    const formId = '1FAIpQLSfDS6ynpQxljT8bsXHlg0wBFED37-XnziFZ0pRMLMjQ14A9Jw';
    const form = FormApp.openById(formId);
    
    const items = form.getItems();
    const statistics = {
      totalItems: items.length,
      itemTypes: {},
      requiredItems: 0,
      optionalItems: 0,
      emptyItems: 0
    };
    
    for (const item of items) {
      const itemType = item.getType().toString();
      const title = item.getTitle();
      
      // 項目タイプの統計
      if (!statistics.itemTypes[itemType]) {
        statistics.itemTypes[itemType] = 0;
      }
      statistics.itemTypes[itemType]++;
      
      // 必須/任意の統計
      if (item.isRequired()) {
        statistics.requiredItems++;
      } else {
        statistics.optionalItems++;
      }
      
      // 空白項目の統計
      if (!title || title.trim() === '' || title === '質問' || title === 'Question') {
        statistics.emptyItems++;
      }
    }
    
    console.log('フォーム統計情報:', statistics);
    return statistics;
    
  } catch (error) {
    console.error('フォーム統計取得エラー:', error);
    return null;
  }
}
