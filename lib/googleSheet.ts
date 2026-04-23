export const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzljLZjePg4oQxXzkk-75uz5Ll-tL0a-U_85hEF9a3hgpBqrmoEX4vo7rvImedIFQi0/exec";

export interface RankingData {
  name: string;
  score: number;
  time: string;
  timestamp?: string;
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
      mode: 'no-cors', // Apps Script requires no-cors for POST sometimes or it returns 405/302
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    // With no-cors, we can't check response.ok, so we assume success if no error thrown
    return true;
  } catch (error) {
    console.error('Error submitting score:', error);
    return false;
  }
}
