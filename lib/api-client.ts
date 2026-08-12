export interface ApiErrorBody {
  error: string
  code?: string
  details?: unknown
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiRequestError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  let data: unknown

  try {
    data = await response.json()
  } catch {
    if (!response.ok) {
      throw new ApiRequestError('Request failed', response.status)
    }
    throw new ApiRequestError('Invalid response from server', response.status)
  }

  if (!response.ok) {
    const errorBody = data as ApiErrorBody
    throw new ApiRequestError(
      errorBody.error || 'Request failed',
      response.status,
      errorBody.code,
      errorBody.details,
    )
  }

  return data as T
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)
  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  })

  return parseApiResponse<T>(response)
}
