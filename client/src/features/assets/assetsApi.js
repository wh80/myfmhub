import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const assetsApi = createApi({
  reducerPath: "assetsApi",
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
  tagTypes: ["Asset"],
  endpoints: (builder) => ({
    createAsset: builder.mutation({
      query: (data) => ({
        url: "/assets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assets"],
    }),
    getAllAssets: builder.query({
      query: () => "/assets",
      providesTags: ["Assets"],
    }),
    getAssetById: builder.query({
      query: (id) => `/assets/${id}`,
      providesTags: (result, error, id) => [{ type: "Asset", id }],
    }),
    updateAsset: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assets/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Asset", id },
        "Assets",
      ],
    }),
    deleteAsset: builder.mutation({
      query: (id) => ({
        url: `/assets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assets"],
    }),

    // Related Jobs

    getJobsForAsset: builder.query({
      query: (id) => `/assets/${id}/jobs`,
      providesTags: (result, error, id) => [
        { type: "Asset", id, related: "jobs" },
      ],
    }),
    linkAssetToJobs: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assets/${id}/jobs`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Asset", id, related: "jobs" },
      ],
    }),
    unlinkAssetFromJobs: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assets/${id}/jobs`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Asset", id, related: "jobs" },
      ],
    }),

    // Related Job Schedules

    getJobSchedulesForAsset: builder.query({
      query: (id) => `/assets/${id}/job-schedules`,
      providesTags: (result, error, id) => [
        { type: "Asset", id, related: "jobSchedules" },
      ],
    }),
    linkAssetToJobSchedules: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assets/${id}/job-schedules`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Asset", id, related: "jobSchedules" },
      ],
    }),
    unlinkAssetFromJobSchedules: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assets/${id}/job-schedules`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Asset", id, related: "jobSchedules" },
      ],
    }),
  }),
});

export const {
  useCreateAssetMutation,
  useGetAllAssetsQuery,
  useGetAssetByIdQuery,
  useUpdateAssetMutation,
  useDeleteAssetMutation,

  // relation queries
  useGetJobsForAssetQuery,
  useGetJobSchedulesForAssetQuery,

  useLinkAssetToJobsMutation,
  useLinkAssetToJobSchedulesMutation,

  useUnlinkAssetFromJobsMutation,
  useUnlinkAssetFromJobSchedulesMutation,
} = assetsApi;
