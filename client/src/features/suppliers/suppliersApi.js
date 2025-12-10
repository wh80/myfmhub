import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const suppliersApi = createApi({
  reducerPath: "suppliersApi",
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
  tagTypes: ["Supplier"],
  endpoints: (builder) => ({
    createSupplier: builder.mutation({
      query: (data) => ({
        url: "/suppliers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supplier"],
    }),
    getAllSuppliers: builder.query({
      query: () => "/suppliers",
      providesTags: ["Supplier"],
    }),
    getSupplierById: builder.query({
      query: (id) => `/suppliers/${id}`,
      providesTags: (result, error, id) => [{ type: "Supplier", id }],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Supplier", id },
        "Supplier",
      ],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supplier"],
    }),
  }),
});

export const {
  useCreateSupplierMutation,
  useGetAllSuppliersQuery,
  useGetSupplierByIdQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
