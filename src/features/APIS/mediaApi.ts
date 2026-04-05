import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../App/store';

// ✅ Rename this to avoid clashing with the built-in browser FormData
export interface MediaPayload {
  eventId: number;
  url: string;
  type: string;
}

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://event-ticketing-backend-1df8.onrender.com/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['media', 'mediaByEvent', 'mediaByType'],
  endpoints: (builder) => ({
    // ➕ Create Media
    createMedia: builder.mutation({
      // ✅ Use the new interface name here
      query: (mediaData: MediaPayload) => ({
        url: 'media',
        method: 'POST',
        body: mediaData,
      }),
      invalidatesTags: ['media'],
    }),

    // 🔄 Update Media
    updateMedia: builder.mutation({
      query: ({ mediaId, ...data }) => ({
        url: `media/${mediaId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['media'],
    }),

    // ... (rest of the code remains the same)
    getAllMedia: builder.query({
      query: () => 'media',
      providesTags: ['media'],
    }),

    getMediaByEventId: builder.query({
      query: (eventId) => `media/event/${eventId}`,
      providesTags: ['mediaByEvent'],
    }),

    getMediaByType: builder.query({
      query: (type: 'image' | 'video') => `media/type/${type}`,
      providesTags: ['mediaByType'],
    }),

    deleteMedia: builder.mutation({
      query: (mediaId: number) => ({
        url: `media/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['media'],
    }),
  }),
});

export const {
  useCreateMediaMutation,
  useUpdateMediaMutation,
  useGetAllMediaQuery,
  useGetMediaByEventIdQuery,
  useGetMediaByTypeQuery,
  useDeleteMediaMutation,
} = mediaApi;