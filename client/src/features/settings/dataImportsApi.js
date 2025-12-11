import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const dataImportsApi = createApi({
  reducerPath: "dataImportsApi",
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
  endpoints: (builder) => ({
    importData: builder.mutation({
      query: ({ file, importType }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("importType", importType);

        return {
          url: "/settings/data-import",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const { useImportDataMutation } = dataImportsApi;
