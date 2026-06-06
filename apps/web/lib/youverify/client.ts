type YouVerifyResponse = {
  success: boolean;
  confidence: number;
  message: string;
};

const STUB_CONFIDENCE_THRESHOLD = 85;
const STUB_MATCH_CONFIDENCE = 92;

function isConfigured(): boolean {
  return !!(process.env.YOUVERIFY_API_KEY && process.env.YOUVERIFY_BASE_URL);
}

export async function verifyNinWithFaceMatch(
  nin: string,
  faceImageBase64?: string,
): Promise<YouVerifyResponse> {
  if (isConfigured()) {
    const response = await fetch(
      `${process.env.YOUVERIFY_BASE_URL}/v2/api/biometrics/merchant/data/verification/nin-face-match`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-youverify-signature': process.env.YOUVERIFY_API_KEY!,
        },
        body: JSON.stringify({
          nin,
          faceImage: faceImageBase64,
        }),
      },
    );

    if (!response.ok) {
      console.error('YouVerify API error:', response.status, await response.text());
      return { success: false, confidence: 0, message: 'YouVerify service unavailable' };
    }

    const data = await response.json();
    return {
      success: data.confidence >= STUB_CONFIDENCE_THRESHOLD,
      confidence: data.confidence ?? 0,
      message: data.message ?? '',
    };
  }

  console.log(`[STUB] YouVerify NIN lookup for ${nin}: confidence 92%`);
  return {
    success: true,
    confidence: STUB_MATCH_CONFIDENCE,
    message: 'Identity verified (stub)',
  };
}
