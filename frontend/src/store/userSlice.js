import { createSlice } from '@reduxjs/toolkit'

const persisted = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('auth') || 'null') : null

const slice = createSlice({
  name: 'user',
  initialState: { user: persisted?.user || null, token: persisted?.token || null, loading: false, error: null },
  reducers: {
    loginRequest(state, action){ state.loading = true; state.error = null },
    registerRequest(state, action){ state.loading = true; state.error = null },
    loginSuccess(state, action){ state.loading = false; state.user = action.payload.user; state.token = action.payload.token },
    loginFailure(state, action){ state.loading = false; state.error = action.payload },
    logout(state){ return { user: null, token: null, loading: false, error: null } }
  }
})

export const { loginRequest, registerRequest, loginSuccess, loginFailure, logout } = slice.actions
export default slice.reducer
