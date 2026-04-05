import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TicketDocumentProps } from './types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    fontSize: 10,
    color: '#1A1A1A',
  },
  borderFrame: {
    border: '1.5pt solid #4f46e5',
    height: '100%',
    padding: 25,
    position: 'relative',
  },
  warningBanner: {
    backgroundColor: '#FEF2F2',
    border: '1pt solid #FECACA',
    color: '#991B1B',
    padding: 10,
    marginBottom: 20,
    textAlign: 'center',
    borderRadius: 4,
  },
  warningText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1pt solid #E5E7EB',
    paddingBottom: 15,
    marginBottom: 25,
  },
  brand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4f46e5',
    letterSpacing: -0.5,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
    padding: '4 10',
    borderRadius: 12,
    fontSize: 8,
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    color: '#111827',
  },
  metaSection: {
    flexDirection: 'row',
    marginBottom: 35,
    gap: 30,
  },
  infoBlock: {
    flex: 1,
  },
  label: {
    fontSize: 7,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 3,
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 15,
    borderTop: '0.5pt solid #E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #F3F4F6',
    paddingVertical: 10,
  },
  tableCellLabel: {
    flex: 1,
    fontSize: 9,
    color: '#4B5563',
  },
  tableCellValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '0.5pt solid #E5E7EB',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  securityNote: {
    marginTop: 'auto',
    paddingTop: 15,
    borderTop: '1pt dashed #E5E7EB',
    textAlign: 'center',
  },
  hash: {
    fontFamily: 'Courier',
    fontSize: 7,
    color: '#9CA3AF',
    marginTop: 4,
  },
  footer: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 15,
  }
});

const TicketDocument: React.FC<TicketDocumentProps> = ({
  user,
  event,
  ticketType,
  booking,
  total,
  paymentStatus,
}) => {
  const securityHash = `TXN-${booking.bookingId}-${user.nationalId}-${Date.now()}`.toUpperCase();

  return (
    <Document title={`PREVIEW_${event.title}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.borderFrame}>
          
          {/* Disclaimer Protocol */}
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              NOTICE: THIS IS A BOOKING SUMMARY / RECEIPT ONLY.
            </Text>
            <Text style={[styles.warningText, { fontSize: 7, marginTop: 2 }]}>
              THE OFFICIAL SCANNABLE TICKET HAS BEEN DISPATCHED TO YOUR REGISTERED EMAIL.
            </Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brand}>MADOLLAR TICKETS</Text>
            <View style={styles.statusBadge}>
              <Text>● {paymentStatus.toUpperCase()}</Text>
            </View>
          </View>

          {/* Event Info */}
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.metaSection}>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Attendee</Text>
              <Text style={styles.value}>{user.firstName} {user.lastName}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>National ID</Text>
              <Text style={styles.value}>{user.nationalId}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Booking Date</Text>
              <Text style={styles.value}>{new Date(booking.createdAt).toLocaleDateString('en-KE')}</Text>
            </View>
          </View>

          {/* Summary Table */}
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Category</Text>
              <Text style={styles.tableCellValue}>{ticketType.name}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Quantity</Text>
              <Text style={styles.tableCellValue}>{booking.quantity}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Reference ID</Text>
              <Text style={styles.tableCellValue}>#BK-{booking.bookingId}</Text>
            </View>
          </View>

          {/* Currency Display */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTAL PAID</Text>
            <Text style={styles.totalValue}>KSH {total.toLocaleString('en-KE')}</Text>
          </View>

          {/* Verification Section */}
          <View style={styles.securityNote}>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#4B5563' }}>DATA INTEGRITY VERIFIED</Text>
            <Text style={[styles.footer, { marginTop: 5, color: '#6B7280' }]}>
              Please present your Email Ticket for entry. This PDF is your proof of payment.
            </Text>
          </View>

        </View>Madollar Tickets
        <Text style={styles.footer}>
          Generated via  Systems © 2026 | Nyeri, Kenya
        </Text>
      </Page>
    </Document>
  );
};

export default TicketDocument;