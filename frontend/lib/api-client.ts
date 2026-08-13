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

type UnauthorizedHandler = () => void | Promise<void>

let unauthorizedHandler: UnauthorizedHandler | null = null
let authRedirectInProgress = false

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler
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

async function handleUnauthorized(error: ApiRequestError) {
  if (authRedirectInProgress) return
  if (typeof window === 'undefined') return

  const path = window.location.pathname
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].some(
    (route) => path === route || path.startsWith(`${route}/`),
  )
  if (isAuthPage) return

  authRedirectInProgress = true
  try {
    await unauthorizedHandler?.()
  } catch {
    // Continue with redirect even if cleanup fails
  }

  const loginUrl = new URL('/login', window.location.origin)
  loginUrl.searchParams.set('expired', '1')
  window.location.replace(loginUrl.toString())
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

  try {
    return await parseApiResponse<T>(response)
  } catch (error) {
    if (
      error instanceof ApiRequestError &&
      error.status === 401 &&
      (error.code === 'AUTHENTICATION_REQUIRED' || !error.code)
    ) {
      await handleUnauthorized(error)
    }
    throw error
  }
}
