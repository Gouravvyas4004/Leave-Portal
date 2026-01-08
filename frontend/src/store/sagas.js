import { all, call, put, takeLatest, delay, race } from 'redux-saga/effects'
import axios from 'axios'
import { loginRequest, loginSuccess, loginFailure, registerRequest, logout } from './userSlice'
import { fetchLeavesRequest, fetchLeavesSuccess, fetchLeavesFailure, applyLeaveRequest, applyLeaveSuccess, applyLeaveFailure, fetchBalanceRequest, fetchBalanceSuccess, approveLeaveRequest, approveLeaveSuccess, approveLeaveFailure, rejectLeaveRequest, rejectLeaveSuccess, rejectLeaveFailure } from './leaveSlice'
import { fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure, fetchUserDetailsRequest, fetchUserDetailsSuccess, fetchUserDetailsFailure } from './usersSlice'

const api = axios.create({ baseURL: '/api' })
// If user already logged in (from previous session), set Authorization header
const persisted = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('auth') || 'null') : null
if (persisted && persisted.token){
  api.defaults.headers.common['Authorization'] = `Bearer ${persisted.token}`
}

function* handleLogin(action){
  try {
    const { data } = yield call(api.post, '/auth/login', action.payload)
    yield put(loginSuccess(data))
    // persist auth and set header
    try{ localStorage.setItem('auth', JSON.stringify(data)); api.defaults.headers.common['Authorization'] = `Bearer ${data.token}` }catch(e){}
    // fetch leave list and balance for the signed in user
    yield put(fetchLeavesRequest({ userId: data.user.id }))
    yield put(fetchBalanceRequest({ userId: data.user.id }))
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
    // Reuse loginSuccess to set user and token
    yield put(loginSuccess(data))
    try{ localStorage.setItem('auth', JSON.stringify(data)); api.defaults.headers.common['Authorization'] = `Bearer ${data.token}` }catch(e){}
    // fetch leave list and balance for the new user
    yield put(fetchLeavesRequest({ userId: data.user.id }))
    yield put(fetchBalanceRequest({ userId: data.user.id }))
    yield put({ type: 'ui/showToast', payload: { message: 'Account created', severity: 'success' } })
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Registration failed'
    yield put(loginFailure(message))
    yield put({ type: 'ui/showToast', payload: { message, severity: 'error' } })
  }
}

function* handleFetchLeaves(action){
  try{
    const { data } = yield call(api.get, '/leaves', { params: { userId: action.payload?.userId } })
    yield put(fetchLeavesSuccess(data))
  } catch(err){
    yield put(fetchLeavesFailure(err.message))
  }
}

function* handleFetchBalance(action){
  try{
    const userId = action.payload.userId
    const { data } = yield call(api.get, `/leaves/balance/${userId}`)
    yield put(fetchBalanceSuccess(data.balance))
  } catch(err){
    // ignore briefly, or we could dispatch a failure action
  }
}

function* handleApplyLeave(action){
  console.log('saga: handleApplyLeave started', action.payload)
  try{
    // Race between the POST and a timeout so the UI can recover if the server doesn't respond
    const { response, timeout } = yield race({
      response: call(api.post, '/leaves', action.payload),
      timeout: delay(10000)
    })

    if (timeout) {
      console.warn('saga: handleApplyLeave timed out')
      throw new Error('Request timed out')
    }

    const data = response.data
    console.log('saga: handleApplyLeave success', data)
    yield put(applyLeaveSuccess(data.leave))
    yield put({ type: 'ui/showToast', payload: { message: 'Leave applied', severity: 'success' } })

    // refresh list immediately, then once more after a short delay to avoid race with caches
    yield put(fetchLeavesRequest({ userId: action.payload.userId }))
    // also refresh balance for the user who applied
    yield put(fetchBalanceRequest({ userId: action.payload.userId }))
    yield delay(250)
    yield put(fetchLeavesRequest({ userId: action.payload.userId }))
    yield put(fetchBalanceRequest({ userId: action.payload.userId }))
  } catch(err){
    const message = err?.response?.data?.message || err.message || 'Apply failed'
    console.error('saga: handleApplyLeave error', message)
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

    // refresh list and retry once after short delay
    yield put(fetchLeavesRequest({}))
    // Update balance for the affected user (if available)
    try{ const uid = data.leave.userId?._id || data.leave.userId?.id || data.leave.userId; if (uid) yield put(fetchBalanceRequest({ userId: uid })) }catch(e){}
    yield delay(250)
    yield put(fetchLeavesRequest({}))
    try{ const uid2 = data.leave.userId?._id || data.leave.userId?.id || data.leave.userId; if (uid2) yield put(fetchBalanceRequest({ userId: uid2 })) }catch(e){}
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

    // refresh list and retry after short delay to avoid cache races
    yield put(fetchLeavesRequest({}))
    // Update balance for the affected user (if available)
    try{ const uid = data.leave.userId?._id || data.leave.userId?.id || data.leave.userId; if (uid) yield put(fetchBalanceRequest({ userId: uid })) }catch(e){}
    yield delay(250)
    yield put(fetchLeavesRequest({}))
    try{ const uid2 = data.leave.userId?._id || data.leave.userId?.id || data.leave.userId; if (uid2) yield put(fetchBalanceRequest({ userId: uid2 })) }catch(e){}
  } catch(err){
    const message = err?.response?.data?.message || err.message || 'Reject failed'
    yield put(rejectLeaveFailure(message))
    yield put({ type: 'ui/showToast', payload: { message, severity: 'error' } })
  }
}

function* handleLogout(){
  try{ localStorage.removeItem('auth'); delete api.defaults.headers.common['Authorization'] }catch(e){}
}

function* initApp(){
  try{
    // If auth persisted, fetch relevant data immediately on startup
    if (persisted && persisted.token && persisted.user){
      const role = persisted.user.role
      if (role === 'manager' || role === 'admin'){
        yield put(fetchLeavesRequest({}))
        yield put(fetchUsersRequest())
      } else {
        yield put(fetchLeavesRequest({ userId: persisted.user.id }))
      }
      yield put(fetchBalanceRequest({ userId: persisted.user.id }))
    }
  }catch(e){ /* swallow errors on init */ }
}

function* rootSaga(){
  // Run init once at startup
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
    takeLatest(logout.type, handleLogout)
  ])
}

export default rootSaga
