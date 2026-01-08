import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'adminUsers',
  initialState: { list: [], selected: null, loading: false, error: null },
  reducers: {
    fetchUsersRequest(state){ state.loading = true; state.error = null },
    fetchUsersSuccess(state, action){ state.loading = false; state.list = action.payload },
    fetchUsersFailure(state, action){ state.loading = false; state.error = action.payload },
    fetchUserDetailsRequest(state, action){ state.loading = true; state.error = null },
    fetchUserDetailsSuccess(state, action){ state.loading = false; state.selected = action.payload },
    fetchUserDetailsFailure(state, action){ state.loading = false; state.error = action.payload }
  }
})

export const { fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure, fetchUserDetailsRequest, fetchUserDetailsSuccess, fetchUserDetailsFailure } = slice.actions
export default slice.reducer
