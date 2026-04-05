import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../App/store';

// Define the interface for the STK Push request to prevent type errors
interface StkPushPayload {
  phoneNumber: string;
  amount: number;
  bookingId: number;
  nationalId: number; // Added to match your component's requirements
}

export const mpesaApi = createApi({
  reducerPath: 'mpesaApi',
  baseQuery: fetchBaseQuery({
    // Using your Render backend URL
    baseUrl: 'https://event-ticketing-backend-1df8.onrender.com/api/',
    prepareHeaders: (headers, { getState }) => {
      // Correctly typed state access
      const token = (getState() as RootState).auth?.token;
      if (token) {
        headers.set('Authorization', `${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  tagTypes: ['bookings'],
  endpoints: (builder) => ({
    
    /**
     * 📱 Initiate STK Push
     * Triggers the M-Pesa PIN prompt on the user's mobile device.
     */
    initiateStkPush: builder.mutation<any, StkPushPayload>({
      query: (stkPayload) => ({
        url: 'mpesa/stk-push',
        method: 'POST',
        body: stkPayload,
      }),
      // Invalidates bookings so that once payment is confirmed, the UI can refresh
      invalidatesTags: ['bookings'],
    }),

    /**
     * 🔍 Check Payment Status
     * Poll the server to see if the callback has been processed.
     */
    checkPaymentStatus: builder.query<any, string>({
      query: (checkoutRequestID) => `mpesa/query/${checkoutRequestID}`,
      providesTags: ['bookings'],
    }),
  }),
});

// Export hooks for your React components
export const {
  useInitiateStkPushMutation,
  useCheckPaymentStatusQuery,
} = mpesaApi;