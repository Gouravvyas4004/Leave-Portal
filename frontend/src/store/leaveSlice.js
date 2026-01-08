import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'leaves',
  initialState: { items: [], loading: false, error: null, balance: null },
  reducers: {
    fetchLeavesRequest(state){ state.loading = true; state.error = null },
    fetchLeavesSuccess(state, action){ state.loading = false; state.items = action.payload },
    fetchLeavesFailure(state, action){ state.loading = false; state.error = action.payload },
    applyLeaveRequest(state){ state.loading = true; state.error = null },
    applyLeaveSuccess(state, action){ state.loading = false; state.items.push(action.payload) },
    applyLeaveFailure(state, action){ state.loading = false; state.error = action.payload },
    approveLeaveRequest(state){ state.loading = true },
    approveLeaveSuccess(state, action){ state.loading = false; state.items = state.items.map(i=> i._id === action.payload._id ? action.payload : i) },
    approveLeaveFailure(state, action){ state.loading = false; state.error = action.payload },
    rejectLeaveRequest(state){ state.loading = true },
    rejectLeaveSuccess(state, action){ state.loading = false; state.items = state.items.map(i=> i._id === action.payload._id ? action.payload : i) },
    rejectLeaveFailure(state, action){ state.loading = false; state.error = action.payload },
    fetchBalanceRequest(state){ state.loading = true },
    fetchBalanceSuccess(state, action){ state.loading = false; state.balance = action.payload }
  }
})

export const {
  fetchLeavesRequest, fetchLeavesSuccess, fetchLeavesFailure,
  applyLeaveRequest, applyLeaveSuccess, applyLeaveFailure,
  approveLeaveRequest, approveLeaveSuccess, approveLeaveFailure,
  rejectLeaveRequest, rejectLeaveSuccess, rejectLeaveFailure,
  fetchBalanceRequest, fetchBalanceSuccess
} = slice.actions
export default slice.reducer
