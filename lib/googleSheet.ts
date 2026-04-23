export const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzljLZjePg4oQxXzkk-75uz5Ll-tL0a-U_85hEF9a3hgpBqrmoEX4vo7rvImedIFQi0/exec";

export interface RankingData {
  name: string;
  finishtime: string; // "M분 S초"
  timestamp?: string;
  score?: number; // Optional, user didn't explicitly ask for it in the final data but good to have
}

export async function getRankings(): Promise<RankingData[]> {
  try {
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'GET',
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch rankings');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return [];
  }
}

export async function submitScore(data: RankingData): Promise<boolean> {
  try {
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toLocaleString('ko-KR')
      }),
    });
    return true;
  } catch (error) {
    console.error('Error submitting score:', error);
    return false;
  }
}
