import { getDataFromApi } from './httpService';

async function loadData() {
  try {
    const data = await getDataFromApi("/message");
    console.log('APIから受け取ったデータ:', data);

    const resultDiv = document.getElementById('result');
    if (resultDiv) {
      resultDiv.innerText = JSON.stringify(data.message, null, 2);
    }
  } catch (error) {
    console.error('データ取得失敗:', error);

    const resultDiv = document.getElementById('result');
    if (resultDiv) resultDiv.innerText = 'データ取得に失敗しました。'
  }
}

loadData();