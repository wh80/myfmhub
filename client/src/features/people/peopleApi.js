import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const peopleApi = createApi({
  reducerPath: "peopleApi",
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
  tagTypes: ["Person"],
  endpoints: (builder) => ({
    createPerson: builder.mutation({
      query: (data) => ({
        url: "/people",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Person"],
    }),
    getAllPeople: builder.query({
      query: () => "/people",
      providesTags: ["Person"],
    }),
    getPersonById: builder.query({
      query: (id) => `/people/${id}`,
      providesTags: (result, error, id) => [{ type: "Person", id }],
    }),
    updatePerson: builder.mutation({
      query: ({ id, data }) => ({
        url: `/people/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Person", id },
        "Person",
      ],
    }),
    deletePerson: builder.mutation({
      query: (id) => ({
        url: `/people/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Person"],
    }),

    // Load related data queries
    getJobsForPerson: builder.query({
      query: (id) => `/people/${id}/jobs`,
    }),
  }),
});

export const {
  useCreatePersonMutation,
  useGetAllPeopleQuery,
  useGetPersonByIdQuery,
  useUpdatePersonMutation,
  useDeletePersonMutation,

  // Related data
  useGetJobsForPersonQuery,
} = peopleApi;
