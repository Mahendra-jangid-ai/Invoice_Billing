'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import {
  Document,
  Font,
  Image,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
  usePDF,
  type DocumentProps,
} from '@react-pdf/renderer'
import { Download, ExternalLink, Eye, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useBilling, Invoice } from '@/lib/context'
import { useFeedback } from '@/components/confirm-provider'
import { MobilePdfViewer } from '@/components/mobile-pdf-viewer'
import { InvoiceHtmlViewer } from '@/components/invoice-html-viewer'
import { useCompactInvoiceView } from '@/lib/invoice-view-mode'
import { buildInvoiceDisplayData, formatInvoiceCurrency, formatInvoiceCurrencyPlain, type InvoiceDisplayData } from '@/lib/invoice-display-data'
import { displayValue } from '@/lib/onboarding'
import { formatInr, INR_TEXT_CLASS } from '@/lib/format-inr'
import { cn } from '@/lib/utils'

function usePdfErrorPopup(error: string | null | undefined) {
  const { error: showError } = useFeedback()
  const lastShown = useRef<string | null>(null)

  useEffect(() => {
    if (!error) {
      lastShown.current = null
      return
    }
    if (error === lastShown.current) return

    lastShown.current = error
    showError({
      title: 'PDF generation failed',
      description: error,
    })
  }, [error, showError])
}

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmT.ttf',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjammT.ttf',
      fontWeight: 'bold',
    },
  ],
})

interface InvoicePreviewProps {
  invoice: Invoice
  mobileActions?: 'panel' | 'external'
  viewOpen?: boolean
  onViewOpenChange?: (open: boolean) => void
  onMobilePdfActions?: (actions: InvoicePdfMobileActions) => void
}

export interface InvoicePdfMobileActions {
  loading: boolean
  ready: boolean
  canView: boolean
  error?: string | null
  fileName: string
  handleView: () => void
  handleDownload: () => void
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 10,
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
    paddingBottom: 4,
    marginBottom: 4,
  },
  headerLeft: {
    width: '35%',
    justifyContent: 'center',
  },
  headerRight: {
    width: '65%',
    alignItems: 'flex-end',
  },
  logoWrapper: {
    maxWidth: 160,
    maxHeight: 80,
    alignSelf: 'flex-start',
  },
  logo: {
    width: 'auto',
    height: 'auto',
    resizeMode: 'contain',
  },
  logoPlaceholder: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#0f172a',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#0f172a',
    marginBottom: 3,
  },
  mutedText: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 2,
  },
  boldText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  banner: {
    backgroundColor: '#0f172a',
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  bannerSubtitle: {
    color: '#ffffff',
    fontSize: 7.5,
    opacity: 0.85,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  infoBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  infoBoxTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  infoBoxText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.4,
  },
  invoiceMeta: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  invoiceMetaLabel: {
    fontSize: 7.5,
    color: '#475569',
    width: '48%',
  },
  invoiceMetaValue: {
    fontSize: 8.5,
    color: '#0f172a',
    fontWeight: 'bold',
    width: '48%',
    textAlign: 'right',
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 9,
    color: '#475569',
    width: '42%',
  },
  value: {
    fontSize: 9,
    color: '#0f172a',
    width: '55%',
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  half: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontSize: 9.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#0f172a',
    marginBottom: 6,
  },
  table: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    minHeight: 20,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 7,
    fontWeight: 'bold',
    paddingVertical: 5,
    paddingHorizontal: 3,
    borderRightWidth: 1,
    borderRightColor: '#334155',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    minHeight: 22,
  },
  tableCell: {
    fontSize: 7.5,
    color: '#0f172a',
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  currencyCell: {
    fontSize: 7.5,
    color: '#0f172a',
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    whiteSpace: 'nowrap',
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 8.5,
    color: '#475569',
  },
  summaryValue: {
    fontSize: 8.5,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  summaryTotalLabel: {
    fontSize: 9.5,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  amountWordsBox: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  footerBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 8,
    backgroundColor: '#f8fafc',
  },
  footerTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0f172a',
  },
  signatureBox: {
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    marginTop: 16,
    paddingTop: 6,
  },
  totalBox: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  totalText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
})

function DefaultPdfLayout({ data }: { data: InvoiceDisplayData }) {
  const {
    invoice,
    company,
    companyName,
    companyAddress,
    companyGst,
    companyState,
    companyStateCode,
    contactLine,
    billTo,
    shipTo,
    subtotal,
    cgstPercentage,
    sgstPercentage,
    totalCgst,
    totalSgst,
    cashDiscountAmount,
    roundedNetTotal,
    amountInWords,
    lineItems,
  } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {company.logoUrl ? (
              <View style={styles.logoWrapper}>
                <Image src={company.logoUrl} style={styles.logo} />
              </View>
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.titleText}>{companyName}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerRight}>
            {company.logoUrl ? <Text style={styles.companyName}>{companyName}</Text> : null}
            <Text style={styles.mutedText}>{companyAddress}</Text>
            <Text style={styles.boldText}>GSTIN NO. : {companyGst}</Text>
            {contactLine ? <Text style={styles.mutedText}>{contactLine}</Text> : null}
          </View>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>Tax Invoice</Text>
          <Text style={styles.bannerSubtitle}>Original for Recipient</Text>
        </View>

        <View style={styles.topSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Supplier</Text>
            <Text style={styles.infoBoxText}>{companyName}</Text>
            <Text style={styles.infoBoxText}>{companyAddress}</Text>
            <Text style={styles.infoBoxText}>GSTIN: {companyGst}</Text>
            {contactLine ? <Text style={styles.infoBoxText}>{contactLine}</Text> : null}
          </View>

          <View style={styles.invoiceMeta}>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Invoice No</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.invoiceNumber || '-'}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Invoice Date</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>WO No.</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.woNumber || '-'}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Description</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.descriptionOfService || '-'}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Period of Service</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.periodOfService || '-'}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Charge Type</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.reverseCharge || 'No'}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Place of Supply</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.placeOfService || companyState}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Place of Supply Code</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.placeOfServiceCode || companyStateCode}</Text>
            </View>
          </View>
        </View>

        <View style={styles.twoColumn}>
          <View style={styles.half}>
            <Text style={styles.cardTitle}>Bill To</Text>
            <Text style={styles.boldText}>{billTo.name || '-'}</Text>
            <Text style={styles.mutedText}>{billTo.address || '-'}</Text>
            <Text style={styles.mutedText}>GSTIN: {billTo.gstin || '-'}</Text>
            <Text style={styles.mutedText}>State: {billTo.state || '-'} ({billTo.code || '-'})</Text>
          </View>
          <View style={styles.half}>
            <Text style={styles.cardTitle}>Ship To</Text>
            <Text style={styles.boldText}>{shipTo.name || billTo.name || '-'}</Text>
            <Text style={styles.mutedText}>{shipTo.address || billTo.address || '-'}</Text>
            <Text style={styles.mutedText}>GSTIN: {shipTo.gstin || billTo.gstin || '-'}</Text>
            <Text style={styles.mutedText}>State: {shipTo.state || billTo.state || '-'} ({shipTo.code || billTo.code || '-'})</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { width: 32 }]}>Sr.</Text>
            <Text style={[styles.tableHeaderCell, { width: 180 }]}>Description</Text>
            <Text style={[styles.tableHeaderCell, { width: 42 }]}>SAC</Text>
            <Text style={[styles.tableHeaderCell, { width: 36 }]}>Unit</Text>
            <Text style={[styles.tableHeaderCell, { width: 36 }]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, { width: 64 }]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, { width: 64 }]}>Taxable</Text>
            <Text style={[styles.tableHeaderCell, { width: 46 }]}>CGST</Text>
            <Text style={[styles.tableHeaderCell, { width: 46 }]}>SGST</Text>
            <Text style={[styles.tableHeaderCell, { width: 64 }]}>Total</Text>
          </View>

          {lineItems.map((item, index) => (
              <View
                key={item.index}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.tableRowEven : undefined,
                ]}
              >
                <Text style={[styles.tableCell, { width: 32, textAlign: 'center' }]}>{item.index}</Text>
                <Text style={[styles.tableCell, { width: 180 }]}>{item.description}</Text>
                <Text style={[styles.tableCell, { width: 42, textAlign: 'center' }]}>{item.sacCode}</Text>
                <Text style={[styles.tableCell, { width: 36, textAlign: 'center' }]}>{item.unit}</Text>
                <Text style={[styles.tableCell, { width: 36, textAlign: 'center' }]}>{item.qty}</Text>
                <Text style={[styles.currencyCell, { width: 64, textAlign: 'right' }]}>{item.rate ? formatInvoiceCurrency(item.rate) : '-'}</Text>
                <Text style={[styles.currencyCell, { width: 64, textAlign: 'right' }]}>{formatInvoiceCurrency(item.lineAmount)}</Text>
                <Text style={[styles.currencyCell, { width: 46, textAlign: 'right' }]}>{formatInvoiceCurrency(item.lineCgst)}</Text>
                <Text style={[styles.currencyCell, { width: 46, textAlign: 'right' }]}>{formatInvoiceCurrency(item.lineSgst)}</Text>
                <Text style={[styles.currencyCell, { width: 64, textAlign: 'right', borderRightWidth: 0 }]}>{formatInvoiceCurrency(item.lineTotal)}</Text>
              </View>
            ))}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Taxable Value</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Total CGST ({cgstPercentage}%)</Text>
            <Text style={styles.summaryValue}>₹{totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Total SGST ({sgstPercentage}%)</Text>
            <Text style={styles.summaryValue}>₹{totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Cash Discount</Text>
            <Text style={styles.summaryValue}>-₹{cashDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount Payable</Text>
            <Text style={styles.summaryTotalValue}>₹{roundedNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        <View style={styles.amountWordsBox}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 4 }}>Amount in Words</Text>
          <Text style={{ fontSize: 9, color: '#0f172a' }}>INR {amountInWords}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.footerBox}>
            <Text style={styles.footerTitle}>Bank Details</Text>
            <Text style={styles.mutedText}>Bank Name: {displayValue(company.bankName)}</Text>
            <Text style={styles.mutedText}>A/C Name: {displayValue(company.bankAccountName)}</Text>
            <Text style={styles.mutedText}>A/C No: {displayValue(company.bankAccountNumber)}</Text>
            <Text style={styles.mutedText}>IFSC: {displayValue(company.bankIfsc)}</Text>
            <Text style={styles.mutedText}>Branch: {displayValue(company.bankBranch)}</Text>
          </View>

          <View style={styles.footerBox}>
            <Text style={styles.footerTitle}>Terms & Signature</Text>
            <Text style={styles.mutedText}>Payment due within 15 days of invoice date. Late payment may attract interest.</Text>
            <View style={styles.signatureBox}>
              <Text style={{ fontSize: 9, color: '#0f172a', fontWeight: 'bold' }}>Authorised Signature</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

function ModernPdfLayout({ data }: { data: InvoiceDisplayData }) {
  const {
    invoice, company, companyName, companyAddress, companyGst, contactLine,
    billTo, shipTo, subtotal, cgstPercentage, sgstPercentage,
    totalCgst, totalSgst, cashDiscountAmount, roundedNetTotal, amountInWords, lineItems
  } = data

  const dateStr = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'

  const mStyles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#f8fafc', padding: 20, fontFamily: 'Roboto' },
    banner: { backgroundColor: '#2563eb', padding: 15, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 8, color: '#ffffff', marginBottom: 15 },
    bannerLeft: { width: '50%' },
    bannerRight: { width: '50%', alignItems: 'flex-end' },
    companyName: { fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    mutedTextWhite: { fontSize: 9, color: '#eff6ff', opacity: 0.9, marginBottom: 2 },
    invoiceTitle: { fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
    twoColumn: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 15 },
    half: { width: '48%' },
    cardTitle: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', color: '#2563eb', marginBottom: 4 },
    boldText: { fontSize: 11, fontWeight: 'bold', color: '#0f172a' },
    mutedText: { fontSize: 9, color: '#64748b', marginTop: 2 },
    table: { width: '100%', marginBottom: 15 },
    tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#bfdbfe', paddingBottom: 5, marginBottom: 5 },
    tableHeaderCell: { fontSize: 9, fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 5 },
    tableCell: { fontSize: 9, color: '#1e293b' },
    summaryContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 15 },
    summaryBox: { width: '50%', backgroundColor: '#eff6ff', padding: 12, borderRadius: 8 },
    summaryLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    summaryLabel: { fontSize: 9, color: '#475569' },
    summaryValue: { fontSize: 9, fontWeight: 'bold', color: '#0f172a' },
    summaryTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#bfdbfe' },
    summaryTotalLabel: { fontSize: 11, fontWeight: 'bold', color: '#1e3a8a' },
    summaryTotalValue: { fontSize: 11, fontWeight: 'bold', color: '#1e3a8a' },
    footer: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
    footerTitle: { fontSize: 9, fontWeight: 'bold', color: '#334155', marginBottom: 2 },
    signatureBox: { borderTopWidth: 1, borderTopColor: '#94a3b8', marginTop: 30, paddingTop: 4, width: 120, alignItems: 'center' },
  })

  return (
    <Document>
      <Page size="A4" style={mStyles.page}>
        <View style={mStyles.banner}>
          <View style={mStyles.bannerLeft}>
            <Text style={mStyles.companyName}>{companyName}</Text>
            <Text style={mStyles.mutedTextWhite}>{companyAddress}</Text>
            <Text style={mStyles.mutedTextWhite}>GSTIN: {companyGst}</Text>
          </View>
          <View style={mStyles.bannerRight}>
            <Text style={mStyles.invoiceTitle}>INVOICE</Text>
            <Text style={mStyles.mutedTextWhite}>No: {invoice.invoiceNumber || '-'}</Text>
            <Text style={mStyles.mutedTextWhite}>Date: {dateStr}</Text>
          </View>
        </View>

        <View style={mStyles.twoColumn}>
          <View style={mStyles.half}>
            <Text style={mStyles.cardTitle}>Billed To</Text>
            <Text style={mStyles.boldText}>{billTo.name || '-'}</Text>
            <Text style={mStyles.mutedText}>{billTo.address || '-'}</Text>
            <Text style={mStyles.mutedText}>GSTIN: {billTo.gstin || '-'}</Text>
          </View>
          <View style={mStyles.half}>
            <Text style={mStyles.cardTitle}>Shipped To</Text>
            <Text style={mStyles.boldText}>{shipTo.name || billTo.name || '-'}</Text>
            <Text style={mStyles.mutedText}>{shipTo.address || billTo.address || '-'}</Text>
            <Text style={mStyles.mutedText}>GSTIN: {shipTo.gstin || billTo.gstin || '-'}</Text>
          </View>
        </View>

        <View style={mStyles.table}>
          <View style={mStyles.tableHeaderRow}>
            <Text style={[mStyles.tableHeaderCell, { width: '40%' }]}>Item</Text>
            <Text style={[mStyles.tableHeaderCell, { width: '20%', textAlign: 'center' }]}>Qty</Text>
            <Text style={[mStyles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Rate</Text>
            <Text style={[mStyles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Total</Text>
          </View>
          {lineItems.map(item => (
            <View key={item.index} style={mStyles.tableRow}>
              <View style={{ width: '40%' }}>
                <Text style={[mStyles.tableCell, { fontWeight: 'bold' }]}>{item.description}</Text>
                <Text style={{ fontSize: 7, color: '#64748b' }}>SAC: {item.sacCode}</Text>
              </View>
              <Text style={[mStyles.tableCell, { width: '20%', textAlign: 'center' }]}>{item.qty} {item.unit}</Text>
              <Text style={[mStyles.tableCell, { width: '20%', textAlign: 'right' }]}>{item.rate ? formatInvoiceCurrency(item.rate) : '-'}</Text>
              <Text style={[mStyles.tableCell, { width: '20%', textAlign: 'right', fontWeight: 'bold' }]}>{formatInvoiceCurrency(item.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={mStyles.summaryContainer}>
          <View style={mStyles.summaryBox}>
            <View style={mStyles.summaryLine}>
              <Text style={mStyles.summaryLabel}>Subtotal</Text>
              <Text style={mStyles.summaryValue}>{formatInvoiceCurrencyPlain(subtotal)}</Text>
            </View>
            <View style={mStyles.summaryLine}>
              <Text style={mStyles.summaryLabel}>CGST ({cgstPercentage}%)</Text>
              <Text style={mStyles.summaryValue}>{formatInvoiceCurrencyPlain(totalCgst)}</Text>
            </View>
            <View style={mStyles.summaryLine}>
              <Text style={mStyles.summaryLabel}>SGST ({sgstPercentage}%)</Text>
              <Text style={mStyles.summaryValue}>{formatInvoiceCurrencyPlain(totalSgst)}</Text>
            </View>
            <View style={mStyles.summaryLine}>
              <Text style={mStyles.summaryLabel}>Discount</Text>
              <Text style={mStyles.summaryValue}>-{formatInvoiceCurrencyPlain(cashDiscountAmount)}</Text>
            </View>
            <View style={mStyles.summaryTotalRow}>
              <Text style={mStyles.summaryTotalLabel}>Total</Text>
              <Text style={mStyles.summaryTotalValue}>{formatInvoiceCurrencyPlain(roundedNetTotal)}</Text>
            </View>
          </View>
        </View>

        <View style={mStyles.footer}>
          <View style={{ width: '60%' }}>
            <Text style={mStyles.footerTitle}>Bank Details</Text>
            <Text style={mStyles.mutedText}>{displayValue(company.bankName)} • A/C: {displayValue(company.bankAccountNumber)}</Text>
            <Text style={mStyles.mutedText}>IFSC: {displayValue(company.bankIfsc)}</Text>
            <Text style={[mStyles.footerTitle, { marginTop: 10 }]}>Amount in Words</Text>
            <Text style={mStyles.mutedText}>INR {amountInWords}</Text>
          </View>
          <View style={{ width: '40%', alignItems: 'flex-end' }}>
            <Text style={mStyles.footerTitle}>Authorised Signatory</Text>
            <View style={mStyles.signatureBox}>
              <Text style={{ fontSize: 8, color: '#64748b' }}>Signature</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

function ClassicPdfLayout({ data }: { data: InvoiceDisplayData }) {
  const {
    invoice, company, companyName, companyAddress, companyGst, contactLine,
    billTo, shipTo, subtotal, cgstPercentage, sgstPercentage,
    totalCgst, totalSgst, cashDiscountAmount, roundedNetTotal, amountInWords, lineItems
  } = data

  const dateStr = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'

  const cStyles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 20, fontFamily: 'Times-Roman' },
    title: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', textDecoration: 'underline', marginBottom: 10 },
    borderBox: { borderWidth: 1, borderColor: '#000000', padding: 8, marginBottom: 10 },
    rowSpaceBetween: { flexDirection: 'row', justifyContent: 'space-between' },
    companyName: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    textSmall: { fontSize: 10 },
    textBold: { fontSize: 10, fontWeight: 'bold' },
    twoColumnBorder: { flexDirection: 'row', borderWidth: 1, borderColor: '#000000', marginBottom: 10 },
    colHalf: { width: '50%', padding: 8 },
    borderRight: { borderRightWidth: 1, borderRightColor: '#000000' },
    table: { borderWidth: 1, borderColor: '#000000', marginBottom: 10 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000' },
    tableHeaderCell: { fontSize: 10, fontWeight: 'bold', padding: 4, borderRightWidth: 1, borderRightColor: '#000000' },
    tableCell: { fontSize: 10, padding: 4, borderRightWidth: 1, borderRightColor: '#000000' },
    bottomSection: { flexDirection: 'row', borderWidth: 1, borderColor: '#000000' },
    bottomLeft: { width: '65%', padding: 8, borderRightWidth: 1, borderRightColor: '#000000', justifyContent: 'space-between' },
    bottomRight: { width: '35%', padding: 8 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  })

  return (
    <Document>
      <Page size="A4" style={cStyles.page}>
        <Text style={cStyles.title}>TAX INVOICE</Text>
        
        <View style={[cStyles.borderBox, cStyles.rowSpaceBetween]}>
          <View>
            <Text style={cStyles.companyName}>{companyName}</Text>
            <Text style={cStyles.textSmall}>{companyAddress}</Text>
            <Text style={cStyles.textBold}>GSTIN: {companyGst}</Text>
            {contactLine ? <Text style={cStyles.textSmall}>{contactLine}</Text> : null}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={cStyles.textSmall}><Text style={cStyles.textBold}>Invoice No:</Text> {invoice.invoiceNumber || '-'}</Text>
            <Text style={cStyles.textSmall}><Text style={cStyles.textBold}>Date:</Text> {dateStr}</Text>
          </View>
        </View>

        <View style={cStyles.twoColumnBorder}>
          <View style={[cStyles.colHalf, cStyles.borderRight]}>
            <Text style={[cStyles.textBold, { textDecoration: 'underline', marginBottom: 4 }]}>Billed To:</Text>
            <Text style={cStyles.textBold}>{billTo.name || '-'}</Text>
            <Text style={cStyles.textSmall}>{billTo.address || '-'}</Text>
            <Text style={cStyles.textSmall}>GSTIN: {billTo.gstin || '-'}</Text>
          </View>
          <View style={cStyles.colHalf}>
            <Text style={[cStyles.textBold, { textDecoration: 'underline', marginBottom: 4 }]}>Shipped To:</Text>
            <Text style={cStyles.textBold}>{shipTo.name || billTo.name || '-'}</Text>
            <Text style={cStyles.textSmall}>{shipTo.address || billTo.address || '-'}</Text>
            <Text style={cStyles.textSmall}>GSTIN: {shipTo.gstin || billTo.gstin || '-'}</Text>
          </View>
        </View>

        <View style={cStyles.table}>
          <View style={cStyles.tableRow}>
            <Text style={[cStyles.tableHeaderCell, { width: '10%', textAlign: 'center' }]}>S.N.</Text>
            <Text style={[cStyles.tableHeaderCell, { width: '40%' }]}>Particulars</Text>
            <Text style={[cStyles.tableHeaderCell, { width: '15%', textAlign: 'center' }]}>Qty</Text>
            <Text style={[cStyles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>Rate</Text>
            <Text style={[cStyles.tableHeaderCell, { width: '20%', textAlign: 'right', borderRightWidth: 0 }]}>Amount</Text>
          </View>
          {lineItems.map(item => (
            <View key={item.index} style={cStyles.tableRow}>
              <Text style={[cStyles.tableCell, { width: '10%', textAlign: 'center' }]}>{item.index}</Text>
              <Text style={[cStyles.tableCell, { width: '40%' }]}>{item.description}</Text>
              <Text style={[cStyles.tableCell, { width: '15%', textAlign: 'center' }]}>{item.qty} {item.unit}</Text>
              <Text style={[cStyles.tableCell, { width: '15%', textAlign: 'right' }]}>{item.rate ? formatInvoiceCurrency(item.rate) : '-'}</Text>
              <Text style={[cStyles.tableCell, { width: '20%', textAlign: 'right', borderRightWidth: 0 }]}>{formatInvoiceCurrency(item.lineAmount)}</Text>
            </View>
          ))}
        </View>

        <View style={cStyles.bottomSection}>
          <View style={cStyles.bottomLeft}>
            <View>
              <Text style={[cStyles.textBold, { textDecoration: 'underline' }]}>Amount in Words:</Text>
              <Text style={cStyles.textSmall}>INR {amountInWords}</Text>
            </View>
            <View style={{ marginTop: 20 }}>
              <Text style={[cStyles.textBold, { textDecoration: 'underline' }]}>Bank Details:</Text>
              <Text style={cStyles.textSmall}>Bank: {displayValue(company.bankName)}</Text>
              <Text style={cStyles.textSmall}>A/C No: {displayValue(company.bankAccountNumber)} | IFSC: {displayValue(company.bankIfsc)}</Text>
            </View>
          </View>
          <View style={cStyles.bottomRight}>
            <View style={cStyles.summaryRow}><Text style={cStyles.textSmall}>Subtotal:</Text><Text style={cStyles.textSmall}>{formatInvoiceCurrencyPlain(subtotal)}</Text></View>
            <View style={cStyles.summaryRow}><Text style={cStyles.textSmall}>CGST:</Text><Text style={cStyles.textSmall}>{formatInvoiceCurrencyPlain(totalCgst)}</Text></View>
            <View style={cStyles.summaryRow}><Text style={cStyles.textSmall}>SGST:</Text><Text style={cStyles.textSmall}>{formatInvoiceCurrencyPlain(totalSgst)}</Text></View>
            <View style={cStyles.summaryRow}><Text style={cStyles.textSmall}>Discount:</Text><Text style={cStyles.textSmall}>-{formatInvoiceCurrencyPlain(cashDiscountAmount)}</Text></View>
            <View style={[cStyles.summaryRow, { borderTopWidth: 1, paddingTop: 4, marginTop: 4 }]}><Text style={cStyles.textBold}>Grand Total:</Text><Text style={cStyles.textBold}>{formatInvoiceCurrencyPlain(roundedNetTotal)}</Text></View>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', marginTop: 20 }}>
          <Text style={cStyles.textBold}>For {companyName}</Text>
          <Text style={{ marginTop: 40, fontSize: 10 }}>Authorised Signatory</Text>
        </View>
      </Page>
    </Document>
  )
}

function DetailedPdfLayout({ data }: { data: InvoiceDisplayData }) {
  const { invoice, company, companyName, companyAddress, companyGst, contactLine, companyState, companyStateCode } = data
  const invoiceDate = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '-'

  const dStyles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 20, fontFamily: 'Roboto' },
    mainBox: { borderWidth: 2, borderColor: '#000000' },
    textCenter: { textAlign: 'center' },
    textBold: { fontWeight: 'bold' },
    textSm: { fontSize: 8 },
    textXs: { fontSize: 7 },
    textLg: { fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase' },
    headerTitleBox: { padding: 8, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#000000' },
    invoiceBanner: { backgroundColor: '#e5e7eb', textAlign: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#000000' },
    rowSplit: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000' },
    colHalf: { width: '50%' },
    borderRight: { borderRightWidth: 1, borderRightColor: '#000000' },
    kvRow: { flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: '#000000' },
    kvRowNoBorder: { flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 2 },
    kCol: { width: '35%', fontWeight: 'bold' },
    vCol: { width: '65%' },
    partyHeader: { backgroundColor: '#e5e7eb', textAlign: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#000000', fontWeight: 'bold' },
    tableHeaderRow: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderBottomWidth: 1, borderBottomColor: '#000000' },
    tableHeaderCell: { fontWeight: 'bold', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000', paddingVertical: 4, paddingHorizontal: 2 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000' },
    tableCell: { textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000', paddingVertical: 4, paddingHorizontal: 2 },
    tableCellLeft: { textAlign: 'left', borderRightWidth: 1, borderRightColor: '#000000', paddingVertical: 4, paddingHorizontal: 2 },
    tableCellRight: { textAlign: 'right', borderRightWidth: 1, borderRightColor: '#000000', paddingVertical: 4, paddingHorizontal: 2 },
  })

  return (
    <Document>
      <Page size="A4" style={dStyles.page}>
        <View style={dStyles.mainBox}>
          {/* Header */}
          {company.logoUrl ? (
            <View style={[dStyles.headerTitleBox, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View style={{ width: '30%', alignItems: 'flex-start' }}>
                <Image src={company.logoUrl} style={{ maxHeight: 60, objectFit: 'contain' }} />
              </View>
              <View style={{ width: '70%', alignItems: 'flex-end' }}>
                <Text style={dStyles.textLg}>{companyName}</Text>
                <Text style={[dStyles.textSm, { textAlign: 'right' }]}>{companyAddress}</Text>
                <Text style={[dStyles.textSm, dStyles.textBold, { marginTop: 2 }]}>GSTIN NO. : {companyGst}</Text>
                {contactLine ? <Text style={[dStyles.textSm, dStyles.textBold, { marginTop: 2 }]}>{contactLine}</Text> : null}
              </View>
            </View>
          ) : (
            <View style={dStyles.headerTitleBox}>
              <Text style={dStyles.textLg}>{companyName}</Text>
              <Text style={[dStyles.textSm, dStyles.textCenter]}>{companyAddress}</Text>
              <Text style={[dStyles.textSm, dStyles.textBold, dStyles.textCenter, { marginTop: 2 }]}>GSTIN NO. : {companyGst}</Text>
              {contactLine ? <Text style={[dStyles.textSm, dStyles.textBold, dStyles.textCenter, { marginTop: 2 }]}>{contactLine}</Text> : null}
            </View>
          )}
          
          <Text style={[dStyles.invoiceBanner, dStyles.textSm, dStyles.textBold]}>Invoice</Text>

          {/* Invoice Meta Grid */}
          <View style={dStyles.rowSplit}>
            <View style={[dStyles.colHalf, dStyles.borderRight]}>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, dStyles.kCol]}>Invoice:</Text><Text style={[dStyles.textSm, dStyles.vCol]}>{invoice.invoiceNumber || '-'}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, dStyles.kCol]}>Date:</Text><Text style={[dStyles.textSm, dStyles.vCol]}>{invoiceDate}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, dStyles.kCol]}>Reverse Charge (Y/N):</Text><Text style={[dStyles.textSm, dStyles.vCol]}>{invoice.reverseCharge || 'No'}</Text></View>
              <View style={[dStyles.kvRowNoBorder, { justifyContent: 'space-between' }]}>
                <Text style={[dStyles.textSm, dStyles.textBold]}>State: {companyState || '-'}</Text>
                <Text style={[dStyles.textSm, dStyles.textBold, { borderLeftWidth: 1, borderLeftColor: '#000000', paddingLeft: 4 }]}>Code: {companyStateCode || '-'}</Text>
              </View>
            </View>
            <View style={dStyles.colHalf}>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, dStyles.kCol]}>WO No:</Text><Text style={[dStyles.textSm, dStyles.vCol]}>{invoice.woNumber || '-'}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, dStyles.kCol]}>Description of Service:</Text><Text style={[dStyles.textSm, dStyles.vCol]}>{invoice.descriptionOfService || '-'}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, dStyles.kCol]}>Period of Service:</Text><Text style={[dStyles.textSm, dStyles.vCol]}>{invoice.periodOfService || '-'}</Text></View>
              <View style={dStyles.kvRowNoBorder}><Text style={[dStyles.textSm, dStyles.kCol]}>Place of Service:</Text><Text style={[dStyles.textSm, dStyles.vCol]}>{invoice.placeOfService || '-'}</Text></View>
            </View>
          </View>

          {/* Parties Header */}
          <View style={dStyles.rowSplit}>
            <Text style={[dStyles.colHalf, dStyles.borderRight, dStyles.partyHeader, dStyles.textSm]}>Bill to Party</Text>
            <Text style={[dStyles.colHalf, dStyles.partyHeader, dStyles.textSm]}>Ship to Party (Site Address)</Text>
          </View>

          {/* Parties Grid */}
          <View style={dStyles.rowSplit}>
            <View style={[dStyles.colHalf, dStyles.borderRight]}>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, { width: '20%', fontWeight: 'bold' }]}>Name:</Text><Text style={[dStyles.textSm, dStyles.textBold, { width: '80%' }]}>{data.billTo.name || '-'}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, { width: '20%', fontWeight: 'bold' }]}>Address:</Text><Text style={[dStyles.textSm, { width: '80%' }]}>{data.billTo.address || '-'}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, { width: '20%', fontWeight: 'bold' }]}>GSTIN:</Text><Text style={[dStyles.textSm, dStyles.textBold, { width: '80%' }]}>{data.billTo.gstin || '-'}</Text></View>
              <View style={[dStyles.kvRowNoBorder, { justifyContent: 'space-between' }]}>
                <Text style={[dStyles.textSm, dStyles.textBold]}>State: {data.billTo.state || '-'}</Text>
                <Text style={[dStyles.textSm, dStyles.textBold, { borderLeftWidth: 1, borderLeftColor: '#000000', paddingLeft: 4 }]}>Code: {data.billTo.code || '-'}</Text>
              </View>
            </View>
            <View style={dStyles.colHalf}>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, { width: '20%', fontWeight: 'bold' }]}>Name:</Text><Text style={[dStyles.textSm, dStyles.textBold, { width: '80%' }]}>{data.shipTo.name || data.billTo.name || '-'}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, { width: '20%', fontWeight: 'bold' }]}>Address:</Text><Text style={[dStyles.textSm, { width: '80%' }]}>{data.shipTo.address || data.billTo.address || '-'}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textSm, { width: '20%', fontWeight: 'bold' }]}>GSTIN:</Text><Text style={[dStyles.textSm, dStyles.textBold, { width: '80%' }]}>{data.shipTo.gstin || data.billTo.gstin || '-'}</Text></View>
              <View style={[dStyles.kvRowNoBorder, { justifyContent: 'space-between' }]}>
                <Text style={[dStyles.textSm, dStyles.textBold]}>State: {data.shipTo.state || data.billTo.state || '-'}</Text>
                <Text style={[dStyles.textSm, dStyles.textBold, { borderLeftWidth: 1, borderLeftColor: '#000000', paddingLeft: 4 }]}>Code: {data.shipTo.code || data.billTo.code || '-'}</Text>
              </View>
            </View>
          </View>

          {/* Table Header Row 1 */}
          <View style={dStyles.tableHeaderRow}>
            <Text style={[dStyles.textXs, dStyles.tableHeaderCell, { width: '5%', paddingTop: 10 }]}>Sr. No.</Text>
            <Text style={[dStyles.textXs, dStyles.tableHeaderCell, { width: '20%', textAlign: 'left', paddingTop: 10 }]}>Product Description</Text>
            <Text style={[dStyles.textXs, dStyles.tableHeaderCell, { width: '6%', paddingTop: 10 }]}>SAC</Text>
            <Text style={[dStyles.textXs, dStyles.tableHeaderCell, { width: '6%', paddingTop: 10 }]}>Unit</Text>
            <Text style={[dStyles.textXs, dStyles.tableHeaderCell, { width: '5%', paddingTop: 10 }]}>Qty</Text>
            <Text style={[dStyles.textXs, dStyles.tableHeaderCell, { width: '7%', textAlign: 'right', paddingTop: 10 }]}>Rate</Text>
            <Text style={[dStyles.textXs, dStyles.tableHeaderCell, { width: '9%', textAlign: 'right', paddingTop: 10 }]}>Amount</Text>
            <Text style={[dStyles.textXs, dStyles.tableHeaderCell, { width: '8%', textAlign: 'right', paddingTop: 10 }]}>Taxable</Text>
            <View style={{ width: '11%', borderRightWidth: 1, borderRightColor: '#000000', paddingHorizontal: 0 }}>
              <Text style={[dStyles.textXs, { fontWeight: 'bold', textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#000000', paddingVertical: 2 }]}>CGST</Text>
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <Text style={[dStyles.textXs, { width: '36.3%', fontWeight: 'bold', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000', paddingTop: 2 }]}>Rate</Text>
                <Text style={[dStyles.textXs, { width: '63.7%', fontWeight: 'bold', textAlign: 'right', paddingTop: 2, paddingRight: 2 }]}>Amount</Text>
              </View>
            </View>
            <View style={{ width: '11%', borderRightWidth: 1, borderRightColor: '#000000', paddingHorizontal: 0 }}>
              <Text style={[dStyles.textXs, { fontWeight: 'bold', textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#000000', paddingVertical: 2 }]}>SGST</Text>
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <Text style={[dStyles.textXs, { width: '36.3%', fontWeight: 'bold', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000', paddingTop: 2 }]}>Rate</Text>
                <Text style={[dStyles.textXs, { width: '63.7%', fontWeight: 'bold', textAlign: 'right', paddingTop: 2, paddingRight: 2 }]}>Amount</Text>
              </View>
            </View>
            <Text style={[dStyles.textXs, dStyles.tableHeaderCell, { width: '12%', textAlign: 'right', borderRightWidth: 0, paddingTop: 10 }]}>Total</Text>
          </View>

          {/* Table Items */}
          {data.lineItems.map((item, i) => (
            <View key={item.index} style={dStyles.tableRow}>
              <Text style={[dStyles.textXs, dStyles.tableCell, { width: '5%' }]}>{item.index}</Text>
              <Text style={[dStyles.textXs, dStyles.tableCellLeft, { width: '20%' }]}>{item.description}</Text>
              <Text style={[dStyles.textXs, dStyles.tableCell, { width: '6%' }]}>{item.sacCode}</Text>
              <Text style={[dStyles.textXs, dStyles.tableCell, { width: '6%' }]}>{item.unit}</Text>
              <Text style={[dStyles.textXs, dStyles.tableCell, { width: '5%' }]}>{item.qty}</Text>
              <Text style={[dStyles.textXs, dStyles.tableCellRight, { width: '7%' }]}>{item.rate ? formatInvoiceCurrencyPlain(item.rate) : '-'}</Text>
              <Text style={[dStyles.textXs, dStyles.tableCellRight, { width: '9%' }]}>{formatInvoiceCurrencyPlain(item.lineAmount)}</Text>
              <Text style={[dStyles.textXs, dStyles.tableCellRight, { width: '8%' }]}>{formatInvoiceCurrencyPlain(item.lineAmount)}</Text>
              <Text style={[dStyles.textXs, dStyles.tableCell, { width: '4%' }]}>{data.cgstPercentage}%</Text>
              <Text style={[dStyles.textXs, dStyles.tableCellRight, { width: '7%' }]}>{formatInvoiceCurrencyPlain(item.lineCgst)}</Text>
              <Text style={[dStyles.textXs, dStyles.tableCell, { width: '4%' }]}>{data.sgstPercentage}%</Text>
              <Text style={[dStyles.textXs, dStyles.tableCellRight, { width: '7%' }]}>{formatInvoiceCurrencyPlain(item.lineSgst)}</Text>
              <Text style={[dStyles.textXs, dStyles.tableCellRight, { width: '12%', borderRightWidth: 0 }]}>{formatInvoiceCurrencyPlain(item.lineTotal)}</Text>
            </View>
          ))}
          
          {/* Table Totals Row */}
          <View style={dStyles.tableRow}>
            <Text style={[dStyles.textXs, dStyles.tableCell, dStyles.textBold, { width: '58%', textAlign: 'right', paddingRight: 4 }]}>Total</Text>
            <Text style={[dStyles.textXs, dStyles.tableCell, { width: '8%' }]}></Text>
            <Text style={[dStyles.textXs, dStyles.tableCell, { width: '4%' }]}></Text>
            <Text style={[dStyles.textXs, dStyles.tableCellRight, dStyles.textBold, { width: '7%' }]}>{formatInvoiceCurrencyPlain(data.totalCgst)}</Text>
            <Text style={[dStyles.textXs, dStyles.tableCell, { width: '4%' }]}></Text>
            <Text style={[dStyles.textXs, dStyles.tableCellRight, dStyles.textBold, { width: '7%' }]}>{formatInvoiceCurrencyPlain(data.totalSgst)}</Text>
            <Text style={[dStyles.textXs, dStyles.tableCellRight, { width: '12%', borderRightWidth: 0 }]}></Text>
          </View>

          {/* Amounts Grid */}
          <View style={dStyles.rowSplit}>
            <View style={{ width: '66%', borderRightWidth: 1, borderRightColor: '#000000' }}>
              <Text style={[dStyles.textSm, dStyles.textBold, dStyles.partyHeader]}>Total Invoice amount in words</Text>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[dStyles.textSm, dStyles.textBold, dStyles.textCenter]}>{data.amountInWords} Only</Text>
              </View>
            </View>
            <View style={{ width: '34%' }}>
              <View style={dStyles.kvRow}><Text style={[dStyles.textXs, dStyles.textBold, { width: '60%' }]}>Total Amount before Tax</Text><Text style={[dStyles.textXs, dStyles.textBold, { width: '40%', textAlign: 'right' }]}>{formatInvoiceCurrencyPlain(data.subtotal)}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textXs, dStyles.textBold, { width: '60%' }]}>Add: CGST</Text><Text style={[dStyles.textXs, { width: '40%', textAlign: 'right' }]}>{formatInvoiceCurrencyPlain(data.totalCgst)}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textXs, dStyles.textBold, { width: '60%' }]}>Add: SGST</Text><Text style={[dStyles.textXs, { width: '40%', textAlign: 'right' }]}>{formatInvoiceCurrencyPlain(data.totalSgst)}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textXs, dStyles.textBold, { width: '60%' }]}>Total Tax Amount</Text><Text style={[dStyles.textXs, { width: '40%', textAlign: 'right' }]}>{formatInvoiceCurrencyPlain(data.totalCgst + data.totalSgst)}</Text></View>
              <View style={dStyles.kvRow}><Text style={[dStyles.textXs, dStyles.textBold, { width: '60%' }]}>Discount</Text><Text style={[dStyles.textXs, { width: '40%', textAlign: 'right' }]}>-{formatInvoiceCurrencyPlain(data.cashDiscountAmount)}</Text></View>
              <View style={dStyles.kvRowNoBorder}><Text style={[dStyles.textSm, dStyles.textBold, { width: '60%' }]}>Total Amount after Tax:</Text><Text style={[dStyles.textSm, dStyles.textBold, { width: '40%', textAlign: 'right' }]}>{formatInvoiceCurrencyPlain(data.roundedNetTotal)}</Text></View>
            </View>
          </View>

          {/* Footer Grid */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '66%', borderRightWidth: 1, borderRightColor: '#000000' }}>
              <Text style={[dStyles.textSm, dStyles.textBold, dStyles.partyHeader]}>Bank Details</Text>
              <View style={{ padding: 4 }}>
                <Text style={[dStyles.textXs, dStyles.textBold, { marginBottom: 2 }]}>Bank Name: {displayValue(company.bankName)}</Text>
                <Text style={[dStyles.textXs, dStyles.textBold, { marginBottom: 2 }]}>Bank A/c Name: {displayValue(company.bankAccountName)} A/c No. {displayValue(company.bankAccountNumber)}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={[dStyles.textXs, dStyles.textBold, { marginRight: 20 }]}>Bank IFSC code: {displayValue(company.bankIfsc)}</Text>
                  <Text style={[dStyles.textXs, dStyles.textBold]}>Branch: {displayValue(company.bankBranch)}</Text>
                </View>
              </View>
            </View>
            <View style={{ width: '12%', borderRightWidth: 1, borderRightColor: '#000000', justifyContent: 'flex-end', padding: 4 }}>
              <Text style={[dStyles.textXs, dStyles.textCenter]}>Common Seal</Text>
            </View>
            <View style={{ width: '22%', padding: 4 }}>
              <Text style={[dStyles.textXs, dStyles.textBold, dStyles.textCenter]}>For {companyName}</Text>
              <Text style={[dStyles.textXs, dStyles.textBold, dStyles.textCenter, { marginTop: 40 }]}>Authorised signatory</Text>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  )
}

function InvoicePdfDocument({ data }: { data: InvoiceDisplayData }) {
  const layout = data.company.invoiceLayout || 'default'
  if (layout === 'modern') return <ModernPdfLayout data={data} />
  if (layout === 'classic') return <ClassicPdfLayout data={data} />
  if (layout === 'detailed') return <DetailedPdfLayout data={data} />
  return <DefaultPdfLayout data={data} />
}

function DesktopPdfActions({
  pdfDocument,
  invoiceNumber,
  className = '',
}: {
  pdfDocument: ReactElement<DocumentProps>
  invoiceNumber?: string
  className?: string
}) {
  const [instance, updateInstance] = usePDF()
  const [viewerOpen, setViewerOpen] = useState(false)
  usePdfErrorPopup(instance.error)

  useEffect(() => {
    updateInstance(pdfDocument)
  }, [pdfDocument, updateInstance])

  const fileName = `${invoiceNumber || 'invoice'}.pdf`

  const handleOpen = () => {
    setViewerOpen(true)
  }

  const handleDownload = () => {
    if (!instance.blob) return
    const url = URL.createObjectURL(instance.blob)
    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    window.document.body.appendChild(anchor)
    anchor.click()
    window.document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  if (instance.loading) {
    return (
      <div className={`inline-flex items-center gap-2 text-sm text-[#6B7280] ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
        Preparing PDF…
      </div>
    )
  }

  if (instance.error) {
    return <p className={`text-sm text-slate-500 ${className}`}>Could not generate PDF. Please try again.</p>
  }

  return (
    <>
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
      >
        <ExternalLink className="h-4 w-4" />
        Open
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={!instance.blob}
        className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB] disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Download
      </button>
    </div>
    <MobilePdfViewer
      pdfDocument={pdfDocument}
      fileName={fileName}
      open={viewerOpen}
      onClose={() => setViewerOpen(false)}
    />
    </>
  )
}

const STATUS_STYLES = {
  draft: { label: 'Draft', cls: 'badge badge-gray' },
  finalized: { label: 'Finalized', cls: 'badge badge-blue' },
  paid: { label: 'Paid', cls: 'badge badge-green' },
} as const

function MobileInvoicePdfPanel({
  invoice,
  pdfDocument,
  invoiceNumber,
  date,
  status,
  customerName,
  totalAmount,
  showActions = true,
  viewOpen,
  onViewOpenChange,
  onActionsReady,
}: {
  invoice: Invoice
  pdfDocument: ReactElement<DocumentProps>
  invoiceNumber?: string
  date?: string
  status?: 'draft' | 'finalized' | 'paid'
  customerName?: string
  totalAmount?: number
  showActions?: boolean
  viewOpen?: boolean
  onViewOpenChange?: (open: boolean) => void
  onActionsReady?: (actions: InvoicePdfMobileActions) => void
}) {
  const [instance, updateInstance] = usePDF()
  const [downloadState, setDownloadState] = useState<'idle' | 'done'>('idle')
  const [internalViewerOpen, setInternalViewerOpen] = useState(false)
  const viewerControlledOnPage = onViewOpenChange !== undefined && !showActions
  const viewerOpen = viewerControlledOnPage ? Boolean(viewOpen) : internalViewerOpen
  const setViewerOpen = viewerControlledOnPage ? onViewOpenChange! : setInternalViewerOpen
  usePdfErrorPopup(instance.error)

  useEffect(() => {
    updateInstance(pdfDocument)
  }, [pdfDocument, updateInstance])

  const fileName = `${invoiceNumber || 'invoice'}.pdf`
  const statusMeta = status ? STATUS_STYLES[status] : null
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const formattedTotal = typeof totalAmount === 'number'
    ? formatInr(totalAmount, { maximumFractionDigits: 0 })
    : '—'

  const handleView = useCallback(() => {
    setViewerOpen(true)
  }, [setViewerOpen])

  const handleDownload = useCallback(() => {
    if (!instance.blob) return
    const url = URL.createObjectURL(instance.blob)
    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    window.document.body.appendChild(anchor)
    anchor.click()
    window.document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    setDownloadState('done')
    window.setTimeout(() => setDownloadState('idle'), 2500)
  }, [instance.blob, fileName])

  useEffect(() => {
    if (!onActionsReady) return
    onActionsReady({
      loading: instance.loading,
      ready: Boolean(instance.blob) && !instance.loading && !instance.error,
      canView: true,
      error: instance.error,
      fileName,
      handleView,
      handleDownload,
    })
  }, [
    instance.loading,
    instance.blob,
    instance.error,
    onActionsReady,
    handleView,
    handleDownload,
    fileName,
  ])

  return (
    <>
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] px-4 py-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">Invoice</p>
            <h3 className="mt-1 truncate text-lg font-bold">{invoiceNumber || 'Invoice'}</h3>
            <p className="mt-1 truncate text-sm text-blue-100">{customerName || 'Customer'}</p>
          </div>
          {statusMeta && <span className={`${statusMeta.cls} shrink-0`}>{statusMeta.label}</span>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-wide text-blue-100">Date</p>
            <p className="mt-0.5 text-sm font-semibold">{formattedDate}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-wide text-blue-100">Amount</p>
            <p className={cn('mt-0.5 text-sm font-semibold', INR_TEXT_CLASS)}>{formattedTotal}</p>
          </div>
        </div>
      </div>

      {showActions ? (
        <div className="p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</p>

          {instance.loading ? (
          <div className="space-y-3">
            {[0, 1].map((key) => (
              <div
                key={key}
                className="flex animate-pulse items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 rounded-full bg-slate-200" />
                  <div className="h-3 w-40 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
            <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Preparing your invoice…
            </p>
          </div>
        ) : instance.error ? (
          <p className="text-center text-sm text-slate-500">Could not generate PDF. Please try again.</p>
        ) : instance.url ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleView}
              className="group flex w-full items-center gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4 text-left shadow-sm transition active:scale-[0.98]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-md shadow-blue-200">
                <Eye className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">View Invoice</p>
                <p className="mt-0.5 text-xs text-slate-500">Full-screen preview in the app</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.98]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                {downloadState === 'done' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {downloadState === 'done' ? 'Download started' : 'Download PDF'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {downloadState === 'done' ? 'Check your downloads folder' : 'Save a copy to your phone'}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
            </button>
          </div>
        ) : null}
        </div>
      ) : instance.loading ? (
        <div className="border-t border-white/15 px-4 py-2">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-blue-100">
            <Loader2 className="h-3 w-3 animate-spin" />
            Preparing PDF…
          </p>
        </div>
      ) : null}
    </div>
    <InvoiceHtmlViewer
      invoice={invoice}
      open={viewerOpen}
      onClose={() => setViewerOpen(false)}
    />
    </>
  )
}

export function InvoicePreview({
  invoice,
  mobileActions = 'panel',
  viewOpen,
  onViewOpenChange,
  onMobilePdfActions,
}: InvoicePreviewProps) {
  const { customers, company } = useBilling()

  const displayData = useMemo(
    () => buildInvoiceDisplayData(invoice, company, customers),
    [invoice, company, customers],
  )

  const pdfDocument = useMemo(
    () => <InvoicePdfDocument data={displayData} />,
    [displayData],
  )

  const displayTotal = displayData.roundedNetTotal

  const compactView = useCompactInvoiceView()

  if (compactView) {
    return (
      <MobileInvoicePdfPanel
        invoice={invoice}
        pdfDocument={pdfDocument}
        invoiceNumber={invoice.invoiceNumber}
        date={invoice.date}
        status={invoice.status}
        customerName={displayData.billTo.name}
        totalAmount={displayTotal}
        showActions={mobileActions === 'panel'}
        viewOpen={viewOpen}
        onViewOpenChange={onViewOpenChange}
        onActionsReady={mobileActions === 'external' ? onMobilePdfActions : undefined}
      />
    )
  }

  return (
    <div className="premium-card w-full p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[#374151]">PDF Preview</div>
        <DesktopPdfActions
          pdfDocument={pdfDocument}
          invoiceNumber={invoice.invoiceNumber}
          className="justify-end"
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-2">
        <PDFViewer style={{ width: '100%', height: '1000px', backgroundColor: '#ffffff' }}>
          {pdfDocument}
        </PDFViewer>
      </div>
    </div>
  )
}
