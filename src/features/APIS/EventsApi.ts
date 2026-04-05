import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../App/store';

export const eventApi = createApi({
  reducerPath: 'eventApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://event-ticketing-backend-1df8.onrender.com/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `${token}`); // Add Bearer if needed
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,

  tagTypes: ['events', 'event'],
  endpoints: (builder) => ({
    // ➕ Create Event
    createEvent: builder.mutation({
      query: (createEventPayload) => ({
        url: 'events',
        method: 'POST',
        body: createEventPayload,
      }),
      invalidatesTags: ['events']
    }),

    // 🔄 Update Event
    updateEvent: builder.mutation({
      query: ({ eventId, ...body }) => ({
        url: `events/${eventId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['events']
    }),

    // 📥 Get All Events
    getAllEvents: builder.query({
      query: () => 'events',
      providesTags: ['events']
    }),

    // 📥 Get One Event By ID
    getEventById: builder.query({
      query: (eventId) => `events/${eventId}`,
    }),

    // 🔍 Search by Title
    getEventsByTitle: builder.query({
      query: (title) => `events-search-title?title=${title}`,
      providesTags: ['events']
    }),

    // 🔍 Search by Category
    getEventsByCategory: builder.query({
      query: (category) => `events-search-category?category=${category}`,
      providesTags: ['events']
    }),

    // 🗑️ Delete Event
    deleteEvent: builder.mutation({
      query: (eventId) => ({
        url: `events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['events']
    }),
  }),
});
