import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Create API service
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }), // include cookie with requests
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials, // credentials = {  email, password }
      }),
    }),
    validateAuth: builder.query({
      query: () => ({
        url: "/auth/validate",
        method: "GET",
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: email,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    updatePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/update-password",
        method: "POST",
        body: data,
      }),
    }),
    // Used to load accounts for selection where user has multiple related accounts
    getAccountOptions: builder.query({
      query: () => ({
        url: "/auth/get-account-options",
        method: "GET",
      }),
    }),

    // Used to set selected account where user has multiple related accounts
    setAccountOption: builder.mutation({
      query: (accountId) => ({
        url: "/auth/set-account-option",
        method: "POST",
        body: accountId,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useValidateAuthQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
  useGetAccountOptionsQuery,
  useSetAccountOptionMutation,
} = authApi;
