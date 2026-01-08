import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import userReducer from './userSlice'
import leaveReducer from './leaveSlice'
import usersReducer from './usersSlice'
import uiReducer from './uiSlice'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer: {
    user: userReducer,
    leaves: leaveReducer,
    adminUsers: usersReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware)
})

sagaMiddleware.run(rootSaga)

export default store
