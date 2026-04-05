import api from './axios'

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const transactionAPI = {
  getAll:    (params) => api.get('/transactions', { params }),
  getById:   (id)     => api.get(`/transactions/${id}`),
  create:    (data)   => api.post('/transactions', data),
  update:    (id, d)  => api.put(`/transactions/${id}`, d),
  delete:    (id)     => api.delete(`/transactions/${id}`),
  dashboard: (year)   => api.get('/transactions/dashboard', { params: { year } }),
  exportCsv: ()       => api.get('/transactions/export', { responseType: 'blob' }),
}

export const userAPI = {
  getMe:         ()       => api.get('/users/me'),
  updateProfile: (data)   => api.patch('/users/me', data),
  getAll:        (params) => api.get('/users', { params }),
  getById:       (id)     => api.get(`/users/${id}`),
  updateRole:    (id, r)  => api.patch(`/users/${id}/role`, null, { params: { role: r } }),
  toggleStatus:  (id)     => api.patch(`/users/${id}/status`),
  delete:        (id)     => api.delete(`/users/${id}`),
}

export const auditAPI = {
  getAll:       (params)   => api.get('/audit-logs', { params }),
  getByUser:    (uid, p)   => api.get(`/audit-logs/user/${uid}`, { params: p }),
  getByEntity:  (type, p)  => api.get(`/audit-logs/entity/${type}`, { params: p }),
}
