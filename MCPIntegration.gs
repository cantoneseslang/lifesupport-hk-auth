/**
 * MCP Supabase連携機能
 * MCP経由でのSupabase操作とデータ管理
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

// MCP Supabase設定
const MCP_SUPABASE_CONFIG = {
  MCP_URL: 'https://mcp.supabase.com/mcp?project_ref=ihviwvlptzalbrjktddf',
  PROJECT_REF: 'ihviwvlptzalbrjktddf',
  API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlodml3dmxwdHphbGJyamt0ZGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDI1ODksImV4cCI6MjA3Njg3ODU4OX0.UjNdR4bOdaDmznucIZ5K-ZNMEDGPbVBAT5D40Mf-E60'
};

/**
 * MCP経由でSupabaseテーブルを作成
 */
function createSupabaseTablesViaMCP() {
  try {
    console.log('MCP経由でSupabaseテーブル作成開始');
    
    // 会員テーブルの作成
    const membersTable = createMembersTable();
    console.log('会員テーブル作成完了:', membersTable);
    
    // アンケート回答テーブルの作成
    const responsesTable = createResponsesTable();
    console.log('回答テーブル作成完了:', responsesTable);
    
    // セッションテーブルの作成
    const sessionsTable = createSessionsTable();
    console.log('セッションテーブル作成完了:', sessionsTable);
    
    // 統計テーブルの作成
    const statisticsTable = createStatisticsTable();
    console.log('統計テーブル作成完了:', statisticsTable);
    
    console.log('MCP経由Supabaseテーブル作成完了');
    return {
      success: true,
      tables: {
        members: membersTable,
        responses: responsesTable,
        sessions: sessionsTable,
        statistics: statisticsTable
      }
    };
  } catch (error) {
    console.error('MCP経由Supabaseテーブル作成エラー:', error);
    throw error;
  }
}

/**
 * 会員テーブルの作成
 */
function createMembersTable() {
  try {
    const tableSchema = {
      name: 'members',
      columns: [
        { name: 'id', type: 'uuid', primary_key: true, default: 'gen_random_uuid()' },
        { name: 'email', type: 'varchar', unique: true, not_null: true },
        { name: 'password_hash', type: 'varchar', not_null: true },
        { name: 'full_name', type: 'varchar', not_null: true },
        { name: 'company', type: 'varchar', not_null: true },
        { name: 'department', type: 'varchar' },
        { name: 'phone', type: 'varchar', not_null: true },
        { name: 'status', type: 'varchar', default: 'pending' },
        { name: 'email_verified', type: 'boolean', default: false },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
        { name: 'updated_at', type: 'timestamp', default: 'now()' },
        { name: 'last_login', type: 'timestamp' }
      ],
      indexes: [
        { name: 'idx_members_email', column: 'email' },
        { name: 'idx_members_status', column: 'status' }
      ]
    };
    
    const result = makeMCPRequest('create_table', tableSchema);
    console.log('会員テーブル作成完了');
    return result;
  } catch (error) {
    console.error('会員テーブル作成エラー:', error);
    throw error;
  }
}

/**
 * アンケート回答テーブルの作成
 */
function createResponsesTable() {
  try {
    const tableSchema = {
      name: 'survey_responses',
      columns: [
        { name: 'id', type: 'uuid', primary_key: true, default: 'gen_random_uuid()' },
        { name: 'member_id', type: 'uuid', foreign_key: 'members(id)', not_null: true },
        { name: 'response_id', type: 'varchar', unique: true, not_null: true },
        { name: 'auth_token', type: 'varchar', not_null: true },
        { name: 'full_name', type: 'varchar', not_null: true },
        { name: 'company', type: 'varchar', not_null: true },
        { name: 'department', type: 'varchar' },
        { name: 'phone', type: 'varchar', not_null: true },
        { name: 'email', type: 'varchar', not_null: true },
        { name: 'satisfaction', type: 'varchar', not_null: true },
        { name: 'services_used', type: 'text' },
        { name: 'recommendation_score', type: 'integer', check: 'recommendation_score >= 1 AND recommendation_score <= 10' },
        { name: 'comments', type: 'text' },
        { name: 'data_consent', type: 'varchar', not_null: true },
        { name: 'processing_status', type: 'varchar', default: 'pending' },
        { name: 'security_level', type: 'varchar', default: 'standard' },
        { name: 'pdf_generated_at', type: 'timestamp' },
        { name: 'email_sent_at', type: 'timestamp' },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
        { name: 'updated_at', type: 'timestamp', default: 'now()' }
      ],
      indexes: [
        { name: 'idx_responses_member_id', column: 'member_id' },
        { name: 'idx_responses_response_id', column: 'response_id' },
        { name: 'idx_responses_created_at', column: 'created_at' }
      ]
    };
    
    const result = makeMCPRequest('create_table', tableSchema);
    console.log('回答テーブル作成完了');
    return result;
  } catch (error) {
    console.error('回答テーブル作成エラー:', error);
    throw error;
  }
}

/**
 * セッションテーブルの作成
 */
function createSessionsTable() {
  try {
    const tableSchema = {
      name: 'user_sessions',
      columns: [
        { name: 'id', type: 'uuid', primary_key: true, default: 'gen_random_uuid()' },
        { name: 'member_id', type: 'uuid', foreign_key: 'members(id)', not_null: true },
        { name: 'access_token', type: 'varchar', unique: true, not_null: true },
        { name: 'refresh_token', type: 'varchar', unique: true, not_null: true },
        { name: 'expires_at', type: 'timestamp', not_null: true },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
        { name: 'last_accessed', type: 'timestamp', default: 'now()' }
      ],
      indexes: [
        { name: 'idx_sessions_member_id', column: 'member_id' },
        { name: 'idx_sessions_access_token', column: 'access_token' },
        { name: 'idx_sessions_expires_at', column: 'expires_at' }
      ]
    };
    
    const result = makeMCPRequest('create_table', tableSchema);
    console.log('セッションテーブル作成完了');
    return result;
  } catch (error) {
    console.error('セッションテーブル作成エラー:', error);
    throw error;
  }
}

/**
 * 統計テーブルの作成
 */
function createStatisticsTable() {
  try {
    const tableSchema = {
      name: 'survey_statistics',
      columns: [
        { name: 'id', type: 'uuid', primary_key: true, default: 'gen_random_uuid()' },
        { name: 'date', type: 'date', not_null: true },
        { name: 'total_responses', type: 'integer', default: 0 },
        { name: 'satisfaction_stats', type: 'jsonb' },
        { name: 'service_usage_stats', type: 'jsonb' },
        { name: 'average_recommendation', type: 'decimal' },
        { name: 'security_level_stats', type: 'jsonb' },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
        { name: 'updated_at', type: 'timestamp', default: 'now()' }
      ],
      indexes: [
        { name: 'idx_statistics_date', column: 'date' }
      ]
    };
    
    const result = makeMCPRequest('create_table', tableSchema);
    console.log('統計テーブル作成完了');
    return result;
  } catch (error) {
    console.error('統計テーブル作成エラー:', error);
    throw error;
  }
}

/**
 * MCP経由でデータを挿入
 */
function insertDataViaMCP(tableName, data) {
  try {
    const payload = {
      table: tableName,
      data: data
    };
    
    const result = makeMCPRequest('insert_data', payload);
    console.log(`MCP経由データ挿入完了: ${tableName}`);
    return result;
  } catch (error) {
    console.error(`MCP経由データ挿入エラー: ${tableName}`, error);
    throw error;
  }
}

/**
 * MCP経由でデータを取得
 */
function selectDataViaMCP(tableName, conditions = {}) {
  try {
    const payload = {
      table: tableName,
      conditions: conditions
    };
    
    const result = makeMCPRequest('select_data', payload);
    console.log(`MCP経由データ取得完了: ${tableName}`);
    return result;
  } catch (error) {
    console.error(`MCP経由データ取得エラー: ${tableName}`, error);
    throw error;
  }
}

/**
 * MCP経由でデータを更新
 */
function updateDataViaMCP(tableName, data, conditions) {
  try {
    const payload = {
      table: tableName,
      data: data,
      conditions: conditions
    };
    
    const result = makeMCPRequest('update_data', payload);
    console.log(`MCP経由データ更新完了: ${tableName}`);
    return result;
  } catch (error) {
    console.error(`MCP経由データ更新エラー: ${tableName}`, error);
    throw error;
  }
}

/**
 * MCP経由でデータを削除
 */
function deleteDataViaMCP(tableName, conditions) {
  try {
    const payload = {
      table: tableName,
      conditions: conditions
    };
    
    const result = makeMCPRequest('delete_data', payload);
    console.log(`MCP経由データ削除完了: ${tableName}`);
    return result;
  } catch (error) {
    console.error(`MCP経由データ削除エラー: ${tableName}`, error);
    throw error;
  }
}

/**
 * MCPリクエストの実行
 */
function makeMCPRequest(action, payload) {
  try {
    const url = MCP_SUPABASE_CONFIG.MCP_URL;
    
    const requestData = {
      action: action,
      project_ref: MCP_SUPABASE_CONFIG.PROJECT_REF,
      api_key: MCP_SUPABASE_CONFIG.API_KEY,
      payload: payload
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_SUPABASE_CONFIG.API_KEY}`
      },
      payload: JSON.stringify(requestData)
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() >= 400) {
      throw new Error(`MCP Error: ${responseData.message || 'Unknown error'}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('MCPリクエストエラー:', error);
    throw error;
  }
}

/**
 * 会員データの同期
 */
function syncMemberDataToSupabase(memberData) {
  try {
    const supabaseData = {
      email: memberData.email,
      full_name: memberData.fullName,
      company: memberData.company,
      department: memberData.department || '',
      phone: memberData.phone,
      status: 'verified',
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const result = insertDataViaMCP('members', supabaseData);
    console.log('会員データ同期完了');
    return result;
  } catch (error) {
    console.error('会員データ同期エラー:', error);
    throw error;
  }
}

/**
 * アンケート回答データの同期
 */
function syncResponseDataToSupabase(responseData) {
  try {
    const supabaseData = {
      member_id: responseData.memberId,
      response_id: responseData.responseId,
      auth_token: responseData.authToken,
      full_name: responseData.fullName,
      company: responseData.company,
      department: responseData.department || '',
      phone: responseData.phone,
      email: responseData.email,
      satisfaction: responseData.satisfaction,
      services_used: responseData.servicesUsed,
      recommendation_score: parseInt(responseData.recommendationScore),
      comments: responseData.comments || '',
      data_consent: responseData.dataConsent,
      processing_status: 'pending',
      security_level: responseData.securityLevel || 'standard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const result = insertDataViaMCP('survey_responses', supabaseData);
    console.log('回答データ同期完了');
    return result;
  } catch (error) {
    console.error('回答データ同期エラー:', error);
    throw error;
  }
}

/**
 * セッションデータの同期
 */
function syncSessionDataToSupabase(sessionData) {
  try {
    const supabaseData = {
      member_id: sessionData.memberId,
      access_token: sessionData.accessToken,
      refresh_token: sessionData.refreshToken,
      expires_at: sessionData.expiresAt,
      is_active: true,
      created_at: new Date().toISOString(),
      last_accessed: new Date().toISOString()
    };
    
    const result = insertDataViaMCP('user_sessions', supabaseData);
    console.log('セッションデータ同期完了');
    return result;
  } catch (error) {
    console.error('セッションデータ同期エラー:', error);
    throw error;
  }
}

/**
 * 統計データの更新
 */
function updateStatisticsViaMCP(date, statistics) {
  try {
    const supabaseData = {
      date: date,
      total_responses: statistics.totalResponses,
      satisfaction_stats: JSON.stringify(statistics.satisfactionStats),
      service_usage_stats: JSON.stringify(statistics.serviceUsageStats),
      average_recommendation: statistics.averageRecommendation,
      security_level_stats: JSON.stringify(statistics.securityLevelStats),
      updated_at: new Date().toISOString()
    };
    
    const result = insertDataViaMCP('survey_statistics', supabaseData);
    console.log('統計データ更新完了');
    return result;
  } catch (error) {
    console.error('統計データ更新エラー:', error);
    throw error;
  }
}

/**
 * データベースの初期化
 */
function initializeSupabaseDatabase() {
  try {
    console.log('Supabaseデータベース初期化開始');
    
    // テーブル作成
    const tablesResult = createSupabaseTablesViaMCP();
    console.log('テーブル作成完了:', tablesResult);
    
    // 初期データの挿入
    const initialData = {
      members: [],
      responses: [],
      sessions: [],
      statistics: []
    };
    
    console.log('Supabaseデータベース初期化完了');
    return {
      success: true,
      tables: tablesResult.tables,
      initialData: initialData
    };
  } catch (error) {
    console.error('Supabaseデータベース初期化エラー:', error);
    throw error;
  }
}

/**
 * データベースの状態確認
 */
function checkSupabaseDatabaseStatus() {
  try {
    const status = {
      timestamp: new Date(),
      tables: {},
      connection: false,
      errors: []
    };
    
    // 各テーブルの存在確認
    const tables = ['members', 'survey_responses', 'user_sessions', 'survey_statistics'];
    
    for (const table of tables) {
      try {
        const result = selectDataViaMCP(table, { limit: 1 });
        status.tables[table] = { exists: true, accessible: true };
      } catch (error) {
        status.tables[table] = { exists: false, accessible: false, error: error.message };
        status.errors.push(`Table ${table}: ${error.message}`);
      }
    }
    
    // 接続状態の確認
    status.connection = status.errors.length === 0;
    
    console.log('Supabaseデータベース状態確認完了');
    return status;
  } catch (error) {
    console.error('Supabaseデータベース状態確認エラー:', error);
    return {
      timestamp: new Date(),
      connection: false,
      error: error.message
    };
  }
}
