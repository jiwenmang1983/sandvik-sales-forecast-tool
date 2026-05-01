/**
 * org-2 API client
 * Proxied via Vite: /org-api → http://localhost:5001/api
 */

const API_BASE = '/org-api'

/**
 * 获取完整组织架构树
 * @returns {Promise<OrgNode[]>}
 */
export async function fetchOrgChart() {
  try {
    const res = await fetch(`${API_BASE}/org`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[orgApi] fetchOrgChart failed, using fallback:', err.message)
    return []
  }
}
