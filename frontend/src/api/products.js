import request from './axios'

/**
 * Get L1 products (root level)
 */
export async function getLevel1Products() {
  return request.get('/products/levels/1')
}

/**
 * Get children of a product (for L2-L5 cascade)
 * @param {string} parentId - The parent product ID
 */
export async function getProductChildren(parentId) {
  return request.get(`/products/levels/${parentId}`)
}

export default { getLevel1Products, getProductChildren }