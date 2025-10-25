# GitHub Pages認証システム実装手順

## 📋 概要

LIFESUPPORT(HK)認証システムをGitHub Pagesで構築する手順書です。Google Apps Scriptでは認証ページの制限があるため、GitHub Pagesを使用して制限なしの認証システムを構築します。

## 🎯 システム構成

- **認証ページ**: GitHub Pages（制限なし・高速・セキュア）
- **認証バックエンド**: Supabase
- **Google認証**: Supabase経由
- **リダイレクト先**: Google Apps Scriptアンケートフォーム

## 🚀 実装手順

### ステップ1: 認証ページHTMLの作成

#### 1.1 認証ページファイル作成
```bash
# プロジェクトディレクトリで実行
touch index.html
```

#### 1.2 認証ページの内容
`index.html`ファイルに以下の内容を記述：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LIFESUPPORT(HK) 会員認証</title>
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
    <!-- スタイルとJavaScriptコード -->
</head>
<body>
    <!-- 認証フォーム -->
</body>
</html>
```

**重要**: Google認証のリダイレクトURLは固定URLに設定
```javascript
const redirectUrl = encodeURIComponent('https://cantoneseslang.github.io/lifesupport-hk-auth/');
```

### ステップ2: GitHubリポジトリの作成

#### 2.1 GitHubでリポジトリ作成
1. [GitHub.com](https://github.com) にアクセス
2. 右上の「+」→「New repository」
3. リポジトリ名: `lifesupport-hk-auth`
4. 説明: `LIFESUPPORT(HK)認証システム - GitHub Pages版`
5. **Public** を選択
6. 「Create repository」をクリック

#### 2.2 ローカルGitリポジトリの初期化
```bash
# プロジェクトディレクトリで実行
git init
git add index.html
git commit -m "GitHub Pages認証システム - 初回コミット"
```

#### 2.3 リモートリポジトリの設定
```bash
# 作成したGitHubリポジトリのURLに置き換え
git remote add origin https://github.com/cantoneseslang/lifesupport-hk-auth.git
git push -u origin master
```

### ステップ3: GitHub Pagesの設定

#### 3.1 GitHub Pages有効化
1. GitHubリポジトリの「Settings」タブをクリック
2. 左サイドバーの「Pages」をクリック
3. Source を「Deploy from a branch」に設定
4. Branch を「master」に設定
5. 「Save」をクリック

#### 3.2 認証ページURLの確認
設定完了後、以下のURLで認証ページにアクセス可能：
```
https://cantoneseslang.github.io/lifesupport-hk-auth/
```

### ステップ4: Supabaseの設定

#### 4.1 Supabaseプロジェクトの設定
1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクト `ihviwvlptzalbrjktddf` を選択

#### 4.2 認証設定
**Authentication** → **URL Configuration** で以下を設定：

**Site URL:**
```
https://cantoneseslang.github.io/lifesupport-hk-auth/
```

**Redirect URLs:**
```
https://cantoneseslang.github.io/lifesupport-hk-auth/
https://cantoneseslang.github.io/lifesupport-hk-auth/index.html
https://cantoneseslang.github.io/lifesupport-hk-auth/#access_token=
```

#### 4.3 Google認証プロバイダーの設定
1. **Authentication** → **Providers** → **Google**
2. Google認証を有効化
3. Google OAuth設定を完了

### ステップ5: Google Apps Scriptの更新

#### 5.1 AuthUI.gsの更新
`AuthUI.gs`ファイルのリダイレクトURLを更新：

```javascript
// 修正前
const redirectUrl = encodeURIComponent('https://script.google.com/macros/s/...');

// 修正後
const redirectUrl = encodeURIComponent('https://cantoneseslang.github.io/lifesupport-hk-auth/');
```

#### 5.2 認証フローの統合
Google Apps ScriptからGitHub Pages認証ページにリダイレクトするように設定。

## 🔧 技術仕様

### 認証フロー
1. ユーザーがGitHub Pages認証ページにアクセス
2. Google認証ボタンをクリック
3. Supabase経由でGoogle認証を実行
4. 認証成功後、GitHub Pages認証ページにリダイレクト
5. 認証状態を確認後、Google Apps Scriptアンケートフォームにリダイレクト

### 使用技術
- **フロントエンド**: HTML5, CSS3, JavaScript
- **認証**: Supabase Auth
- **ホスティング**: GitHub Pages
- **OAuth**: Google OAuth 2.0

## ⚠️ 重要な注意事項

### Google Apps Scriptの制限
**Google Apps Scriptでは認証ページの制限があるため、GitHub Pagesを使用する必要があります。**

- GASのHtmlServiceには制限がある
- 認証フローの複雑さに対応できない
- パフォーマンスの制限
- セキュリティの制限

### GitHub Pagesの利点
- **制限なし**: アクセス制限がありません
- **高速**: CDN配信で高速アクセス
- **セキュア**: HTTPS自動対応
- **スケーラブル**: 大量アクセスに対応
- **無料**: 完全無料で利用可能

## 📋 設定ファイル一覧

### 1. index.html
- GitHub Pagesで公開される認証ページ
- Supabase認証クライアント
- Google認証フロー
- 美しいUIデザイン

### 2. AuthUI.gs
- Google Apps Scriptの認証処理
- GitHub Pagesへのリダイレクト設定
- 認証状態の管理

### 3. Supabase設定
- 認証プロバイダーの設定
- リダイレクトURLの設定
- セキュリティ設定

## 🚀 デプロイ手順

### 1. ファイルの更新
```bash
# ファイルを編集後
git add .
git commit -m "認証システムの更新"
git push origin master
```

### 2. GitHub Pagesの自動デプロイ
- ファイルをプッシュすると自動でGitHub Pagesが更新される
- 数分で変更が反映される

### 3. 認証のテスト
1. 認証ページにアクセス
2. Google認証をテスト
3. リダイレクトフローを確認

## 🔍 トラブルシューティング

### よくある問題

#### 1. 認証ページが表示されない
- GitHub Pagesの設定を確認
- ブランチが正しく設定されているか確認

#### 2. Google認証が動作しない
- SupabaseのリダイレクトURL設定を確認
- Google OAuth設定を確認

#### 3. リダイレクトが正しく動作しない
- AuthUI.gsのリダイレクトURLを確認
- index.htmlのリダイレクトURLを確認

## 📊 システムの特徴

### パフォーマンス
- **高速**: CDN配信で高速アクセス
- **スケーラブル**: 大量アクセスに対応
- **可用性**: 99.9%の可用性

### セキュリティ
- **HTTPS**: 自動HTTPS対応
- **認証**: Supabase認証システム
- **OAuth**: Google OAuth 2.0

### コスト
- **完全無料**: GitHub Pages + Supabase無料プラン
- **制限なし**: アクセス制限なし
- **スケーラブル**: 必要に応じて拡張可能

## 🎯 まとめ

GitHub Pages認証システムにより、制限なしの高速認証システムを構築しました。Google Apps Scriptの制限を回避し、より柔軟でスケーラブルな認証システムを実現しています。

### 完成したシステム
- ✅ GitHub Pages認証ページ
- ✅ Supabase認証バックエンド
- ✅ Google認証統合
- ✅ 自動リダイレクト
- ✅ セキュアな認証フロー

このシステムにより、LIFESUPPORT(HK)の認証システムが完全に動作します。

