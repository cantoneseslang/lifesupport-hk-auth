# Googleアンケート自動集計・自動送信システム（セキュア版）

## システム概要

LIFESUPPORT(HK)LIMITED向けのセキュアなGoogleアンケート自動集計・自動送信システムです。Supabase認証による会員登録・ログイン機能を備え、認証済みユーザーのみがアクセス可能なアンケートシステムです。Googleフォームで収集したアンケート回答を自動でGoogleシートに集計し、PDF変換してメール送信するシステムです。

## 会社情報

- **会社名**: LIFESUPPORT(HK)LIMITED
- **住所**: No 163 Pan Chung, Tai Po, N.T.,HK
- **電話**: (852)52263586
- **FAX**: (852)26530426
- **Website**: https://lshk-ai-service.studio.site/

## Google情報

- **プロジェクト名**: cantonese-katakana
- **プロジェクト番号**: 451113233741
- **プロジェクトID**: cantonese-katakana
- **API Key**: AIzaSyDPC_1nrpJ6_sUULF5zwKEVcbrvH92YDms
- **サービスアカウント**: id-351@cantonese-katakana.iam.gserviceaccount.com
- **JSONキーファイル**: cantonese-katakana-5155a818b800.json

## セキュアシステムワークフロー

```mermaid
graph TD
    A[会員登録] --> B[メール認証]
    B --> C[ログイン]
    C --> D[認証トークン取得]
    D --> E[セキュアアンケートフォーム]
    E --> F[認証済み回答受信]
    F --> G[セキュリティ検証]
    G --> H[Googleシートに自動登録]
    H --> I[通知メール送信]
    I --> J[シートデータマッピング]
    J --> K[シート自動完成]
    K --> L[PDF変換]
    L --> M[メール添付送信]
    
    N[Supabase認証] --> A
    O[MCP連携] --> G
    P[セキュリティレベル判定] --> H
```

## 主要機能

### 1. セキュア認証機能
- **Supabase認証システム**: 会員登録・ログイン・メール認証
- **Google Apps Script (GAS)**: メイン処理エンジン
- **MCP Supabase連携**: データベース操作
- **セッション管理**: トークンベース認証

### 2. 会員管理機能
- **会員登録**: メールアドレス・パスワード認証
- **メール認証**: 登録後の認証メール送信
- **ログインシステム**: セキュアなログイン機能
- **会員情報管理**: プロフィール更新・管理

### 3. セキュアアンケート機能
- **認証済みアンケート**: ログイン必須のアンケート
- **セキュリティ検証**: トークン・会員ID検証
- **セキュリティレベル判定**: 回答内容に基づくレベル設定
- **データ保護**: 個人情報の適切な取り扱い

### 4. データ処理機能
- **PDFフォーマット連携**: format-hk1.pdfに基づく設計
- **自動データマッピング**: 回答データの自動整理
- **シート自動完成**: 入力データの自動補完
- **統計情報生成**: 回答データの分析・集計

### 5. 通知・出力機能
- **自動メール通知**: 回答受信時の即座通知
- **PDF変換**: セキュアなPDF生成
- **メール添付送信**: 認証済みメール送信
- **送信先**: bestinksalesman@gmail.com

## 技術スタック

### フロントエンド・認証
- **Supabase**: 認証・データベース管理
- **Supabase Auth**: 会員認証・セッション管理
- **MCP Supabase**: データベース操作連携

### Google Apps Script
- **Google Apps Script**: メイン処理エンジン
- **Google Forms API**: フォーム作成・管理
- **Google Sheets API**: スプレッドシート操作
- **Gmail API**: メール送信機能
- **Google Drive API**: ファイル管理

### セキュリティ
- **JWT認証**: トークンベース認証
- **メール認証**: 二段階認証
- **データ暗号化**: 個人情報保護
- **セッション管理**: セキュアなセッション制御

## 設定手順

### 1. Google Apps Scriptプロジェクト作成
1. [Google Apps Script](https://script.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名を「Googleアンケート自動集計システム」に設定

### 2. 認証設定
1. サービスアカウントJSONキーファイルをアップロード
2. 必要なAPIを有効化：
   - Google Forms API
   - Google Sheets API
   - Gmail API
   - Google Drive API

### 3. コード実装
1. `Code.gs`ファイルにメインコードを配置
2. 設定値を実際の値に更新
3. トリガーを設定

### 4. テスト・デプロイ
1. フォーム作成機能のテスト
2. 自動処理のテスト
3. メール送信のテスト
4. 本番環境へのデプロイ

## ファイル構成

```
/Users/sakonhiroki/Googleアンケート自動集計自動送信/
├── README.md                                    # システム概要・ワークフロー
├── Code.gs                                      # メイン処理コード
├── SupabaseAuth.gs                             # Supabase認証システム
├── SecureSurvey.gs                             # セキュアアンケート機能
├── SheetMapping.gs                             # シートマッピング機能
├── PDFExport.gs                                # PDF変換・メール送信機能
├── SystemIntegration.gs                        # システム統合機能
├── MCPIntegration.gs                          # MCP Supabase連携
├── appsscript.json                             # GAS設定ファイル
├── cantonese-katakana-5155a818b800.json        # サービスアカウント認証ファイル
├── format-hk1.pdf                              # PDFフォーマット参照ファイル
├── 設定手順.md                                  # 詳細設定手順
├── デプロイ手順.md                              # デプロイ手順書
└── セキュリティ設定.md                          # セキュリティ設定ガイド
```

## 使用方法

### 初期設定
1. `setupSystem()`関数を実行してシステムを初期化
2. `createSurveyForm()`関数を実行してフォームを作成

### 自動処理
- 5分ごとに新しい回答をチェック
- 回答があった場合、自動でシートに登録
- 通知メールを送信

### 手動処理
- `manualExportAndEmail()`関数でPDFエクスポートとメール送信を実行

## 注意事項

- フォームIDとシートIDは実際の値に置き換える必要があります
- メール送信先アドレスを確認してください
- トリガーの設定は適切に行ってください

## トラブルシューティング

### よくある問題
1. **認証エラー**: JSONキーファイルのパスと内容を確認
2. **API制限**: Google APIの使用制限を確認
3. **メール送信エラー**: Gmail APIの権限を確認

### ログ確認
- Google Apps Scriptの実行ログを確認
- エラーメッセージを詳細に確認

## 更新履歴

- 2024年12月: 初版作成
- システム要件定義完了
- 基本機能実装完了
