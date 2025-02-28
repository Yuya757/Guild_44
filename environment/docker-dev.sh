#!/bin/bash

# デフォルトアクション
action=${1:-start}

# プロジェクトルートディレクトリを設定
project_root="$(dirname "$(dirname "$(readlink -f "$0")")")"
cd "$project_root"

# ヘルプメッセージを表示する関数
show_help() {
    echo -e "\e[36m使用法: ./environment/docker-dev.sh [アクション]\e[0m"
    echo -e "\e[36mアクション:\e[0m"
    echo -e "\e[33m  start   - 開発環境を起動します（デフォルト）\e[0m"
    echo -e "\e[33m  stop    - 開発環境を停止します\e[0m"
    echo -e "\e[33m  rebuild - 開発環境を再ビルドします\e[0m"
    echo -e "\e[33m  web     - Web版をビルドします\e[0m"
    echo -e "\e[33m  logs    - コンテナのログを表示します\e[0m"
    echo -e "\e[33m  clean   - 未使用のDockerリソースをクリーンアップします\e[0m"
    echo -e "\e[33m  shell   - コンテナのシェルに接続します\e[0m"
    echo -e "\e[33m  help    - このヘルプメッセージを表示します\e[0m"
}

# 開発環境を起動する関数
start_dev_environment() {
    echo -e "\e[36mDockerコンテナを起動しています...\e[0m"
    docker-compose -f ./environment/docker-compose.yml up -d expo-app
    echo -e "\e[32mExpoアプリは http://localhost:19002 でアクセスできます\e[0m"
    
    # ログを表示するかどうか尋ねる
    read -p "コンテナのログを表示しますか？ (y/n): " show_logs
    if [ "$show_logs" = "y" ]; then
        docker-compose -f ./environment/docker-compose.yml logs -f expo-app
    fi
}

# 開発環境を停止する関数
stop_dev_environment() {
    echo -e "\e[36mDockerコンテナを停止しています...\e[0m"
    docker-compose -f ./environment/docker-compose.yml down
    echo -e "\e[32m開発環境を停止しました\e[0m"
}

# 開発環境を再ビルドする関数
rebuild_dev_environment() {
    echo -e "\e[36mDockerイメージを再ビルドしています...\e[0m"
    docker-compose -f ./environment/docker-compose.yml build --no-cache expo-app
    echo -e "\e[32m再ビルドが完了しました\e[0m"
    
    # 起動するかどうか尋ねる
    read -p "環境を今すぐ起動しますか？ (y/n): " start_after_rebuild
    if [ "$start_after_rebuild" = "y" ]; then
        start_dev_environment
    fi
}

# Web版をビルドする関数
build_web_version() {
    echo -e "\e[36mWeb版をビルドしています...\e[0m"
    docker-compose -f ./environment/docker-compose.yml run --rm web-build
    echo -e "\e[32mビルドが完了しました。frontend/distディレクトリをチェックしてください\e[0m"
}

# コンテナのログを表示する関数
show_logs() {
    echo -e "\e[36mコンテナのログを表示しています...\e[0m"
    docker-compose -f ./environment/docker-compose.yml logs -f expo-app
}

# コンテナのシェルに接続する関数
connect_shell() {
    echo -e "\e[36mコンテナのシェルに接続しています...\e[0m"
    docker-compose -f ./environment/docker-compose.yml exec expo-app bash
}

# Dockerリソースをクリーンアップする関数
clean_docker_resources() {
    echo -e "\e[36m未使用のDockerリソースをクリーンアップしています...\e[0m"
    docker system prune -f
    echo -e "\e[32mクリーンアップが完了しました\e[0m"
}

# アクションに基づいて適切な関数を実行
case "$action" in
    start)
        start_dev_environment
        ;;
    stop)
        stop_dev_environment
        ;;
    rebuild)
        rebuild_dev_environment
        ;;
    web)
        build_web_version
        ;;
    logs)
        show_logs
        ;;
    shell)
        connect_shell
        ;;
    clean)
        clean_docker_resources
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "\e[31m不明なアクション: $action\e[0m"
        show_help
        ;;
esac 