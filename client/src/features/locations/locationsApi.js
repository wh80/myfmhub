import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const locationsApi = createApi({
  reducerPath: "locationsApi",
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
  tagTypes: ["Location"],
  endpoints: (builder) => ({
    createLocation: builder.mutation({
      query: (data) => ({
        url: "/locations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Location"],
    }),
    getAllLocations: builder.query({
      query: () => "/locations",
      providesTags: ["Location"],
    }),
    getLocationById: builder.query({
      query: (id) => `/locations/${id}`,
      providesTags: (result, error, id) => [{ type: "Location", id }],
    }),
    updateLocation: builder.mutation({
      query: ({ id, data }) => ({
        url: `/locations/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Location", id },
        "Location",
      ],
    }),
    deleteLocation: builder.mutation({
      query: (id) => ({
        url: `/locations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Location"],
    }),

    // Load related data queries
    getAssetsForLocation: builder.query({
      query: (id) => `/locations/${id}/assets`,
    }),
    getJobsForLocation: builder.query({
      query: (id) => `/locations/${id}/jobs`,
    }),
    getJobSchedulesForLocation: builder.query({
      query: (id) => `/locations/${id}/job-schedules`,
    }),
    getPeopleForLocation: builder.query({
      query: (id) => `/locations/${id}/people`,
    }),
  }),
});

export const {
  useCreateLocationMutation,
  useGetAllLocationsQuery,
  useGetLocationByIdQuery,
  useUpdateLocationMutation,
  useDeleteLocationMutation,

  // related data
  useGetAssetsForLocationQuery,
  useGetJobsForLocationQuery,
  useGetJobSchedulesForLocationQuery,
  useGetPeopleForLocationQuery,
} = locationsApi;
