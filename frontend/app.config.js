module.exports = {
  name: "Guild 44 App",
  slug: "bolt-expo-nativewind",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.kanepion.guild44app"
  },
  android: {
    package: "com.kanepion.guild44app",
    adaptiveIcon: {
      foregroundImage: "./assets/images/icon.png",
      backgroundColor: "#ffffff"
    }
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router"
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    apiUrl: process.env.API_URL || "https://62az2hs957.execute-api.ap-northeast-1.amazonaws.com/prod/search",
    apiKey: process.env.API_KEY || "dSOovEKqYwgehvBr24g57tWpqJn1DfManBOt1WXd",
    eas: {
      projectId: "b862bf9e-2d66-47dc-9f4b-469e416a7628"
    }
  }
}; 