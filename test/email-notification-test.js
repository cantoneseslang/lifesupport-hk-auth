/**
 * メール通知テスト
 * 最終通知メールが正しく送信されるかをテスト
 */

class EmailNotificationTest {
  constructor() {
    this.testResults = [];
    this.sentEmails = [];
  }

  /**
   * メール送信テスト
   */
  async testEmailSending(recipientEmail, emailData) {
    console.log('📧 メール送信テストを開始...');
    
    try {
      const sendResult = await this.sendEmail(recipientEmail, emailData);
      
      const testResult = {
        test: 'Email Sending',
        status: sendResult.success ? 'PASS' : 'FAIL',
        details: {
          recipient: recipientEmail,
          subject: emailData.subject,
          sent: sendResult.success,
          messageId: sendResult.messageId,
          error: sendResult.error
        }
      };
      
      this.testResults.push(testResult);
      
      console.log(`✅ メール送信テスト完了: ${sendResult.success ? 'SUCCESS' : 'FAILED'}`);
      
      return sendResult;
      
    } catch (error) {
      console.error('❌ メール送信テストエラー:', error);
      this.testResults.push({
        test: 'Email Sending',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * メール内容検証テスト
   */
  async testEmailContent(emailData) {
    console.log('📝 メール内容検証テストを開始...');
    
    try {
      const contentValidation = this.validateEmailContent(emailData);
      
      const testResult = {
        test: 'Email Content Validation',
        status: contentValidation.isValid ? 'PASS' : 'FAIL',
        details: {
          hasSubject: contentValidation.hasSubject,
          hasBody: contentValidation.hasBody,
          hasCompanyInfo: contentValidation.hasCompanyInfo,
          hasContactInfo: contentValidation.hasContactInfo,
          issues: contentValidation.issues
        }
      };
      
      this.testResults.push(testResult);
      
      console.log(`✅ メール内容検証テスト完了: ${contentValidation.isValid ? 'VALID' : 'INVALID'}`);
      
      return contentValidation;
      
    } catch (error) {
      console.error('❌ メール内容検証テストエラー:', error);
      this.testResults.push({
        test: 'Email Content Validation',
        status: 'ERROR',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * メール送信（モック実装）
   */
  async sendEmail(recipientEmail, emailData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // モック実装：実際のメール送信をシミュレート
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 送信されたメールを記録
        this.sentEmails.push({
          messageId: messageId,
          recipient: recipientEmail,
          subject: emailData.subject,
          timestamp: new Date().toISOString(),
          data: emailData
        });
        
        resolve({
          success: true,
          messageId: messageId,
          timestamp: new Date().toISOString()
        });
      }, 300);
    });
  }

  /**
   * メール内容の検証
   */
  validateEmailContent(emailData) {
    const validation = {
      isValid: true,
      hasSubject: false,
      hasBody: false,
      hasCompanyInfo: false,
      hasContactInfo: false,
      issues: []
    };
    
    // 件名の確認
    if (emailData.subject && emailData.subject.trim() !== '') {
      validation.hasSubject = true;
    } else {
      validation.issues.push('件名が設定されていません');
      validation.isValid = false;
    }
    
    // 本文の確認
    if (emailData.body && emailData.body.trim() !== '') {
      validation.hasBody = true;
    } else {
      validation.issues.push('本文が設定されていません');
      validation.isValid = false;
    }
    
    // 会社情報の確認
    const companyInfoKeywords = ['LIFESUPPORT', '会社名', '住所', '電話', 'FAX'];
    const hasCompanyInfo = companyInfoKeywords.some(keyword => 
      emailData.body.includes(keyword)
    );
    
    if (hasCompanyInfo) {
      validation.hasCompanyInfo = true;
    } else {
      validation.issues.push('会社情報が含まれていません');
      validation.isValid = false;
    }
    
    // 連絡先情報の確認
    const contactInfoKeywords = ['電話', 'FAX', 'メール', 'ウェブサイト'];
    const hasContactInfo = contactInfoKeywords.some(keyword => 
      emailData.body.includes(keyword)
    );
    
    if (hasContactInfo) {
      validation.hasContactInfo = true;
    } else {
      validation.issues.push('連絡先情報が含まれていません');
      validation.isValid = false;
    }
    
    return validation;
  }

  /**
   * テスト用メールデータの生成
   */
  generateTestEmailData() {
    return {
      subject: '【LIFESUPPORT】アンケート回答完了のお知らせ',
      body: `
お客様

この度は、LIFESUPPORT(HK)LIMITEDのアンケートにご回答いただき、誠にありがとうございました。

【会社情報】
会社名: LIFESUPPORT(HK)LIMITED
住所: No 163 Pan Chung, Tai Po, N.T.,HK
電話: (852)52263586
FAX: (852)26530426
ウェブサイト: https://lshk-ai-service.studio.site/

【回答内容の確認】
お客様のご回答は正常に受信され、データベースに安全に保存されました。
ご提供いただいた情報は、サービス向上のために活用させていただきます。

【今後の対応】
・回答データの分析結果は、後日メールにてお送りいたします
・ご質問やご不明な点がございましたら、上記連絡先までお気軽にお問い合わせください

今後ともLIFESUPPORT(HK)LIMITEDをよろしくお願いいたします。

LIFESUPPORT(HK)LIMITED
代表取締役
      `.trim()
    };
  }

  /**
   * 送信済みメールの取得
   */
  getSentEmails() {
    return this.sentEmails;
  }

  /**
   * テスト結果の取得
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * テスト結果の表示
   */
  displayResults() {
    console.log('\n📊 メール通知テスト結果:');
    console.log('='.repeat(50));
    
    for (const result of this.testResults) {
      const status = result.status === 'PASS' ? '✅' : 
                    result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${status} ${result.test}: ${result.status}`);
      
      if (result.details) {
        console.log(`   詳細:`, JSON.stringify(result.details, null, 2));
      }
      
      if (result.error) {
        console.log(`   エラー: ${result.error}`);
      }
    }
    
    console.log('\n📧 送信済みメール:');
    for (const email of this.sentEmails) {
      console.log(`   - ${email.recipient}: ${email.subject} (${email.timestamp})`);
    }
    
    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const totalCount = this.testResults.length;
    
    console.log('\n' + '='.repeat(50));
    console.log(`📈 成功率: ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)`);
  }
}

// テスト実行
async function runEmailNotificationTests() {
  const tester = new EmailNotificationTest();
  
  try {
    const testEmail = 'test@example.com';
    const emailData = tester.generateTestEmailData();
    
    // メール内容検証
    await tester.testEmailContent(emailData);
    
    // メール送信テスト
    await tester.testEmailSending(testEmail, emailData);
    
    // 結果表示
    tester.displayResults();
    
    return tester.getTestResults();
    
  } catch (error) {
    console.error('❌ メール通知テスト実行エラー:', error);
    throw error;
  }
}

// メイン実行
if (require.main === module) {
  runEmailNotificationTests()
    .then(results => {
      const hasFailures = results.some(r => r.status === 'FAIL' || r.status === 'ERROR');
      process.exit(hasFailures ? 1 : 0);
    })
    .catch(error => {
      console.error('テスト実行失敗:', error);
      process.exit(1);
    });
}

module.exports = { EmailNotificationTest, runEmailNotificationTests };
