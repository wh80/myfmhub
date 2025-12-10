import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const jobSchedulesApi = createApi({
  reducerPath: "JobSchedulesApi",
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
  tagTypes: ["JobSchedule"],
  endpoints: (builder) => ({
    createJobSchedule: builder.mutation({
      query: (data) => ({
        url: "/job-schedules",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["JobSchedule"],
    }),
    getAllJobSchedules: builder.query({
      query: () => "/job-schedules",
      providesTags: ["JobSchedule"],
    }),
    getJobScheduleById: builder.query({
      query: (id) => `/job-schedules/${id}`,
      providesTags: (result, error, id) => [{ type: "JobSchedule", id }],
    }),
    updateJobSchedule: builder.mutation({
      query: ({ id, data }) => ({
        url: `/job-schedules/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobSchedule", id },
        "JobSchedule",
      ],
    }),
    deleteJobSchedule: builder.mutation({
      query: (id) => ({
        url: `/job-schedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["JobSchedule"],
    }),
    // Load related data queries
    getJobsForJobSchedule: builder.query({
      query: (id) => `/job-schedules/${id}/jobs`,
    }),
    // Related Assets

    getAssetsForJobSchedule: builder.query({
      query: (id) => `/job-schedules/${id}/assets`,
      providesTags: (result, error, id) => [
        { type: "JobSchedule", id, related: "assets" },
      ],
    }),
    linkJobScheduleToAssets: builder.mutation({
      query: ({ id, data }) => ({
        url: `/job-schedules/${id}/assets`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobSchedule", id, related: "assets" },
      ],
    }),
    unlinkJobScheduleFromAssets: builder.mutation({
      query: ({ id, data }) => ({
        url: `/job-schedules/${id}/assets`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobSchedule", id, related: "assets" },
      ],
    }),
  }),
});

export const {
  useCreateJobScheduleMutation,
  useGetAllJobSchedulesQuery,
  useGetJobScheduleByIdQuery,
  useUpdateJobScheduleMutation,
  useDeleteJobScheduleMutation,

  // Related Jobs
  useGetAssetsForJobScheduleQuery,

  // Related Assets
  useLinkJobScheduleToAssetsMutation,
  useUnlinkJobScheduleFromAssetsMutation,
  useGetJobsForJobScheduleQuery,
} = jobSchedulesApi;
