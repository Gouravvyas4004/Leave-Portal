import { all, call, put, takeLatest, delay, race } from 'redux-saga/effects'
import axios from 'axios' // Import axios directly here
import { loginRequest, loginSuccess, loginFailure, registerRequest, logout, updateUserBalance } from './userSlice'
import { fetchLeavesRequest, fetchLeavesSuccess, fetchLeavesFailure, applyLeaveRequest, applyLeaveSuccess, applyLeaveFailure, fetchBalanceRequest, fetchBalanceSuccess, approveLeaveRequest, approveLeaveSuccess, approveLeaveFailure, rejectLeaveRequest, rejectLeaveSuccess, rejectLeaveFailure } from './leaveSlice'
import { fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure, fetchUserDetailsRequest, fetchUserDetailsSuccess, fetchUserDetailsFailure } from './usersSlice'

// --- 1. SETUP AXIOS INSIDE THIS FILE ---
// Get URL from .env (or default to localhost)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({ 
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add request interceptor to always include auth token
api.interceptors.request.use(
  (config) => {
    const persisted = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('auth') || 'null') : null;
    if (persisted && persisted.token) {
      config.headers.Authorization = `Bearer ${persisted.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 2. RESTORE TOKEN ON REFRESH ---
// If we don't do this, refreshing the page breaks your login
const persisted = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('auth') || 'null') : null
if (persisted && persisted.token){
  api.defaults.headers.common['Authorization'] = `Bearer ${persisted.token}`
}

// --- SAGAS START HERE ---

function* handleLogin(action){
  try {
    const { data } = yield call(api.post, '/auth/login', action.payload)
    yield put(loginSuccess(data))
    
    // Save to local storage AND set the header for future calls
    try{ 
      localStorage.setItem('auth', JSON.stringify(data)); 
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}` 
    }catch(e){}
    
    // Ensure fresh data from server (bypass cache)
    yield put(fetchLeavesRequest({ userId: data.user.id, force: true }))
    yield put(fetchBalanceRequest({ userId: data.user.id }))

    // Immediately update balance in UI from login payload (helps prevent flicker until fetch completes)
    if (data.user && typeof data.user.leaveBalance !== 'undefined'){
      yield put(fetchBalanceSuccess(data.user.leaveBalance))
      yield put(updateUserBalance(data.user.leaveBalance))

      // Also sync to localStorage 'auth' blob
      try{
        const persisted = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('auth') || 'null') : null
        if (persisted){ persisted.user = data.user; localStorage.setItem('auth', JSON.stringify(persisted)) }
      }catch(e){ console.warn('Could not sync auth blob after login', e) }
    }

    yield put({ type: 'ui/showToast', payload: { message: 'Signed in', severity: 'success' } })
  } catch (err){
    const message = err?.response?.data?.message || err.message || 'Login failed'
    yield put(loginFailure(message))
    yield put({ type: 'ui/showToast', payload: { message, severity: 'error' } })
  }
}

function* handleRegister(action){
  try {
    const { data } = yield call(api.post, '/auth/register', action.payload)
    yield put(loginSuccess(data))
    
    try{ 
      localStorage.setItem('auth', JSON.stringify(data)); 
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}` 
    }catch(e){}
    
    // Ensure fresh data from server (bypass cache)
    yield put(fetchLeavesRequest({ userId: data.user.id, force: true }))
    yield put(fetchBalanceRequest({ userId: data.user.id }))

    // Immediately update balance in UI from register payload
    if (data.user && typeof data.user.leaveBalance !== 'undefined'){
      yield put(fetchBalanceSuccess(data.user.leaveBalance))
      yield put(updateUserBalance(data.user.leaveBalance))
      try{ const persisted = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('auth') || 'null') : null; if (persisted){ persisted.user = data.user; localStorage.setItem('auth', JSON.stringify(persisted)) } }catch(e){ console.warn('Could not sync auth blob after register', e) }
    }

    yield put({ type: 'ui/showToast', payload: { message: 'Account created', severity: 'success' } })
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Registration failed'
    yield put(loginFailure(message))
    yield put({ type: 'ui/showToast', payload: { message, severity: 'error' } })
  }
}

function* handleFetchLeaves(action){
  try{
    const params = {}
    if (action && action.payload) {
      if (action.payload.userId) params.userId = action.payload.userId
      if (action.payload.force) params.force = 1
    }
    console.log('handleFetchLeaves: fetching with params', params)
    const { data } = yield call(api.get, '/leaves', { params })
    console.log('handleFetchLeaves: received', Array.isArray(data) ? data.length : 'unknown', 'leaves')
    yield put(fetchLeavesSuccess(data))
  } catch(err){
    console.error('handleFetchLeaves error:', err)
    yield put(fetchLeavesFailure(err.message || String(err)))
  }
}

function* handleFetchBalance(action){
  try{
    const userId = action.payload.userId
    const params = {}
    if (action.payload && action.payload.force) params.force = 1
    const { data } = yield call(api.get, `/leaves/balance/${userId}`, { params })
    const balance = data.balance

    // Update leaves state
    yield put(fetchBalanceSuccess(balance))

    // Update user slice and persisted auth so refresh keeps latest balance
    try{
      // Update in-memory user state
      yield put(updateUserBalance(balance))

      // Also update localStorage 'auth' blob if present
      const persisted = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('auth') || 'null') : null
      if (persisted && persisted.user && persisted.user.id === userId){
        persisted.user.leaveBalance = balance
        try{ localStorage.setItem('auth', JSON.stringify(persisted)) }catch(e){ console.warn('Unable to update auth in localStorage', e) }
      }
    }catch(e){ console.warn('handleFetchBalance: failed to update local user balance', e) }
  } catch(err){
    console.error('handleFetchBalance error:', err)
  }
}

function* handleApplyLeave(action){
  console.log('saga: handleApplyLeave started', action.payload)
  try{
    const { response, timeout } = yield race({
      response: call(api.post, '/leaves', action.payload),
      timeout: delay(30000)
    })

    if (timeout) {
      throw new Error('Request timed out - please try again')
    }

    const data = response.data
    console.log('applyLeave response:', data)
    yield put(applyLeaveSuccess(data.leave))
    yield put({ type: 'ui/showToast', payload: { message: 'Leave applied successfully', severity: 'success' } })

    // Fetch user's leaves (bypass cache)
    yield put(fetchLeavesRequest({ userId: action.payload.userId, force: true }))
    yield put(fetchBalanceRequest({ userId: action.payload.userId }))
    
    // Also fetch all leaves for admin dashboard to see the new request
    yield delay(500)
    yield put(fetchLeavesRequest({ force: true }))
  } catch(err){
    console.error('applyLeave error:', err)
    const message = err?.response?.data?.message || err.message || 'Failed to apply leave. Please check your connection and try again.'
    console.error('applyLeave error message:', message)
    yield put(applyLeaveFailure(message))
    yield put({ type: 'ui/showToast', payload: { message, severity: 'error' } })
  }
}

function* handleFetchUsers(){
  try{
    const { data } = yield call(api.get, '/users')
    yield put(fetchUsersSuccess(data))
  }catch(err){
    yield put(fetchUsersFailure(err.message))
  }
}

function* handleFetchUserDetails(action){
  try{
    const { id } = action.payload
    const { data } = yield call(api.get, `/users/${id}`)
    yield put(fetchUserDetailsSuccess(data))
  }catch(err){
    yield put(fetchUserDetailsFailure(err.message))
  }
}

function* handleApprove(action){
  try{
    const { id, reason } = action.payload
    const { data } = yield call(api.post, `/leaves/${id}/approve`, { reason })
    yield put(approveLeaveSuccess(data.leave))
    yield put({ type: 'ui/showToast', payload: { message: 'Leave approved', severity: 'success' } })

    // If backend returned updated user info, update balance immediately and user details for admin view
    try{
      const uid = data.leave.userId?._id || data.leave.userId?.id || data.leave.userId
      if (data.user && uid){
        // Update balance in state
        yield put(fetchBalanceSuccess(data.user.leaveBalance))
        // Also reflect in user slice and localStorage so refresh shows updated balance
        yield put(updateUserBalance(data.user.leaveBalance))
        try{
          const persisted = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('auth') || 'null') : null
          if (persisted && persisted.user && String(persisted.user.id) === String(uid)){
            persisted.user.leaveBalance = data.user.leaveBalance
            try{ localStorage.setItem('auth', JSON.stringify(persisted)) }catch(e){ console.warn('Unable to update auth in localStorage', e) }
          }
        }catch(e){ console.warn('persist update failed', e) }

        // Refresh selected user details in admin view
        yield put(fetchUserDetailsRequest({ id: uid }))
      } else {
        // Fallback: fetch balance and leaves (bypass cache)
        yield delay(250)
        yield put(fetchLeavesRequest({ force: true }))
        try{ const uid2 = data.leave.userId?._id || data.leave.userId?.id || data.leave.userId; if (uid2) yield put(fetchBalanceRequest({ userId: uid2, force: true })) }catch(e){}
      }
    }catch(e){ console.warn('post-approve update failed', e) }
  } catch(err){
    const message = err?.response?.data?.message || err.message || 'Approve failed'
    yield put(approveLeaveFailure(message))
    yield put({ type: 'ui/showToast', payload: { message, severity: 'error' } })
  }
}

function* handleReject(action){
  try{
    const { id, reason } = action.payload
    const { data } = yield call(api.post, `/leaves/${id}/reject`, { reason })
    yield put(rejectLeaveSuccess(data.leave))
    yield put({ type: 'ui/showToast', payload: { message: 'Leave rejected', severity: 'info' } })

    // Fetch all leaves to ensure approved/rejected history is shown (bypass cache)
    yield delay(250)
    yield put(fetchLeavesRequest({ force: true }))
    try{ const uid = data.leave.userId?._id || data.leave.userId?.id || data.leave.userId; if (uid) yield put(fetchBalanceRequest({ userId: uid })) }catch(e){}
  } catch(err){
    const message = err?.response?.data?.message || err.message || 'Reject failed'
    yield put(rejectLeaveFailure(message))
    yield put({ type: 'ui/showToast', payload: { message, severity: 'error' } })
  }
}

function* handleLogout(){
  try{ 
    localStorage.removeItem('auth'); 
    delete api.defaults.headers.common['Authorization']; 
    // Clear local UI state for leaves and balances to avoid showing stale or missing data on next login
    yield put(fetchLeavesSuccess([]))
    yield put(fetchBalanceSuccess(null))
    yield put(fetchUsersSuccess([]))
  }catch(e){}
}

function* initApp(){
  try{
    // Re-read storage
    const persisted = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('auth') || 'null') : null
    
    console.log('initApp: checking for persisted auth', { hasToken: !!persisted?.token, hasUser: !!persisted?.user })
    
    if (persisted && persisted.token && persisted.user){
      // Set authorization header for future API calls
      api.defaults.headers.common['Authorization'] = `Bearer ${persisted.token}`
      
      const role = persisted.user.role
      console.log('initApp: user found with role', role)
      
      if (role === 'manager' || role === 'admin'){
        console.log('initApp: fetching all leaves for admin')
        yield put(fetchLeavesRequest({ force: true }))
        yield put(fetchUsersRequest())
      } else {
        console.log('initApp: fetching user leaves', persisted.user.id)
        yield put(fetchLeavesRequest({ userId: persisted.user.id, force: true }))
      }
      yield put(fetchBalanceRequest({ userId: persisted.user.id }))
    }
  }catch(e){ 
    console.error('initApp error:', e && e.message ? e.message : e)
  }
}

function* rootSaga(){
  yield call(initApp)

  yield all([
    takeLatest(loginRequest.type, handleLogin),
    takeLatest(registerRequest.type, handleRegister),
    takeLatest(fetchLeavesRequest.type, handleFetchLeaves),
    takeLatest(applyLeaveRequest.type, handleApplyLeave),
    takeLatest(approveLeaveRequest.type, handleApprove),
    takeLatest(rejectLeaveRequest.type, handleReject),
    takeLatest(fetchBalanceRequest.type, handleFetchBalance),
    takeLatest(fetchUsersRequest.type, handleFetchUsers),
    takeLatest(fetchUserDetailsRequest.type, handleFetchUserDetails),
    takeLatest(logout.type, handleLogout),
    takeLatest('APP_INIT', initApp), // Re-initialize on app mount
    takeLatest('persist/REHYDRATE', initApp) // Re-initialize after Redux-persist rehydrates
  ])
}

export default rootSaga