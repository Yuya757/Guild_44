FROM node:18

WORKDIR /app

# グローバル依存関係のインストール
RUN npm install -g expo-cli @expo/metro-runtime

# パッケージファイルをコピー
COPY ./frontend/package*.json ./

# 依存関係のインストール
RUN npm install

# プロジェクトファイルをコピー
COPY ./frontend/ .

# ポートの公開
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002
EXPOSE 8081

# コマンドの実行
CMD ["npm", "run", "dev"] 