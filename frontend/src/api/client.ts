const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export class ApiClientError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
      },
    });
  } catch {
    throw new ApiClientError(0, 'Unable to connect to the server. Please check your connection.');
  }

  if (!response.ok) {
    let detail = 'Something went wrong. Please try again later.';

    try {
      const body = await response.json();
      if (body.detail) {
        detail = getHumanReadableError(response.status, body.detail);
      }
    } catch {
      // use default detail
    }

    throw new ApiClientError(response.status, detail);
  }

  return response.json() as Promise<T>;
}

function getHumanReadableError(status: number, serverDetail: string): string {
  switch (status) {
    case 400:
      return serverDetail.includes('audio') || serverDetail.includes('format')
        ? 'Invalid file. Please upload a supported audio format (.mp3, .wav, .m4a, .webm).'
        : serverDetail;
    case 404:
      return 'Meeting not found.';
    case 413:
      return 'The audio file is too large. Maximum size is 100 MB.';
    case 500:
      return 'Something went wrong while processing your request. Please try again.';
    default:
      return serverDetail;
  }
}
