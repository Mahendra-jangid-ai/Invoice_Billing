# Billing Software Pro

A professional, feature-rich billing and invoicing software built with Next.js 16, React 19, and Tailwind CSS. Easily manage invoices, customers, and items with a clean, intuitive interface.

## Features

### 📊 Dashboard
- Real-time overview of your business metrics
- Total sales, invoices, customers, and items at a glance
- Quick action buttons for common tasks
- Recent invoices summary table

### 👥 Customer Management
- Add, edit, and delete customers
- Store customer details (name, email, phone, address, GST number)
- Search and filter customers
- Manage customer information centrally

### 📦 Item/Product Management
- Create and manage items/products and services
- Store HSN/SAC codes for Indian tax compliance
- Track unit prices and descriptions
- Edit and delete items as needed

### 📄 Invoice Management
- Create professional invoices with auto-generated invoice numbers
- Add multiple line items per invoice
- Automatic calculations for amounts and taxes
- Support for Indian GST (18% default, customizable)
- Professional invoice preview with proper formatting
- Mark invoices as Draft, Finalized, or Paid
- Edit invoices in draft status
- View invoice details with full customer information
- Print invoices directly from the browser

### 🎨 Professional Invoice Template
- Tax invoice format compliant with Indian billing standards
- Company and customer details
- Itemized billing with HSN/SAC codes
- Automatic tax calculations
- Amount in words (Indian numbering)
- Terms and conditions section
- Professional footer with signature line

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **React**: React 19 with latest hooks
- **Styling**: Tailwind CSS v4 with Tailwind UI components
- **Icons**: Lucide React
- **State Management**: React Context API + localStorage
- **Components**: shadcn/ui components

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# or
pnpm install

# Start development server
npm run dev

# or
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
app/
├── layout.tsx              # Root layout with BillingProvider
├── page.tsx                # Home page (redirects to dashboard)
├── dashboard/
│   └── page.tsx            # Dashboard overview
├── customers/
│   └── page.tsx            # Customer management page
├── items/
│   └── page.tsx            # Items management page
└── invoices/
    ├── page.tsx            # Invoices list
    ├── new/
    │   └── page.tsx        # Create invoice
    └── [id]/
        ├── page.tsx        # Invoice detail view
        └── edit/
            └── page.tsx    # Edit invoice

components/
├── sidebar.tsx             # Main navigation sidebar
├── invoice-form.tsx        # Invoice creation/editing form
├── invoice-preview.tsx     # Professional invoice display
└── ui/                     # shadcn/ui components

lib/
├── context.tsx             # Billing context and state management
└── utils.ts                # Utility functions
```

## Data Storage

The application uses **localStorage** for data persistence:
- Customer data: `billing_customers`
- Items data: `billing_items`
- Invoice data: `billing_invoices`

Data persists across browser sessions. To reset, clear browser storage or use browser DevTools.

### Future: Database Integration

For production use with multiple users, integrate with:
- **Neon PostgreSQL** with Drizzle ORM
- **Supabase** with RLS policies
- Add user authentication for multi-user support

## Usage Guide

### 1. Create a Customer
1. Navigate to **Customers** tab
2. Click **Add Customer** button
3. Fill in customer details:
   - Name (required)
   - Email (required)
   - Phone
   - GST Number
   - Address
4. Click **Add Customer**

### 2. Create an Item
1. Navigate to **Items** tab
2. Click **Add Item** button
3. Fill in item details:
   - Item Name (required)
   - Unit Price (required)
   - HSN/SAC Code
   - Description
4. Click **Add Item**

### 3. Create an Invoice
1. Navigate to **Invoices** tab
2. Click **Create Invoice** button (or use quick action on Dashboard)
3. Fill in invoice details:
   - Invoice Number (auto-generated, can be customized)
   - Date (defaults to today)
   - Select Customer (required)
   - Add Items (click "Add Item", select item, enter quantity and rate)
   - Adjust Tax Percentage if needed (default: 18%)
   - Add Notes/Terms
4. Click **Create Invoice**
5. Review the invoice details page

### 4. Manage Invoices
- **View**: Click invoice number to see full details
- **Edit**: Click Edit button on draft invoices only
- **Mark as Finalized**: Change draft to finalized status
- **Mark as Paid**: Change finalized to paid status
- **Print**: Click Print button to open print dialog
- **Delete**: Delete invoices you no longer need

## Invoice Status

- **Draft**: Editable invoices that haven't been finalized
- **Finalized**: Sent invoices (cannot be edited)
- **Paid**: Marked as payment received

## Features Coming Soon

- PDF export and download
- Email invoice delivery
- Payment tracking and reminders
- Recurring invoices
- Advanced reporting and analytics
- Multi-company support
- User authentication
- API for third-party integration
- Bulk invoice operations

## Customization

### Change Company Details
Edit the company information in `/lib/context.tsx`:
```javascript
const [company] = useState({
  name: 'Your Company Name',
  address: 'Your Address',
  phone: '+91 XXXX XXXX XX',
  email: 'your@email.com',
  gstnumber: 'Your GST Number',
  pan: 'Your PAN',
})
```

### Customize Tax Rate
Default tax rate is 18% (GST). You can change it per invoice when creating/editing.

### Modify Currency
The app uses Indian Rupees (₹). To change currency, update references in:
- `/components/invoice-preview.tsx`
- `/app/dashboard/page.tsx`
- Other pages as needed

## Browser Support

- Chrome/Edge: Latest versions
- Firefox: Latest versions
- Safari: Latest versions
- Mobile browsers supported (responsive design)

## Performance

- Fast page loads with Next.js optimization
- Efficient state management with React Context
- Local storage for instant data access
- No external API calls required (localStorage only)

## Troubleshooting

### Data Not Persisting
- Check if localStorage is enabled in your browser
- Clear browser cache and try again
- Check browser console for errors

### Invoice Numbers Not Sequential
- Invoice numbers are generated based on existing invoices
- Delete draft invoices if you want to reuse numbers

### Form Submission Issues
- Ensure all required fields are filled
- Check browser console for validation errors

## License

MIT License - Feel free to use and modify

## Support

For issues or feature requests, please contact support or check the documentation.

---

**Happy Invoicing! 📄✨**
