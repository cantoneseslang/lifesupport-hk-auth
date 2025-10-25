/**
 * フォーム修復テスト機能
 * フォーム修復機能のテストと実行
 */

/**
 * フォーム修復テストの実行
 */
function runFormRepairTest() {
  try {
    console.log('=== フォーム修復テスト開始 ===');
    
    // 1. 修復前の状態確認
    console.log('1. 修復前の状態確認...');
    const beforeStatus = getFormStatus();
    console.log('修復前の状態:', beforeStatus);
    
    // 2. フォーム修復実行
    console.log('2. フォーム修復実行...');
    const repairResult = executeFormRepair();
    console.log('修復結果:', repairResult);
    
    // 3. 修復後の状態確認
    console.log('3. 修復後の状態確認...');
    const afterStatus = getFormStatus();
    console.log('修復後の状態:', afterStatus);
    
    // 4. 結果の比較
    const comparison = {
      before: {
        totalItems: beforeStatus.statistics ? beforeStatus.statistics.totalItems : 0,
        emptyItems: beforeStatus.checkResult ? beforeStatus.checkResult.emptyItems.length : 0
      },
      after: {
        totalItems: afterStatus.statistics ? afterStatus.statistics.totalItems : 0,
        emptyItems: afterStatus.checkResult ? afterStatus.checkResult.emptyItems.length : 0
      },
      improvement: {
        itemsRemoved: (beforeStatus.statistics ? beforeStatus.statistics.totalItems : 0) - 
                     (afterStatus.statistics ? afterStatus.statistics.totalItems : 0),
        emptyItemsRemoved: (beforeStatus.checkResult ? beforeStatus.checkResult.emptyItems.length : 0) - 
                          (afterStatus.checkResult ? afterStatus.checkResult.emptyItems.length : 0)
      }
    };
    
    console.log('=== 修復結果比較 ===');
    console.log('修復前:', comparison.before);
    console.log('修復後:', comparison.after);
    console.log('改善点:', comparison.improvement);
    
    return {
      success: true,
      before: comparison.before,
      after: comparison.after,
      improvement: comparison.improvement,
      message: 'フォーム修復テストが完了しました'
    };
    
  } catch (error) {
    console.error('フォーム修復テストエラー:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * フォーム項目の詳細分析
 */
function analyzeFormItems() {
  try {
    const formId = '1FAIpQLSfDS6ynpQxljT8bsXHlg0wBFED37-XnziFZ0pRMLMjQ14A9Jw';
    const form = FormApp.openById(formId);
    
    const items = form.getItems();
    const analysis = {
      totalItems: items.length,
      itemDetails: [],
      problems: [],
      recommendations: []
    };
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemType = item.getType();
      const title = item.getTitle();
      
      const itemDetail = {
        index: i,
        type: itemType.toString(),
        title: title,
        isRequired: item.isRequired(),
        isEmpty: !title || title.trim() === '' || title === '質問' || title === 'Question',
        hasHelpText: item.getHelpText() ? true : false
      };
      
      analysis.itemDetails.push(itemDetail);
      
      // 問題の特定
      if (itemDetail.isEmpty) {
        analysis.problems.push({
          type: 'empty_title',
          index: i,
          description: 'タイトルが空白または未設定'
        });
      }
      
      if (itemType === FormApp.ItemType.MULTIPLE_CHOICE) {
        const multipleChoiceItem = item.asMultipleChoiceItem();
        const choices = multipleChoiceItem.getChoices();
        
        if (choices.length === 0) {
          analysis.problems.push({
            type: 'no_choices',
            index: i,
            description: '選択肢が設定されていない'
          });
        }
        
        // 空白の選択肢をチェック
        const emptyChoices = choices.filter(choice => 
          !choice.getValue() || choice.getValue().trim() === ''
        );
        
        if (emptyChoices.length > 0) {
          analysis.problems.push({
            type: 'empty_choices',
            index: i,
            description: `${emptyChoices.length}個の空白選択肢がある`
          });
        }
      }
      
      if (itemType === FormApp.ItemType.CHECKBOX) {
        const checkboxItem = item.asCheckboxItem();
        const choices = checkboxItem.getChoices();
        
        if (choices.length === 0) {
          analysis.problems.push({
            type: 'no_checkbox_choices',
            index: i,
            description: 'チェックボックスの選択肢が設定されていない'
          });
        }
      }
    }
    
    // 推奨事項の生成
    if (analysis.problems.length > 0) {
      analysis.recommendations.push('空白の項目を削除することを推奨します');
      analysis.recommendations.push('選択肢のないラジオボタンやチェックボックスを削除することを推奨します');
    }
    
    if (analysis.itemDetails.filter(item => !item.hasHelpText).length > 0) {
      analysis.recommendations.push('ヘルプテキストの追加を検討してください');
    }
    
    console.log('フォーム項目分析結果:', analysis);
    return analysis;
    
  } catch (error) {
    console.error('フォーム項目分析エラー:', error);
    return null;
  }
}

/**
 * フォーム修復の自動実行
 */
function autoFormRepair() {
  try {
    console.log('=== 自動フォーム修復開始 ===');
    
    // 1. 現在の状態を分析
    const analysis = analyzeFormItems();
    console.log('現在の状態分析:', analysis);
    
    if (analysis && analysis.problems.length === 0) {
      console.log('修復が必要な問題は見つかりませんでした');
      return {
        success: true,
        message: 'フォームは正常な状態です',
        problems: 0
      };
    }
    
    // 2. 修復を実行
    const repairResult = executeFormRepair();
    console.log('修復実行結果:', repairResult);
    
    // 3. 修復後の再分析
    const afterAnalysis = analyzeFormItems();
    console.log('修復後の分析:', afterAnalysis);
    
    return {
      success: true,
      beforeProblems: analysis ? analysis.problems.length : 0,
      afterProblems: afterAnalysis ? afterAnalysis.problems.length : 0,
      problemsFixed: (analysis ? analysis.problems.length : 0) - (afterAnalysis ? afterAnalysis.problems.length : 0),
      message: '自動フォーム修復が完了しました'
    };
    
  } catch (error) {
    console.error('自動フォーム修復エラー:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}
