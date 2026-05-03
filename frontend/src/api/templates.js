import request from './axios'

// Get all message templates
export async function getTemplates() {
  try {
    const result = await request.get('/message-templates')
    return result
  } catch {
    return { success: false, message: 'Failed to load templates' }
  }
}

// Get single template
export async function getTemplate(id) {
  try {
    const result = await request.get(`/message-templates/${id}`)
    return result
  } catch {
    return { success: false, message: 'Failed to load template' }
  }
}

// Create template
export async function createTemplate(data) {
  try {
    const result = await request.post('/message-templates', data)
    return result
  } catch {
    return { success: false, message: 'Failed to create template' }
  }
}

// Update template
export async function updateTemplate(id, data) {
  try {
    const result = await request.put(`/message-templates/${id}`, data)
    return result
  } catch {
    return { success: false, message: 'Failed to update template' }
  }
}

// Delete template
export async function deleteTemplate(id) {
  try {
    const result = await request.delete(`/message-templates/${id}`)
    return result
  } catch {
    return { success: false, message: 'Failed to delete template' }
  }
}

// Activate template
export async function activateTemplate(id) {
  try {
    const result = await request.put(`/message-templates/${id}/activate`)
    return result
  } catch {
    return { success: false, message: 'Failed to activate template' }
  }
}

export default {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  activateTemplate
}