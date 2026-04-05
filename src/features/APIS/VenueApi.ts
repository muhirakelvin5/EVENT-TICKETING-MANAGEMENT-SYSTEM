import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../App/store';

export const venueApi = createApi({
  reducerPath: 'venueApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://event-ticketing-backend-1df8.onrender.com/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,

  tagTypes: ['venues', 'venue'],

  endpoints: (builder) => ({
    // ➕ Create Venue
    createVenue: builder.mutation({
      query: (createVenuePayload) => ({
        url: 'venues',
        method: 'POST',
        body: createVenuePayload,
      }),
      invalidatesTags: [{ type: 'venues', id: 'LIST' }],
    }),

    // 🔄 Update Venue
    updateVenue: builder.mutation({
      query: ({ venueId, ...body }) => ({
        url: `venues/${venueId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { venueId }) => [
        { type: 'venues', id: venueId },
        { type: 'venues', id: 'LIST' },
      ],
    }),

    // 🗑️ Delete Venue
    deleteVenue: builder.mutation({
      query: (id) => ({
        url: `venues/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'venues', id },
        { type: 'venues', id: 'LIST' },
      ],
    }),

    // 📥 Get All Venues
    getAllVenues: builder.query({
      query: () => 'venues',
      providesTags: (result) =>
        result
          ? [
              ...result.map((venue: { venueId: number }) => ({
                type: 'venues' as const,
                id: venue.venueId,
              })),
              { type: 'venues', id: 'LIST' },
            ]
          : [{ type: 'venues', id: 'LIST' }],
    }),

    // 🔍 Get Venue By Name
    getVenueByName: builder.query({
      query: (name) => `venues/${name}`,
      providesTags: ['venue'],
    }),
  }),
});
