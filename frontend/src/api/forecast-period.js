import request from './axios'

// Get all forecast periods
export async function getForecastPeriods(params) {
  return request.get('/forecast-periods', { params })
}

// Get a single forecast period by ID
export async function getForecastPeriod(id) {
  return request.get(`/forecast-periods/${id}`)
}

// Create a new forecast period
export async function createForecastPeriod(data) {
  return request.post('/forecast-periods', data)
}

// Update a forecast period
export async function updateForecastPeriod(id, data) {
  return request.put(`/forecast-periods/${id}`, data)
}

// Delete a forecast period
export async function deleteForecastPeriod(id) {
  return request.delete(`/forecast-periods/${id}`)
}

// Get all active users (for extension user picker)
export async function getAllUsers(params) {
  return request.get('/users', { params })
}

export default { getForecastPeriods, getForecastPeriod, createForecastPeriod, updateForecastPeriod, deleteForecastPeriod, getAllUsers }
