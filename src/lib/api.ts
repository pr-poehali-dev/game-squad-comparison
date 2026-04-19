const URLS = {
  auth: 'https://functions.poehali.dev/23d99d84-1616-4b50-9313-b88ca1a4a272',
  unitsApi: 'https://functions.poehali.dev/1332b379-06bb-41c1-83f8-e8bc6369fd8e',
  treatiesApi: 'https://functions.poehali.dev/c9428367-4953-41ff-9034-681a2f9d5d89',
};

function getSessionId(): string {
  return localStorage.getItem('session_id') || '';
}

async function request(url: string, options: RequestInit = {}) {
  const sessionId = getSessionId();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId ? { 'X-Session-Id': sessionId } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

// Auth
export const authApi = {
  me: () => request(URLS.auth),
  register: (body: { username: string; email: string; password: string; confirmPassword: string }) =>
    request(URLS.auth, { method: 'POST', body: JSON.stringify({ action: 'register', ...body }) }),
  login: (body: { email: string; password: string }) =>
    request(URLS.auth, { method: 'POST', body: JSON.stringify({ action: 'login', ...body }) }),
  logout: () =>
    request(URLS.auth, { method: 'POST', body: JSON.stringify({ action: 'logout' }) }),
  forgotPassword: (email: string) =>
    request(URLS.auth, { method: 'POST', body: JSON.stringify({ action: 'forgot-password', email }) }),
  resetPassword: (token: string, password: string, confirmPassword: string) =>
    request(URLS.auth, { method: 'POST', body: JSON.stringify({ action: 'reset-password', token, password, confirmPassword }) }),
  makeAdmin: (secret: string) =>
    request(URLS.auth, { method: 'POST', body: JSON.stringify({ action: 'make-admin', secret }) }),
};

// Units
export const unitsApi = {
  list: () => request(URLS.unitsApi),
  get: (id: string) => request(`${URLS.unitsApi}/${id}`),
  create: (data: Record<string, unknown>) =>
    request(URLS.unitsApi, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`${URLS.unitsApi}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`${URLS.unitsApi}/${id}`, { method: 'DELETE' }),
};

// Treaties
export const treatiesApi = {
  list: () => request(URLS.treatiesApi),
  get: (id: string) => request(`${URLS.treatiesApi}/${id}`),
  create: (data: Record<string, unknown>) =>
    request(URLS.treatiesApi, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`${URLS.treatiesApi}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`${URLS.treatiesApi}/${id}`, { method: 'DELETE' }),
};
