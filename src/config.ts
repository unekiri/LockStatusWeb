type ConfigType = {
    API_BASE_URL: string;
}

// 設定ファイルの読み込み
export async function loadConfig(): Promise<ConfigType> {
    try {
        const response = await fetch('/config.json');
        const config = await response.json();
        return config;
    } catch (error) {
        console.error("設定ファイルの読み込みに失敗しました:", error);
        return {API_BASE_URL: ""};
    }
}