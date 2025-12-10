import { configureStore } from "@reduxjs/toolkit";
import { accountsApi } from "./features/accounts/accountsApi";
import { authApi } from "./features/auth/authApi";
import { assetsApi } from "./features/assets/assetsApi";
import { jobsApi } from "./features/jobs/jobsApi";
import { locationsApi } from "./features/locations/locationsApi";
import { suppliersApi } from "./features/suppliers/suppliersApi";
import { jobSchedulesApi } from "./features/jobSchedules/jobSchedulesApi";
import { peopleApi } from "./features/people/peopleApi";

import authReducer from "./features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [accountsApi.reducerPath]: accountsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [assetsApi.reducerPath]: assetsApi.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [locationsApi.reducerPath]: locationsApi.reducer,
    [suppliersApi.reducerPath]: suppliersApi.reducer,
    [jobSchedulesApi.reducerPath]: jobSchedulesApi.reducer,
    [peopleApi.reducerPath]: peopleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(accountsApi.middleware)
      .concat(authApi.middleware)
      .concat(assetsApi.middleware)
      .concat(jobsApi.middleware)
      .concat(locationsApi.middleware)
      .concat(suppliersApi.middleware)
      .concat(jobSchedulesApi.middleware)
      .concat(peopleApi.middleware),
});
