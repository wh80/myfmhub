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
  }),
});

export const { useLoginMutation, useValidateAuthQuery } = authApi;
