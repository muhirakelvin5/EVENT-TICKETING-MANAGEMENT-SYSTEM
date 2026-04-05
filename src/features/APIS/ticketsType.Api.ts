import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../App/store';

export const ticketApi = createApi({
  reducerPath: 'ticketApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://event-ticketing-backend-1-u7g4.onrender.com/api/', // Adjust to your backend URL
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,

  tagTypes: ['ticketTypes', 'ticketType'],
  endpoints: (builder) => ({
    // 📥 Get all Ticket Types
    getAllTicketTypes: builder.query({
      query: () => 'ticket-types',
      providesTags: ['ticketTypes'],
    }),

    // 📥 Get Ticket Type by ID
    getTicketTypeById: builder.query({
      query: (id) => `ticket-types/${id}`,
    }),

    // 📥 Get Ticket Types by Event ID
    getTicketTypesByEventId: builder.query({
      query: (eventId) => `ticket-types/event/${eventId}`,
      providesTags: ['ticketTypes'],
    }),

    // ➕ Create Ticket Type (admin only)
    createTicketType: builder.mutation({
      query: (createTicketTypePayload) => ({
        url: 'ticket-types',
        method: 'POST',
        body: createTicketTypePayload,
      }),
      invalidatesTags: ['ticketTypes'],
    }),

    // 🔄 Update Ticket Type (admin only)
    updateTicketType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `ticket-types/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ticketTypes'],
    }),

    // 🗑️ Delete Ticket Type (admin only)
    deleteTicketType: builder.mutation({
      query: (id) => ({
        url: `ticket-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ticketTypes'],
    }),
  }),
});

export const {
  useGetAllTicketTypesQuery,
  useGetTicketTypeByIdQuery,
  useGetTicketTypesByEventIdQuery,
  useCreateTicketTypeMutation,
  useUpdateTicketTypeMutation,
  useDeleteTicketTypeMutation,
} = ticketApi;
