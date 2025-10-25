/**
 * シートマッピング機能
 * PDFフォーマット（format-hk1.pdf）に基づくシート設計とデータマッピング
 */

/**
 * PDFフォーマットに基づくシート設計
 */
function createFormattedSheet(sheetId) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    
    // シート名を設定
    sheet.setName('LIFESUPPORT(HK) アンケート回答データ');
    
    // ヘッダー行の設定
    setupSheetHeaders(sheet);
    
    // フォーマットの適用
    applySheetFormatting(sheet);
    
    // データ検証の設定
    setupDataValidation(sheet);
    
    console.log('シート設計完了');
    return sheet;
  } catch (error) {
    console.error('シート設計エラー:', error);
    throw error;
  }
}

/**
 * ヘッダー行の設定
 */
function setupSheetHeaders(sheet) {
  const headers = [
    '回答ID',
    '回答日時',
    'お名前',
    '会社名',
    '部署名',
    '電話番号',
    'メールアドレス',
    'サービス満足度',
    '利用サービス',
    '推奨度',
    'ご意見・ご要望',
    '処理状況',
    'PDF生成日時',
    'メール送信日時'
  ];
  
  // ヘッダー行を設定
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // ヘッダー行のスタイル設定
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285F4')
             .setFontColor('#FFFFFF')
             .setFontWeight('bold')
             .setHorizontalAlignment('center');
}

/**
 * シートフォーマットの適用
 */
function applySheetFormatting(sheet) {
  try {
    // 列幅の設定
    const columnWidths = [80, 150, 120, 150, 100, 120, 200, 100, 150, 80, 300, 100, 150, 150];
    columnWidths.forEach((width, index) => {
      sheet.setColumnWidth(index + 1, width);
    });
    
    // 行の高さ設定
    sheet.setRowHeight(1, 30); // ヘッダー行
    
    // 境界線の設定
    const lastRow = sheet.getLastRow() || 1;
    const lastCol = sheet.getLastColumn() || 14;
    
    if (lastRow > 0) {
      const range = sheet.getRange(1, 1, lastRow, lastCol);
      range.setBorder(true, true, true, true, true, true);
    }
    
    // テキストの配置
    sheet.getRange(1, 1, lastRow, lastCol).setVerticalAlignment('middle');
    
    console.log('フォーマット適用完了');
  } catch (error) {
    console.error('フォーマット適用エラー:', error);
  }
}

/**
 * データ検証の設定
 */
function setupDataValidation(sheet) {
  try {
    // サービス満足度の検証
    const satisfactionRange = sheet.getRange('H:H');
    const satisfactionRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['非常に満足', '満足', '普通', '不満', '非常に不満'], true)
      .setAllowInvalid(false)
      .setHelpText('満足度を選択してください')
      .build();
    satisfactionRange.setDataValidation(satisfactionRule);
    
    // 推奨度の検証（1-10）
    const recommendationRange = sheet.getRange('J:J');
    const recommendationRule = SpreadsheetApp.newDataValidation()
      .requireNumberBetween(1, 10)
      .setAllowInvalid(false)
      .setHelpText('1-10の数値を入力してください')
      .build();
    recommendationRange.setDataValidation(recommendationRule);
    
    // メールアドレスの検証
    const emailRange = sheet.getRange('G:G');
    const emailRule = SpreadsheetApp.newDataValidation()
      .requireTextMatchesPattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      .setAllowInvalid(false)
      .setHelpText('有効なメールアドレスを入力してください')
      .build();
    emailRange.setDataValidation(emailRule);
    
    console.log('データ検証設定完了');
  } catch (error) {
    console.error('データ検証設定エラー:', error);
  }
}

/**
 * 回答データのマッピングと入力
 */
function mapResponseData(sheet, responseData) {
  try {
    const rowNumber = sheet.getLastRow() + 1;
    const responseId = generateResponseId();
    
    // データのマッピング
    const mappedData = [
      responseId,                                    // 回答ID
      new Date(),                                    // 回答日時
      responseData['お名前'] || '',                   // お名前
      responseData['会社名'] || '',                  // 会社名
      responseData['部署名'] || '',                  // 部署名
      responseData['電話番号'] || '',                // 電話番号
      responseData['メールアドレス'] || '',          // メールアドレス
      responseData['サービス満足度'] || '',          // サービス満足度
      responseData['利用しているサービス（複数選択可）'] || '', // 利用サービス
      responseData['推奨度（1-10）'] || '',          // 推奨度
      responseData['ご意見・ご要望'] || '',          // ご意見・ご要望
      '未処理',                                      // 処理状況
      '',                                           // PDF生成日時
      ''                                            // メール送信日時
    ];
    
    // データをシートに追加
    sheet.getRange(rowNumber, 1, 1, mappedData.length).setValues([mappedData]);
    
    // 行のスタイル設定
    applyRowFormatting(sheet, rowNumber);
    
    console.log('データマッピング完了:', responseId);
    return responseId;
  } catch (error) {
    console.error('データマッピングエラー:', error);
    throw error;
  }
}

/**
 * 行のフォーマット適用
 */
function applyRowFormatting(sheet, rowNumber) {
  try {
    const rowRange = sheet.getRange(rowNumber, 1, 1, 14);
    
    // 交互の行色設定
    if (rowNumber % 2 === 0) {
      rowRange.setBackground('#F8F9FA');
    } else {
      rowRange.setBackground('#FFFFFF');
    }
    
    // 境界線の設定
    rowRange.setBorder(true, true, true, true, true, true);
    
    // テキストの配置
    rowRange.setVerticalAlignment('middle');
    
    console.log('行フォーマット適用完了');
  } catch (error) {
    console.error('行フォーマット適用エラー:', error);
  }
}

/**
 * 回答IDの生成
 */
function generateResponseId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `RESP_${timestamp}_${random}`;
}

/**
 * シートの自動完成処理
 */
function completeSheetAutomatically(sheet, responseId) {
  try {
    // 該当行を検索
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    let targetRow = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === responseId) {
        targetRow = i + 1;
        break;
      }
    }
    
    if (targetRow === -1) {
      throw new Error('該当する回答が見つかりません');
    }
    
    // 処理状況を更新
    sheet.getRange(targetRow, 12).setValue('処理中');
    
    // データの検証と補完
    validateAndCompleteData(sheet, targetRow);
    
    // 処理状況を完了に更新
    sheet.getRange(targetRow, 12).setValue('完了');
    
    console.log('シート自動完成完了');
    return true;
  } catch (error) {
    console.error('シート自動完成エラー:', error);
    return false;
  }
}

/**
 * データの検証と補完
 */
function validateAndCompleteData(sheet, rowNumber) {
  try {
    // 必須項目の検証
    const requiredColumns = [3, 4, 6, 7, 8, 9, 10]; // C, D, G, H, I, J, K列
    const requiredFields = ['お名前', '会社名', 'メールアドレス', 'サービス満足度', '利用サービス', '推奨度', 'ご意見・ご要望'];
    
    for (let i = 0; i < requiredColumns.length; i++) {
      const cellValue = sheet.getRange(rowNumber, requiredColumns[i]).getValue();
      if (!cellValue || cellValue.toString().trim() === '') {
        console.warn(`必須項目が未入力: ${requiredFields[i]}`);
        // 必要に応じてデフォルト値を設定
        if (requiredFields[i] === 'ご意見・ご要望') {
          sheet.getRange(rowNumber, requiredColumns[i]).setValue('特になし');
        }
      }
    }
    
    // データの正規化
    normalizeData(sheet, rowNumber);
    
    console.log('データ検証・補完完了');
  } catch (error) {
    console.error('データ検証・補完エラー:', error);
  }
}

/**
 * データの正規化
 */
function normalizeData(sheet, rowNumber) {
  try {
    // 電話番号の正規化
    const phoneValue = sheet.getRange(rowNumber, 6).getValue();
    if (phoneValue) {
      const normalizedPhone = phoneValue.toString().replace(/[^\d-+()]/g, '');
      sheet.getRange(rowNumber, 6).setValue(normalizedPhone);
    }
    
    // メールアドレスの正規化
    const emailValue = sheet.getRange(rowNumber, 7).getValue();
    if (emailValue) {
      const normalizedEmail = emailValue.toString().toLowerCase().trim();
      sheet.getRange(rowNumber, 7).setValue(normalizedEmail);
    }
    
    // 会社名の正規化
    const companyValue = sheet.getRange(rowNumber, 4).getValue();
    if (companyValue) {
      const normalizedCompany = companyValue.toString().trim();
      sheet.getRange(rowNumber, 4).setValue(normalizedCompany);
    }
    
    console.log('データ正規化完了');
  } catch (error) {
    console.error('データ正規化エラー:', error);
  }
}

/**
 * 統計情報の生成
 */
function generateStatistics(sheet) {
  try {
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) {
      return { message: 'データがありません' };
    }
    
    const stats = {
      totalResponses: values.length - 1,
      satisfactionStats: {},
      serviceUsageStats: {},
      averageRecommendation: 0,
      recentResponses: []
    };
    
    // 満足度統計
    const satisfactionColumn = 8; // H列
    for (let i = 1; i < values.length; i++) {
      const satisfaction = values[i][satisfactionColumn - 1];
      if (satisfaction) {
        stats.satisfactionStats[satisfaction] = (stats.satisfactionStats[satisfaction] || 0) + 1;
      }
    }
    
    // 推奨度平均
    const recommendationColumn = 10; // J列
    let totalRecommendation = 0;
    let validRecommendations = 0;
    
    for (let i = 1; i < values.length; i++) {
      const recommendation = values[i][recommendationColumn - 1];
      if (recommendation && !isNaN(recommendation)) {
        totalRecommendation += parseFloat(recommendation);
        validRecommendations++;
      }
    }
    
    if (validRecommendations > 0) {
      stats.averageRecommendation = (totalRecommendation / validRecommendations).toFixed(2);
    }
    
    // 最近の回答（最新5件）
    const recentCount = Math.min(5, values.length - 1);
    for (let i = values.length - recentCount; i < values.length; i++) {
      stats.recentResponses.push({
        id: values[i][0],
        name: values[i][2],
        company: values[i][3],
        satisfaction: values[i][7],
        date: values[i][1]
      });
    }
    
    console.log('統計情報生成完了');
    return stats;
  } catch (error) {
    console.error('統計情報生成エラー:', error);
    return { error: error.message };
  }
}

