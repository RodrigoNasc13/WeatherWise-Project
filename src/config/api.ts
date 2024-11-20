import axios from 'axios'

const weatherAPI = axios.create({
  baseURL: import.meta.env.VITE_WEATHERSTACK_BASE_URL,
  params: {
    // access_key: import.meta.env.VITE_WEATHERSTACK_API_KEY,
  },
})

const universalAPI = axios.create({
  baseURL: import.meta.env.VITE_UNIVERSAL_BASE_URL,
})

universalAPI.interceptors.request.use(config => {
  config.headers.Accept = 'application/json'
  config.headers.Authorization = `Bearer ${import.meta.env.VITE_UNIVERSAL_API_KEY}`

  return config
})

export { weatherAPI, universalAPI }
