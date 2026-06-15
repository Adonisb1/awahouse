type DojahNinResponse = {
  success: boolean;
  message: string;
  entity?: {
    nin: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    photo?: string;
    birthDate?: string;
    gender?: string;
    address?: string;
  };
};

function isConfigured(): boolean {
  return !!(
    process.env.DOJAH_APP_ID &&
    process.env.DOJAH_API_KEY
  );
}

export async function verifyNin(
  nin: string,
): Promise<DojahNinResponse> {
  if (isConfigured()) {
    const baseUrl = process.env.DOJAH_BASE_URL ?? 'https://api.dojah.io';
    const url = new URL(`${baseUrl}/api/v1/kyc/nin`);
    url.searchParams.set('nin', nin);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        AppId: process.env.DOJAH_APP_ID!,
        Authorization: process.env.DOJAH_API_KEY!,
      },
    });

    if (!response.ok) {
      console.error('Dojah API error:', response.status, await response.text());
      return { success: false, message: 'NIN lookup service unavailable' };
    }

    const data = await response.json();

    if (data.entity) {
      return {
        success: true,
        message: 'NIN verified successfully',
        entity: {
          nin: data.entity.nin,
          firstName: data.entity.first_name ?? data.entity.firstName,
          lastName: data.entity.last_name ?? data.entity.lastName,
          phoneNumber: data.entity.phone_number ?? data.entity.phoneNumber,
          birthDate: data.entity.date_of_birth ?? data.entity.birthDate,
          gender: data.entity.gender,
          address: data.entity.address,
        },
      };
    }

    return { success: false, message: data.error?.message ?? data.message ?? 'NIN not found' };
  }

  throw new Error('Dojah is not configured. Set DOJAH_APP_ID and DOJAH_API_KEY.');
}
