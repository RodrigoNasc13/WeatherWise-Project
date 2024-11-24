import axios from 'axios'

const weatherAPI = axios.create({
  baseURL: import.meta.env.VITE_WEATHERSTACK_BASE_URL,
  params: {
    // access_key: import.meta.env.VITE_WEATHERSTACK_API_KEY,
  },
})

const cscAPI = axios.create({
  baseURL: import.meta.env.VITE_CSC_BASE_URL,
  headers: {
    'X-CSCAPI-KEY': import.meta.env.VITE_CSC_API_KEY,
  },
})

export { weatherAPI, cscAPI }
