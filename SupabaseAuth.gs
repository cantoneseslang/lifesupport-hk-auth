/**
 * Supabase認証システム
 * 会員登録・認証・ログイン機能
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

// Supabase設定
const SUPABASE_CONFIG = {
  URL: 'https://ihviwvlptzalbrjktddf.supabase.co',
  API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodml3dmxwdHphbGJyamt0ZGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDI1ODksImV4cCI6MjA3Njg3ODU4OX0.UjNdR4bOdaDmznucIZ5K-ZNMEDGPbVBAT5D40Mf-E60',
  MCP_URL: 'https://mcp.supabase.com/mcp?project_ref=ihviwvlptzalbrjktddf'
};

/**
 * 会員登録処理
 */
function registerMember(userData) {
  try {
    const payload = {
      email: userData.email,
      password: userData.password,
      data: {
        full_name: userData.fullName,
        company: userData.company,
        phone: userData.phone,
        department: userData.department || '',
        registration_date: new Date().toISOString()
      }
    };
    
    const response = makeSupabaseRequest('/auth/v1/signup', 'POST', payload);
    
    if (response.user) {
      // 認証メール送信
      sendVerificationEmail(response.user.email);
      
      console.log('会員登録完了:', response.user.id);
      return {
        success: true,
        userId: response.user.id,
        email: response.user.email,
        message: '会員登録が完了しました。認証メールをご確認ください。'
      };
    } else {
      throw new Error('会員登録に失敗しました');
    }
  } catch (error) {
    console.error('会員登録エラー:', error);
    throw error;
  }
}

/**
 * メール認証処理
 */
function verifyEmail(token) {
  try {
    const payload = {
      token: token,
      type: 'email'
    };
    
    const response = makeSupabaseRequest('/auth/v1/verify', 'POST', payload);
    
    if (response.user) {
      // 認証完了後の処理
      updateMemberStatus(response.user.id, 'verified');
      
      console.log('メール認証完了:', response.user.id);
      return {
        success: true,
        userId: response.user.id,
        message: 'メール認証が完了しました。ログインできます。'
      };
    } else {
      throw new Error('メール認証に失敗しました');
    }
  } catch (error) {
    console.error('メール認証エラー:', error);
    throw error;
  }
}

/**
 * ログイン処理
 */
function loginMember(email, password) {
  try {
    const payload = {
      email: email,
      password: password
    };
    
    const response = makeSupabaseRequest('/auth/v1/token?grant_type=password', 'POST', payload);
    
    if (response.access_token) {
      // セッション情報を保存
      saveSessionInfo(response);
      
      console.log('ログイン成功:', response.user.id);
      return {
        success: true,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user: response.user,
        message: 'ログインが完了しました。'
      };
    } else {
      throw new Error('ログインに失敗しました');
    }
  } catch (error) {
    console.error('ログインエラー:', error);
    throw error;
  }
}

/**
 * ログアウト処理
 */
function logoutMember(accessToken) {
  try {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'apikey': SUPABASE_CONFIG.API_KEY
    };
    
    const response = makeSupabaseRequest('/auth/v1/logout', 'POST', {}, headers);
    
    // セッション情報を削除
    clearSessionInfo();
    
    console.log('ログアウト完了');
    return {
      success: true,
      message: 'ログアウトが完了しました。'
    };
  } catch (error) {
    console.error('ログアウトエラー:', error);
    throw error;
  }
}

/**
 * 会員情報取得
 */
function getMemberInfo(accessToken) {
  try {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'apikey': SUPABASE_CONFIG.API_KEY
    };
    
    const response = makeSupabaseRequest('/auth/v1/user', 'GET', {}, headers);
    
    if (response) {
      console.log('会員情報取得完了');
      return {
        success: true,
        user: response,
        message: '会員情報を取得しました。'
      };
    } else {
      throw new Error('会員情報の取得に失敗しました');
    }
  } catch (error) {
    console.error('会員情報取得エラー:', error);
    throw error;
  }
}

/**
 * 会員情報更新
 */
function updateMemberInfo(accessToken, updateData) {
  try {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'apikey': SUPABASE_CONFIG.API_KEY
    };
    
    const payload = {
      data: updateData
    };
    
    const response = makeSupabaseRequest('/auth/v1/user', 'PUT', payload, headers);
    
    if (response) {
      console.log('会員情報更新完了');
      return {
        success: true,
        user: response,
        message: '会員情報を更新しました。'
      };
    } else {
      throw new Error('会員情報の更新に失敗しました');
    }
  } catch (error) {
    console.error('会員情報更新エラー:', error);
    throw error;
  }
}

/**
 * パスワードリセット
 */
function resetPassword(email) {
  try {
    const payload = {
      email: email
    };
    
    const response = makeSupabaseRequest('/auth/v1/recover', 'POST', payload);
    
    console.log('パスワードリセットメール送信完了');
    return {
      success: true,
      message: 'パスワードリセットメールを送信しました。'
    };
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    throw error;
  }
}

/**
 * 会員ステータス更新
 */
function updateMemberStatus(userId, status) {
  try {
    const payload = {
      user_id: userId,
      status: status,
      updated_at: new Date().toISOString()
    };
    
    // 会員ステータスをデータベースに保存
    saveMemberStatus(payload);
    
    console.log('会員ステータス更新完了:', userId, status);
    return {
      success: true,
      message: '会員ステータスを更新しました。'
    };
  } catch (error) {
    console.error('会員ステータス更新エラー:', error);
    throw error;
  }
}

/**
 * Supabase APIリクエスト
 */
function makeSupabaseRequest(endpoint, method, payload = {}, headers = {}) {
  try {
    const url = SUPABASE_CONFIG.URL + endpoint;
    
    const defaultHeaders = {
      'apikey': SUPABASE_CONFIG.API_KEY,
      'Content-Type': 'application/json'
    };
    
    const finalHeaders = { ...defaultHeaders, ...headers };
    
    const options = {
      method: method,
      headers: finalHeaders
    };
    
    if (method !== 'GET' && Object.keys(payload).length > 0) {
      options.payload = JSON.stringify(payload);
    }
    
    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() >= 400) {
      throw new Error(`API Error: ${responseData.message || 'Unknown error'}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Supabase APIリクエストエラー:', error);
    throw error;
  }
}

/**
 * セッション情報の保存
 */
function saveSessionInfo(sessionData) {
  try {
    const sessionInfo = {
      accessToken: sessionData.access_token,
      refreshToken: sessionData.refresh_token,
      userId: sessionData.user.id,
      email: sessionData.user.email,
      expiresAt: new Date(Date.now() + (sessionData.expires_in * 1000)).toISOString()
    };
    
    PropertiesService.getScriptProperties().setProperty('SESSION_INFO', JSON.stringify(sessionInfo));
    console.log('セッション情報保存完了');
  } catch (error) {
    console.error('セッション情報保存エラー:', error);
  }
}

/**
 * セッション情報の取得
 */
function getSessionInfo() {
  try {
    const sessionInfoStr = PropertiesService.getScriptProperties().getProperty('SESSION_INFO');
    if (sessionInfoStr) {
      return JSON.parse(sessionInfoStr);
    }
    return null;
  } catch (error) {
    console.error('セッション情報取得エラー:', error);
    return null;
  }
}

/**
 * セッション情報の削除
 */
function clearSessionInfo() {
  try {
    PropertiesService.getScriptProperties().deleteProperty('SESSION_INFO');
    console.log('セッション情報削除完了');
  } catch (error) {
    console.error('セッション情報削除エラー:', error);
  }
}

/**
 * 認証メール送信
 */
function sendVerificationEmail(email) {
  try {
    const subject = '【LIFESUPPORT(HK)】会員登録認証メール';
    const body = `
LIFESUPPORT(HK)LIMITED 会員登録認証

この度は、LIFESUPPORT(HK)LIMITEDの会員登録をお申し込みいただき、ありがとうございます。

以下のリンクをクリックして、メールアドレスの認証を完了してください。

認証リンク: ${SUPABASE_CONFIG.URL}/auth/v1/verify?token=VERIFICATION_TOKEN

認証完了後、アンケートシステムをご利用いただけます。

---
LIFESUPPORT(HK)LIMITED
No 163 Pan Chung, Tai Po, N.T.,HK
Tel: (852)52263586
Fax: (852)26530426
Website: https://lshk-ai-service.studio.site/
    `;
    
    GmailApp.sendEmail(email, subject, body);
    console.log('認証メール送信完了:', email);
  } catch (error) {
    console.error('認証メール送信エラー:', error);
  }
}

/**
 * 会員ステータスの保存
 */
function saveMemberStatus(statusData) {
  try {
    // 会員ステータスをスプレッドシートに保存
    const sheetId = PropertiesService.getScriptProperties().getProperty('MEMBER_SHEET_ID');
    if (sheetId) {
      let sheet = SpreadsheetApp.openById(sheetId).getSheetByName('会員ステータス');
      if (!sheet) {
        // シートが存在しない場合は作成
        sheet = SpreadsheetApp.openById(sheetId).insertSheet('会員ステータス');
        sheet.getRange(1, 1, 1, 4).setValues([['ユーザーID', 'ステータス', '更新日時', '備考']]);
      }
      
      sheet.appendRow([
        statusData.user_id,
        statusData.status,
        statusData.updated_at,
        'システム自動更新'
      ]);
    }
    
    console.log('会員ステータス保存完了');
  } catch (error) {
    console.error('会員ステータス保存エラー:', error);
  }
}

/**
 * 認証状態の確認
 */
function checkAuthenticationStatus(accessToken) {
  try {
    const sessionInfo = getSessionInfo();
    if (!sessionInfo) {
      return { authenticated: false, message: 'セッション情報がありません' };
    }
    
    // トークンの有効性を確認
    const userInfo = getMemberInfo(accessToken);
    if (userInfo.success) {
      return {
        authenticated: true,
        user: userInfo.user,
        message: '認証済みです'
      };
    } else {
      return { authenticated: false, message: '認証が無効です' };
    }
  } catch (error) {
    console.error('認証状態確認エラー:', error);
    return { authenticated: false, message: '認証確認に失敗しました' };
  }
}

/**
 * 会員登録フォームの作成
 */
function createMemberRegistrationForm() {
  try {
    const form = FormApp.create('LIFESUPPORT(HK) 会員登録');
    
    form.setTitle('LIFESUPPORT(HK) 会員登録')
         .setDescription('アンケートシステムをご利用いただくために、まず会員登録をお願いします。')
         .setConfirmationMessage('会員登録が完了しました。認証メールをご確認ください。')
         .setAllowResponseEdits(false)
         .setAcceptingResponses(true);
    
    // 会員登録フォームの質問項目
    form.addTextItem()
         .setTitle('お名前（フルネーム）')
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
    
    form.addTextItem()
         .setTitle('パスワード')
         .setRequired(true)
         .setHelpText('8文字以上のパスワードを設定してください');
    
    form.addCheckboxItem()
         .setTitle('利用規約・プライバシーポリシー')
         .setChoices([
           form.addCheckboxItem().createChoice('利用規約に同意します'),
           form.addCheckboxItem().createChoice('プライバシーポリシーに同意します')
         ])
         .setRequired(true);
    
    console.log('会員登録フォーム作成完了:', form.getPublishedUrl());
    return {
      formUrl: form.getPublishedUrl(),
      formId: form.getId(),
      message: '会員登録フォームが作成されました'
    };
  } catch (error) {
    console.error('会員登録フォーム作成エラー:', error);
    throw error;
  }
}
