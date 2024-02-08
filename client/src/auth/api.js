import axios from 'axios'
import url from 'url'
import get from 'lodash/get'
import { isAuthenticated } from '.'
// import openNotification from 'utils/Notification'

const token = isAuthenticated()

const instance = axios.create({
  baseURL: '',
  timeout: 60000,
  headers: {
    'Authorization': token,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  }
})

// Add a request interceptor
instance.interceptors.request.use((config) =>
  config
  , (error) => {
    // openNotification(error, 'Oops, something went wrong')
    console.log(error, 'Oops, something went wrong')
    // Do something with request error
    Promise.reject(error)
  }
)

// Add a response interceptor
instance.interceptors.response.use(response => {
  if (response.data && response.data.message) {
    // openNotification('success', response.data.message)
    console.log('success', response.data.message)
  }
  return response
}, error => {
  if (error.code === 'ECONNABORTED') {
    // openNotification(error, 'Operation taking longer than expected...')
    console.log(error, 'Operation taking longer than expected...')
    return Promise.reject(error)
  }
  if (error.response && error.response.status && error.response.status === 404 && url.parse(error.request.responseURL).pathname === '/users') {
    window.location = '/logout'
  } else {
    // openNotification('error', get(error, 'response.data.message') ? error.response.data.message : error.message)
    console.log('error', get(error, 'response.data.message') ? error.response.data.message : error.message)
    // Sentry.captureException(error)
    if (error.response && error.response.status && error.response.status === 401 && url.parse().pathname !== '/authentication') {
      window.location = '/logout'
    }
  }
  return Promise.reject(error)
})

export default instance
