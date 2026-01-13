import { configureStore, combineReducers } from '@reduxjs/toolkit'
import userSlice from './userSlice'
import ownerSlice from './ownerSlice'
import mapSlice from './mapSlice'

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // Ensure we don't persist any leftover socket state if it exists
  blacklist: ['socket'] 
}

const rootReducer = combineReducers({
  user: userSlice,
  owner: ownerSlice,
  map: mapSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux persist ke standard actions ko ignore karein
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, 'user/setSocket'],
        // Socket instances ko state aur actions mein ignore karein
        ignoredActionPaths: ['payload.socket'],
        ignoredPaths: ['user.socket', 'payload.socket'],
      },
    }),
})

export default store;