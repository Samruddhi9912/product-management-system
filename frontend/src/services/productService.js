
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080/api/v1/products',
})

export const getAllProducts = async () => {
  const response = await API.get('')
  return response.data
}

export const getProductById = async (id) => {
  const response = await API.get(`/${id}`)
  return response.data
}

export const createProduct = async (product) => {
  const response = await API.post('', product)
  return response.data
}

export const updateProduct = async (id, product) => {
  const response = await API.put(`/${id}`, product)
  return response.data
}

export const deleteProduct = async (id) => {
  return await API.delete(`/${id}`)
}

export const getNextProductId = async () => {
  const response = await API.get('/next-id')
  return response.data
}

export const getProductsByPrice = async (minPrice) => {
  const response = await API.get('/reports/price', {
    params: { minPrice },
  })
  return response.data
}

export const getProductsByCategory = async (category) => {
  const response = await API.get('/reports/category', {
    params: { category },
  })
  return response.data
}

export const getTopStockProducts = async (limit) => {
  const response = await API.get('/reports/top-stock', {
    params: { limit },
  })
  return response.data
}

export default API
