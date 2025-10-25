#!/bin/bash

# GitHubとGoogle Apps Scriptの同期スクリプト
# 使用方法: ./sync.sh "コミットメッセージ"

echo "🚀 GitHubとGASの同期を開始します..."

# 引数チェック
if [ -z "$1" ]; then
    echo "❌ エラー: コミットメッセージを指定してください"
    echo "使用方法: ./sync.sh \"コミットメッセージ\""
    exit 1
fi

COMMIT_MSG="$1"

# 1. GitHubにプッシュ
echo "📤 GitHubにプッシュ中..."
git add .
git commit -m "$COMMIT_MSG"
git push origin master

if [ $? -eq 0 ]; then
    echo "✅ GitHubプッシュ完了"
else
    echo "❌ GitHubプッシュ失敗"
    exit 1
fi

# 2. Google Apps Scriptにプッシュ
echo "📤 Google Apps Scriptにプッシュ中..."
clasp push

if [ $? -eq 0 ]; then
    echo "✅ GASプッシュ完了"
else
    echo "❌ GASプッシュ失敗"
    exit 1
fi

echo "🎉 同期完了！"
echo "GitHub: https://github.com/your-repo"
echo "GAS: https://script.google.com/home/projects/158F4RPxQ4FIsSP2bWfeIMm2625oU01DDsRDnHk_VmOC5bjNHTgWhvXU0/edit"
