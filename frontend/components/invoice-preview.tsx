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
import { useIsInstalledPwa } from '@/lib/use-installed-pwa'

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

function detectMobilePdfFallback(): boolean {
  if (typeof window === 'undefined') return false
  if (document.documentElement.dataset.pwaShell === 'true') return true
  const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const narrowScreen = window.matchMedia('(max-width: 768px)').matches
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  return standalone || mobileUa || (touchDevice && narrowScreen)
}

function useMobilePdfFallback() {
  const [isMobile, setIsMobile] = useState(detectMobilePdfFallback)

  useEffect(() => {
    setIsMobile(detectMobilePdfFallback())
  }, [])

  return isMobile
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
  onMobilePdfActions?: (actions: InvoicePdfMobileActions) => void
}

export interface InvoicePdfMobileActions {
  loading: boolean
  ready: boolean
  error?: string | null
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

function InvoicePdfDocument({
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
  itemsList,
  subtotal,
  cgstPercentage,
  sgstPercentage,
  totalCgst,
  totalSgst,
  totalTax,
  rawTotal,
  roundedTotal,
  roundOff,
  getAmountInWords,
}: {
  invoice: Invoice
  company: any
  companyName: string
  companyAddress: string
  companyGst: string
  companyState: string
  companyStateCode: string
  contactLine: string
  billTo: any
  shipTo: any
  itemsList: any[]
  subtotal: number
  cgstPercentage: number
  sgstPercentage: number
  totalCgst: number
  totalSgst: number
  totalTax: number
  rawTotal: number
  roundedTotal: number
  roundOff: number
  getAmountInWords: (num: number) => string
}) {
  const cashDiscountAmount = invoice.cashDiscount?.discountAmount || 0
  const totalAfterDiscount = rawTotal - cashDiscountAmount
  const roundedNetTotal = Math.round(totalAfterDiscount)
  const netRoundOff = roundedNetTotal - totalAfterDiscount

  const formatCurrency = (value: number) => {
    return `₹\u00A0${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

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

          {itemsList.map((item, index) => {
            const qty = Number(item.quantity) || 0
            const rate = Number(item.rate) || 0
            const lineAmount = qty * rate
            const lineCgst = (lineAmount * cgstPercentage) / 100
            const lineSgst = (lineAmount * sgstPercentage) / 100
            const lineTotal = lineAmount + lineCgst + lineSgst

            return (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.tableRowEven : undefined,
                ]}
              >
                <Text style={[styles.tableCell, { width: 32, textAlign: 'center' }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { width: 180 }]}>{item.description || 'Service / Product'}</Text>
                <Text style={[styles.tableCell, { width: 42, textAlign: 'center' }]}>{item.sacCode || '9954'}</Text>
                <Text style={[styles.tableCell, { width: 36, textAlign: 'center' }]}>{item.unit || 'Nos'}</Text>
                <Text style={[styles.tableCell, { width: 36, textAlign: 'center' }]}>{qty}</Text>
                <Text style={[styles.currencyCell, { width: 64, textAlign: 'right' }]}>{rate ? formatCurrency(rate) : '-'}</Text>
                <Text style={[styles.currencyCell, { width: 64, textAlign: 'right' }]}>{formatCurrency(lineAmount)}</Text>
                <Text style={[styles.currencyCell, { width: 46, textAlign: 'right' }]}>{formatCurrency(lineCgst)}</Text>
                <Text style={[styles.currencyCell, { width: 46, textAlign: 'right' }]}>{formatCurrency(lineSgst)}</Text>
                <Text style={[styles.currencyCell, { width: 64, textAlign: 'right', borderRightWidth: 0 }]}>{formatCurrency(lineTotal)}</Text>
              </View>
            )
          })}
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
          <Text style={{ fontSize: 9, color: '#0f172a' }}>INR {getAmountInWords(roundedNetTotal)}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.footerBox}>
            <Text style={styles.footerTitle}>Bank Details</Text>
            <Text style={styles.mutedText}>Bank Name: {company.bankName || 'Axis Bank'}</Text>
            <Text style={styles.mutedText}>A/C Name: {company.bankAccountName || `${companyName} Bank A/c No.`}</Text>
            <Text style={styles.mutedText}>A/C No: {company.bankAccountNumber || '923020047215171'}</Text>
            <Text style={styles.mutedText}>IFSC: {company.bankIfsc || 'UTIB0001584'}</Text>
            <Text style={styles.mutedText}>Branch: {company.bankBranch || 'OLD NAGARDAS ROAD'}</Text>
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
  usePdfErrorPopup(instance.error)

  useEffect(() => {
    updateInstance(pdfDocument)
  }, [pdfDocument, updateInstance])

  const fileName = `${invoiceNumber || 'invoice'}.pdf`

  const handleOpen = () => {
    if (instance.url) window.open(instance.url, '_blank', 'noopener,noreferrer')
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

  if (!instance.url) return null

  return (
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
        className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB]"
      >
        <Download className="h-4 w-4" />
        Download
      </button>
    </div>
  )
}

const STATUS_STYLES = {
  draft: { label: 'Draft', cls: 'badge badge-gray' },
  finalized: { label: 'Finalized', cls: 'badge badge-blue' },
  paid: { label: 'Paid', cls: 'badge badge-green' },
} as const

function MobileInvoicePdfPanel({
  pdfDocument,
  invoiceNumber,
  date,
  status,
  customerName,
  totalAmount,
  showActions = true,
  onActionsReady,
}: {
  pdfDocument: ReactElement<DocumentProps>
  invoiceNumber?: string
  date?: string
  status?: 'draft' | 'finalized' | 'paid'
  customerName?: string
  totalAmount?: number
  showActions?: boolean
  onActionsReady?: (actions: InvoicePdfMobileActions) => void
}) {
  const [instance, updateInstance] = usePDF()
  const [downloadState, setDownloadState] = useState<'idle' | 'done'>('idle')
  const [viewerOpen, setViewerOpen] = useState(false)
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
    ? `₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : '—'

  const handleView = useCallback(() => {
    if (instance.loading || instance.error) return
    setViewerOpen(true)
  }, [instance.loading, instance.error])

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
      ready: !instance.loading && !instance.error,
      error: instance.error,
      handleView,
      handleDownload,
    })
  }, [
    instance.loading,
    instance.url,
    instance.blob,
    instance.error,
    onActionsReady,
    handleView,
    handleDownload,
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
            <p className="mt-0.5 text-sm font-semibold">{formattedTotal}</p>
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
        <div className="px-4 pb-4">
          <p className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Preparing invoice PDF…
          </p>
        </div>
      ) : null}
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

export function InvoicePreview({
  invoice,
  mobileActions = 'panel',
  onMobilePdfActions,
}: InvoicePreviewProps) {
  const { customers, company } = useBilling()

  const customer = customers.find(
    (c) => String(c.id) === String(invoice.customerId)
  )

  const billTo = invoice.billTo || {
    name: customer?.name || 'Customer Name',
    address: customer?.address || '',
    gstin: customer?.gstnumber || '',
    state: customer?.state || company.state || '',
    code: customer?.code || company.code || '',
  }

  const shipTo = invoice.sameAsBillTo
    ? billTo
    : invoice.shipTo || billTo

  const itemsList = invoice.items || []

  const subtotal = itemsList.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const rate = Number(item.rate) || 0
    return sum + qty * rate
  }, 0)

  const taxPercentage = Number(invoice.taxPercentage) || 0
  const cgstPercentage = taxPercentage / 2
  const sgstPercentage = taxPercentage / 2

  const totalCgst = (subtotal * cgstPercentage) / 100
  const totalSgst = (subtotal * sgstPercentage) / 100
  const totalTax = totalCgst + totalSgst

  const rawTotal = subtotal + totalTax
  const roundedTotal = Math.round(rawTotal)
  const roundOff = roundedTotal - rawTotal

  const getAmountInWords = (num: number): string => {
    if (num <= 0 || isNaN(num)) return 'Zero Only'

    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ]
    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ]

    const convertTwoDigits = (n: number): string => {
      if (n < 20) return ones[n]
      const tenDigit = Math.floor(n / 10)
      const oneDigit = n % 10
      return (tens[tenDigit] + (oneDigit ? ' ' + ones[oneDigit] : '')).trim()
    }

    const convertThreeDigits = (n: number): string => {
      const hundred = Math.floor(n / 100)
      const remainder = n % 100
      let str = ''
      if (hundred > 0) {
        str += ones[hundred] + ' Hundred'
      }
      if (remainder > 0) {
        str += (str ? ' ' : '') + convertTwoDigits(remainder)
      }
      return str
    }

    const crores = Math.floor(num / 10000000)
    const lakhs = Math.floor((num % 10000000) / 100000)
    const thousands = Math.floor((num % 100000) / 1000)
    const remainder = Math.floor(num % 1000)

    const parts: string[] = []

    if (crores > 0) {
      parts.push(convertTwoDigits(crores) + ' Crore')
    }
    if (lakhs > 0) {
      parts.push(convertTwoDigits(lakhs) + ' Lakh')
    }
    if (thousands > 0) {
      parts.push(convertTwoDigits(thousands) + ' Thousand')
    }
    if (remainder > 0) {
      parts.push(convertThreeDigits(remainder))
    }

    return parts.join(' ') + ' Only'
  }

  const companyName = company.name || 'SK INTERIORS'
  const companyAddress = company.address || 'Office No. 14, Hansraj Molakram Chawl, PP Road, Ambewadi Mumbai Maharashtra - 400069'
  const companyGst = company.gstnumber || '27CAOPK3510K1ZJ'
  const contactPerson = company.contactPerson || ''
  const companyPhone = company.phone || ''
  const companyState = company.state || 'MAHARASHTRA'
  const companyStateCode = company.code || '27'

  const contactLine = [contactPerson, companyPhone].filter(Boolean).join(' • ')

  const pdfDocument = useMemo(
    () => (
      <InvoicePdfDocument
        invoice={invoice}
        company={company}
        companyName={companyName}
        companyAddress={companyAddress}
        companyGst={companyGst}
        companyState={companyState}
        companyStateCode={companyStateCode}
        contactLine={contactLine}
        billTo={billTo}
        shipTo={shipTo}
        itemsList={itemsList}
        subtotal={subtotal}
        cgstPercentage={cgstPercentage}
        sgstPercentage={sgstPercentage}
        totalCgst={totalCgst}
        totalSgst={totalSgst}
        totalTax={totalTax}
        rawTotal={rawTotal}
        roundedTotal={roundedTotal}
        roundOff={roundOff}
        getAmountInWords={getAmountInWords}
      />
    ),
    [
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
      itemsList,
      subtotal,
      cgstPercentage,
      sgstPercentage,
      totalCgst,
      totalSgst,
      totalTax,
      rawTotal,
      roundedTotal,
      roundOff,
    ],
  )

  const cashDiscountAmount = invoice.cashDiscount?.discountAmount || 0
  const displayTotal = Math.round(rawTotal - cashDiscountAmount)

  const isInstalledPwa = useIsInstalledPwa()
  const isMobile = useMobilePdfFallback()
  const useMobilePdf = isMobile || isInstalledPwa

  if (useMobilePdf) {
    return (
      <MobileInvoicePdfPanel
        pdfDocument={pdfDocument}
        invoiceNumber={invoice.invoiceNumber}
        date={invoice.date}
        status={invoice.status}
        customerName={billTo.name}
        totalAmount={displayTotal}
        showActions={mobileActions === 'panel'}
        onActionsReady={mobileActions === 'external' ? onMobilePdfActions : undefined}
      />
    )
  }

  return (
    <div className="w-full rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm soft-card">
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
