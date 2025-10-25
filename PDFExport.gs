/**
 * PDF変換とメール送信機能
 * シートのPDF変換、メール添付送信機能
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
 * シートをPDFに変換してメール送信
 */
function exportSheetToPDFAndEmail(sheetId, recipientEmail, responseId = null) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId);
    const file = DriveApp.getFileById(sheetId);
    
    // PDF変換の設定
    const pdfOptions = {
      'format': 'pdf',
      'size': 'A4',
      'portrait': true,
      'fitw': true,
      'fzr': false,
      'fzc': false,
      'attachment': false
    };
    
    // PDFとしてエクスポート
    const pdfBlob = file.getAs('application/pdf');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pdfName = `LIFESUPPORT_HK_アンケート回答_${timestamp}.pdf`;
    
    // PDFファイルを作成
    const pdfFile = DriveApp.createFile(pdfBlob).setName(pdfName);
    
    // メール送信
    const emailResult = sendPDFEmail(pdfFile, recipientEmail, responseId);
    
    // シートにPDF生成日時を記録
    if (responseId) {
      recordPDFGeneration(sheetId, responseId);
    }
    
    console.log('PDF変換・メール送信完了');
    return {
      success: true,
      pdfName: pdfName,
      pdfUrl: pdfFile.getUrl(),
      emailResult: emailResult
    };
  } catch (error) {
    console.error('PDF変換・メール送信エラー:', error);
    throw error;
  }
}

/**
 * PDFメール送信
 */
function sendPDFEmail(pdfFile, recipientEmail, responseId = null) {
  try {
    const subject = '【LIFESUPPORT(HK)】アンケート回答データ';
    const body = createEmailBody(responseId);
    
    const emailOptions = {
      attachments: [pdfFile.getBlob()],
      name: 'LIFESUPPORT(HK)LIMITED'
    };
    
    GmailApp.sendEmail(recipientEmail, subject, body, emailOptions);
    
    console.log('PDFメール送信完了');
    return { success: true, recipient: recipientEmail };
  } catch (error) {
    console.error('PDFメール送信エラー:', error);
    throw error;
  }
}

/**
 * メール本文の作成
 */
function createEmailBody(responseId = null) {
  const companyInfo = `
LIFESUPPORT(HK)LIMITED
No 163 Pan Chung, Tai Po, N.T.,HK
Tel: (852)52263586
Fax: (852)26530426
Website: https://lshk-ai-service.studio.site/
  `;
  
  let body = `
お疲れ様です。

アンケート回答データをPDFでお送りします。
${responseId ? `回答ID: ${responseId}` : ''}

ご確認のほど、よろしくお願いいたします。

---
${companyInfo}
  `;
  
  return body.trim();
}

/**
 * PDF生成日時の記録
 */
function recordPDFGeneration(sheetId, responseId) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // 該当行を検索
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === responseId) {
        // PDF生成日時を記録（13列目）
        sheet.getRange(i + 1, 13).setValue(new Date());
        break;
      }
    }
    
    console.log('PDF生成日時記録完了');
  } catch (error) {
    console.error('PDF生成日時記録エラー:', error);
  }
}

/**
 * メール送信日時の記録
 */
function recordEmailSent(sheetId, responseId) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // 該当行を検索
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === responseId) {
        // メール送信日時を記録（14列目）
        sheet.getRange(i + 1, 14).setValue(new Date());
        break;
      }
    }
    
    console.log('メール送信日時記録完了');
  } catch (error) {
    console.error('メール送信日時記録エラー:', error);
  }
}

/**
 * バッチ処理：未処理の回答を一括PDF変換・送信
 */
function batchProcessResponses(sheetId) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    const unprocessedResponses = [];
    
    // 未処理の回答を検索
    for (let i = 1; i < values.length; i++) {
      const processingStatus = values[i][11]; // L列（処理状況）
      const pdfGenerated = values[i][12]; // M列（PDF生成日時）
      
      if (processingStatus === '完了' && !pdfGenerated) {
        unprocessedResponses.push({
          row: i + 1,
          responseId: values[i][0],
          name: values[i][2],
          company: values[i][3],
          email: values[i][6]
        });
      }
    }
    
    console.log(`未処理回答数: ${unprocessedResponses.length}`);
    
    // 各回答を処理
    const results = [];
    for (const response of unprocessedResponses) {
      try {
        const result = exportSheetToPDFAndEmail(
          sheetId, 
          CONFIG.NOTIFICATION_EMAIL, 
          response.responseId
        );
        
        // メール送信日時を記録
        recordEmailSent(sheetId, response.responseId);
        
        results.push({
          responseId: response.responseId,
          success: true,
          result: result
        });
        
        // 処理間隔を空ける（API制限対策）
        Utilities.sleep(1000);
      } catch (error) {
        results.push({
          responseId: response.responseId,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('バッチ処理完了');
    return results;
  } catch (error) {
    console.error('バッチ処理エラー:', error);
    throw error;
  }
}

/**
 * カスタムPDF設定での変換
 */
function exportSheetWithCustomSettings(sheetId, settings = {}) {
  try {
    const defaultSettings = {
      format: 'pdf',
      size: 'A4',
      portrait: true,
      fitw: true,
      fzr: false,
      fzc: false,
      attachment: false,
      gridlines: false,
      printtitle: false,
      pagenumbers: false,
      printnotes: false
    };
    
    const finalSettings = { ...defaultSettings, ...settings };
    
    const sheet = SpreadsheetApp.openById(sheetId);
    const file = DriveApp.getFileById(sheetId);
    
    // カスタム設定でPDF変換
    const pdfBlob = file.getAs('application/pdf');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pdfName = `LIFESUPPORT_HK_カスタム_${timestamp}.pdf`;
    
    const pdfFile = DriveApp.createFile(pdfBlob).setName(pdfName);
    
    console.log('カスタムPDF変換完了');
    return {
      success: true,
      pdfName: pdfName,
      pdfUrl: pdfFile.getUrl(),
      settings: finalSettings
    };
  } catch (error) {
    console.error('カスタムPDF変換エラー:', error);
    throw error;
  }
}

/**
 * PDF品質設定
 */
function getPDFQualitySettings(quality = 'standard') {
  const qualitySettings = {
    'high': {
      format: 'pdf',
      size: 'A4',
      portrait: true,
      fitw: true,
      fzr: false,
      fzc: false,
      gridlines: false,
      printtitle: false,
      pagenumbers: false,
      printnotes: false
    },
    'standard': {
      format: 'pdf',
      size: 'A4',
      portrait: true,
      fitw: true,
      fzr: false,
      fzc: false
    },
    'fast': {
      format: 'pdf',
      size: 'A4',
      portrait: true
    }
  };
  
  return qualitySettings[quality] || qualitySettings['standard'];
}

/**
 * メール送信統計
 */
function getEmailStatistics(sheetId) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    const stats = {
      totalResponses: values.length - 1,
      pdfGenerated: 0,
      emailSent: 0,
      pending: 0,
      errors: 0
    };
    
    for (let i = 1; i < values.length; i++) {
      const pdfGenerated = values[i][12]; // M列
      const emailSent = values[i][13]; // N列
      const processingStatus = values[i][11]; // L列
      
      if (pdfGenerated) stats.pdfGenerated++;
      if (emailSent) stats.emailSent++;
      if (processingStatus === '未処理') stats.pending++;
      if (processingStatus === 'エラー') stats.errors++;
    }
    
    console.log('メール送信統計完了');
    return stats;
  } catch (error) {
    console.error('メール送信統計エラー:', error);
    return { error: error.message };
  }
}

/**
 * エラーハンドリングとリトライ機能
 */
function retryPDFExport(sheetId, responseId, maxRetries = 3) {
  let attempts = 0;
  let lastError = null;
  
  while (attempts < maxRetries) {
    try {
      const result = exportSheetToPDFAndEmail(sheetId, CONFIG.NOTIFICATION_EMAIL, responseId);
      console.log(`PDF変換成功 (試行回数: ${attempts + 1})`);
      return result;
    } catch (error) {
      attempts++;
      lastError = error;
      console.warn(`PDF変換失敗 (試行回数: ${attempts}): ${error.message}`);
      
      if (attempts < maxRetries) {
        // 指数バックオフで待機
        const waitTime = Math.pow(2, attempts) * 1000;
        Utilities.sleep(waitTime);
      }
    }
  }
  
  // 最大試行回数に達した場合
  console.error(`PDF変換失敗 (最大試行回数: ${maxRetries}): ${lastError.message}`);
  throw lastError;
}
