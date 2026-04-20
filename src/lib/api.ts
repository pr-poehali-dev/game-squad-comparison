const URLS = {
  auth: 'https://functions.poehali.dev/23d99d84-1616-4b50-9313-b88ca1a4a272',
  unitsApi: 'https://functions.poehali.dev/1332b379-06bb-41c1-83f8-e8bc6369fd8e',
  treatiesApi: 'https://functions.poehali.dev/c9428367-4953-41ff-9034-681a2f9d5d89',
  seed: 'https://functions.poehali.dev/95ab29ef-b38b-4e5b-9578-0456fb855829',
  upload: 'https://functions.poehali.dev/26151075-4ef3-4b29-8d16-c82a04dd0e83',
  forum: 'https://functions.poehali.dev/914f3bd8-b9e4-4dfa-b16a-e3dda3710d6e',
  battle: 'https://functions.poehali.dev/e55b6676-4af3-410b-99a4-d9faac5243bb',
  rolesApi: 'https://functions.poehali.dev/36953fca-cdb1-4ebc-8482-8ba8556d1389',
  formationsApi: 'https://functions.poehali.dev/d8bb45c5-f402-46c5-ac74-722186fd2a5d',
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
  create: (data: Record<string, unknown>) =>
    request(URLS.unitsApi, { method: 'POST', body: JSON.stringify({ action: 'create', ...data }) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(URLS.unitsApi, { method: 'POST', body: JSON.stringify({ action: 'update', id, ...data }) }),
  delete: (id: string) =>
    request(URLS.unitsApi, { method: 'POST', body: JSON.stringify({ action: 'delete', id }) }),
};

// Seed
export const seedApi = {
  run: () => request(URLS.seed, { method: 'POST', body: JSON.stringify({}) }),
};

// Upload
export const uploadApi = {
  upload: (file: string, content_type: string, folder = 'avatars') =>
    request(URLS.upload, { method: 'POST', body: JSON.stringify({ file, content_type, folder }) }),
};

// Forum
export const forumApi = {
  getTopics: () => request(URLS.forum),
  getTopic: (id: number) => request(`${URLS.forum}?action=topic&id=${id}`),
  createTopic: (title: string, content: string) =>
    request(URLS.forum, { method: 'POST', body: JSON.stringify({ action: 'create_topic', title, content }) }),
  createPost: (topic_id: number, content: string) =>
    request(URLS.forum, { method: 'POST', body: JSON.stringify({ action: 'create_post', topic_id, content }) }),
  editTopic: (topic_id: number, title: string, content: string) =>
    request(URLS.forum, { method: 'POST', body: JSON.stringify({ action: 'edit_topic', topic_id, title, content }) }),
  editPost: (post_id: number, content: string) =>
    request(URLS.forum, { method: 'POST', body: JSON.stringify({ action: 'edit_post', post_id, content }) }),
  pinTopic: (topic_id: number) =>
    request(URLS.forum, { method: 'POST', body: JSON.stringify({ action: 'pin_topic', topic_id }) }),
  lockTopic: (topic_id: number) =>
    request(URLS.forum, { method: 'POST', body: JSON.stringify({ action: 'lock_topic', topic_id }) }),
  hidePost: (post_id: number) =>
    request(URLS.forum, { method: 'POST', body: JSON.stringify({ action: 'hide_post', post_id }) }),
  getNotifications: () => request(`${URLS.forum}?action=notifications`),
  readNotifications: () => request(URLS.forum, { method: 'POST', body: JSON.stringify({ action: 'read_notifications' }) }),
};

// Formations
export const formationsApi = {
  list: () => request(URLS.formationsApi),
  create: (data: { name: string; description: string; avatar_url: string }) =>
    request(URLS.formationsApi, { method: 'POST', body: JSON.stringify({ action: 'create', ...data }) }),
  update: (id: number, data: { name: string; description: string; avatar_url: string }) =>
    request(URLS.formationsApi, { method: 'POST', body: JSON.stringify({ action: 'update', id, ...data }) }),
  delete: (id: number) =>
    request(URLS.formationsApi, { method: 'POST', body: JSON.stringify({ action: 'delete', id }) }),
};

// Roles
export const rolesApi = {
  list: () => request(URLS.rolesApi),
  create: (data: { name: string; description: string }) =>
    request(URLS.rolesApi, { method: 'POST', body: JSON.stringify({ action: 'create', ...data }) }),
  update: (id: number, data: { name: string; description: string }) =>
    request(URLS.rolesApi, { method: 'POST', body: JSON.stringify({ action: 'update', id, ...data }) }),
  delete: (id: number) =>
    request(URLS.rolesApi, { method: 'POST', body: JSON.stringify({ action: 'delete', id }) }),
};

// Treaties
export const treatiesApi = {
  list: () => request(URLS.treatiesApi),
  create: (data: Record<string, unknown>) =>
    request(URLS.treatiesApi, { method: 'POST', body: JSON.stringify({ action: 'create', ...data }) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(URLS.treatiesApi, { method: 'POST', body: JSON.stringify({ action: 'update', id, ...data }) }),
  delete: (id: string) =>
    request(URLS.treatiesApi, { method: 'POST', body: JSON.stringify({ action: 'delete', id }) }),
};