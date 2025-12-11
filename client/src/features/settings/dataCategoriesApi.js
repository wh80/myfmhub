import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const dataCategoriesApi = createApi({
  reducerPath: "dataCategoriesApi",
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: ({ data, categoryType }) => ({
        url: `/settings/categories/${categoryType}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { categoryType }) => [
        { type: "Category", categoryType },
      ],
    }),
    getAllCategories: builder.query({
      query: (categoryType) => `/settings/categories/${categoryType}`,
      providesTags: (result, error, categoryType) => [
        { type: "Category", categoryType },
      ],
    }),
    getCategoryById: builder.query({
      query: ({ id, categoryType }) =>
        `/settings/categories/${categoryType}/${id}`,
      providesTags: (result, error, { id, categoryType }) => [
        { type: "Category", id, categoryType },
      ],
    }),
    updateCategory: builder.mutation({
      query: ({ id, categoryType, data }) => ({
        url: `/settings/categories/${categoryType}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id, categoryType }) => [
        { type: "Category", id, categoryType },
        { type: "Category", categoryType }, // Invalidate list too
      ],
    }),
    deleteCategory: builder.mutation({
      query: ({ categoryType, id }) => ({
        url: `/settings/categories/${categoryType}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { categoryType, id }) => [
        { type: "Category", id, categoryType }, // Specific item
        { type: "Category", categoryType }, // And the list
      ],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = dataCategoriesApi;
