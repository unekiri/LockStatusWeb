import { loadConfig } from "./config";

// APIの呼び出し
export async function getDataFromApi(endpoint: string): Promise<any> {
    try {
        const config = await loadConfig();
        const url = `${config.API_BASE_URL}${endpoint}`

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP通信エラー: ${response.status}`);
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API接続エラー', error);
        throw error;
    }
}