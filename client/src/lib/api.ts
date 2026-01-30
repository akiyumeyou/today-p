import { getLiffUserId, isInLiff } from './liff';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '';

export type MoodType = 'happy' | 'normal' | 'sad';

export interface MoodSubmitResponse {
  success: boolean;
  message?: string;
}

export async function submitMood(mood: MoodType): Promise<MoodSubmitResponse> {
  // API未設定またはLIFF外からのアクセス時はスキップ
  if (!API_ENDPOINT) {
    console.log('API endpoint not set, skipping');
    return { success: true, message: 'skipped' };
  }

  const liffUserId = getLiffUserId();

  try {
    const response = await fetch(`${API_ENDPOINT}/mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mood,
        liff_user_id: liffUserId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to submit mood:', error);
    return { success: false, message: 'error' };
  }
}
