// import jwtDecode from 'jwt-decode'
// import openNotification from 'utils/Notification'
import history from 'CustomHistory'

export function authHeader() {
  let token = JSON.parse(localStorage.getItem('user'))
  if (token) {
    return 'Basic ' + token
  }
  return {}
}

export function isAuthenticated() {
  return JSON.parse(localStorage.getItem('token'))
}

export function authLogin(response) {
  localStorage.setItem('token', JSON.stringify(response.data.adminLogin))
  /**
   * Todo
   *  get user details 
   *  based on user type store into usecontext
   *  
   */
  // openNotification('success', 'Logged in successfully')
  console.log('success', 'Logged in successfully')
  history.push('/')
}

export function authLogout() {
  // openNotification('success', 'Logout Successfully')
  console.log('success', 'Logout Successfully')
  localStorage.removeItem('token')
  history.replace('/')
}
