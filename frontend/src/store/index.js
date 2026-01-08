import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import userReducer from './userSlice'
import leaveReducer from './leaveSlice'
import usersReducer from './usersSlice'
import uiReducer from './uiSlice'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()

// Redux-Persist Configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // Only persist user/auth state
  blacklist: ['leaves', 'adminUsers', 'ui'] // Don't persist leaves - always fetch fresh from server
}

// Wrap reducers with persist
const persistedUserReducer = persistReducer(
  { ...persistConfig, key: 'user' },
  userReducer
)

const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    leaves: leaveReducer,
    adminUsers: usersReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false, serializableCheck: { ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'] } }).concat(sagaMiddleware)
})

sagaMiddleware.run(rootSaga)

// Create persistor for rehydration on app load
export const persistor = persistStore(store)

export default store;