import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const jobsApi = createApi({
  reducerPath: "jobsApi",
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
  tagTypes: ["Job"],
  endpoints: (builder) => ({
    createJob: builder.mutation({
      query: (data) => ({
        url: "/jobs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Job"],
    }),
    getAllJobs: builder.query({
      query: () => "/jobs",
      providesTags: ["Job"],
    }),
    getJobById: builder.query({
      query: (id) => `/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: "Job", id }],
    }),
    updateJob: builder.mutation({
      query: ({ id, data }) => ({
        url: `/jobs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Job", id }, "Job"],
    }),
    deleteJob: builder.mutation({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Job"],
    }),

    // Related Assets

    getAssetsForJob: builder.query({
      query: (id) => `/jobs/${id}/assets`,
      providesTags: (result, error, id) => [
        { type: "Job", id, related: "assets" },
      ],
    }),
    linkJobToAssets: builder.mutation({
      query: ({ id, data }) => ({
        url: `/jobs/${id}/assets`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Job", id, related: "assets" },
      ],
    }),
    unlinkJobFromAssets: builder.mutation({
      query: ({ id, data }) => ({
        url: `/jobs/${id}/assets`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Job", id, related: "assets" },
      ],
    }),
  }),
});

export const {
  useCreateJobMutation,
  useGetAllJobsQuery,
  useGetJobByIdQuery,
  useUpdateJobMutation,
  useDeleteJobMutation,

  // related jobs
  useGetAssetsForJobQuery,
  useLinkJobToAssetsMutation,
  useUnlinkJobFromAssetsMutation,
} = jobsApi;
