# Professional Quotation Template System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOM PRINTS MODULE                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 │            │            │
          ┌──────▼────┐  ┌────▼──────┐  ┌─▼──────────┐
          │  Manage   │  │  Create   │  │   Preview  │
          │ Templates │  │ Template  │  │   & Print  │
          └──────────┘  └────┬──────┘  └────────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
         ┌────▼───┐   ┌──────▼──────┐  ┌─────▼──────┐
         │  Select│   │  ⭐ Quick  │  │  Customize │
         │ Module │   │  Templates │  │   Fields   │
         └────────┘   └─────────────┘  └────────────┘
                              │
                ┌─────────────▼─────────────┐
                │ Professional Quotation    │
                │ Template Pre-Configured   │
                └──────────────┬────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐   ┌──────▼───┐   ┌───────▼─────┐
         │ Customer│   │   Items  │   │  Summary    │
         │   Info  │   │  Table   │   │   Fields    │
         └─────────┘   └──────────┘   └─────────────┘
                              │
                       ┌──────▼──────┐
                       │  Save as    │
                       │  Template   │
                       │ (LocalStorage)
                       └──────┬──────┘
                              │
              ┌───────────────┬────────────────┐
              │               │                │
         ┌────▼────┐   ┌─────▼──────┐   ┌──────▼────┐
         │ Generate│   │  Show in   │   │  Set as   │
         │   PDF   │   │  Dropdown  │   │  Default  │
         └─────────┘   └────────────┘   └───────────┘
```

## Template Data Structure

```json
{
  "Quotation": {
    "1234567890": {
      "id": "1234567890",
      "name": "Professional Quotation",
      "module": "Quotation",
      "headerContent": "Quotation Details",
      "bodyFields": [
        "quoteId",
        "customerName",
        "email",
        "phone",
        "address",
        "items",
        "subtotal",
        "tax",
        "totalAmount",
        "validUntil",
        "terms"
      ],
      "footerContent": "Thank you for your business!\nAuthorized Signatory",
      "showLogo": true,
      "showDate": true,
      "showPageNumber": true,
      "showSignature": true,
      "paperSize": "A4",
      "orientation": "portrait",
      "margins": { "top": 30, "right": 25, "bottom": 30, "left": 25 },
      "fontSize": "11px",
      "fontFamily": "Arial",
      "lineSpacing": "1.4",
      "isDefault": true,
      "lastModified": "2026-02-01T00:00:00.000Z"
    }
  }
}
```

## PDF Generation Process

```
┌─────────────────────────────────────────────────────────────┐
│          Start PDF Generation from Quotation               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                      ┌────▼────┐
                      │ Load    │
                      │Libraries│
                      └────┬────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         ┌────▼──────┐      ┌──────────▼────┐
         │  Add Logo │      │  Add Header   │
         │ (Optional)│      │    Content    │
         └────┬──────┘      └──────────┬────┘
              │                        │
              └────────────┬───────────┘
                           │
                  ┌────────▼────────┐
                  │  Render Body    │
                  │   Fields        │
                  └────────┬────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐   ┌───────▼──────┐   ┌─────▼──────┐
    │ Regular │   │  Items Table │   │  Currency  │
    │  Field  │   │  (with rows) │   │  Format    │
    └────┬────┘   └───────┬──────┘   └─────┬──────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                  ┌───────▼────────┐
                  │  Page Break    │
                  │  Check         │
                  └───────┬────────┘
                          │
                  ┌───────▼────────┐
                  │  Add Footer    │
                  │  & Signature   │
                  └───────┬────────┘
                          │
                  ┌───────▼────────┐
                  │  Add Date &    │
                  │  Page Numbers  │
                  └───────┬────────┘
                          │
                  ┌───────▼────────┐
                  │  Save PDF      │
                  │  File          │
                  └────────────────┘
```

## Module Support

### Available Modules:
- **Lead**: Sales lead information
- **Quotation**: Price quotations (FULL FEATURED)
- **Customer**: Customer information
- **Order**: Customer orders

### Quotation Fields:
```
┌─────────────────────────────────────────┐
│      QUOTATION TEMPLATE FIELDS          │
├─────────────────────────────────────────┤
│ Identity:                               │
│  • quoteId (Bold, Large)               │
│                                         │
│ Customer Info:                          │
│  • customerName                         │
│  • email                                │
│  • phone                                │
│  • address                              │
│                                         │
│ Items:                                  │
│  • items (Professional Table)          │
│    ├─ Sr. No.                          │
│    ├─ Description                      │
│    ├─ Qty                              │
│    ├─ Price (₹)                        │
│    └─ Subtotal (₹)                     │
│                                         │
│ Summary:                                │
│  • subtotal (₹, Bold)                  │
│  • tax (₹, Bold)                       │
│  • discount (₹, Bold)                  │
│  • totalAmount (₹, Bold, Large)        │
│                                         │
│ Metadata:                               │
│  • validUntil                          │
│  • terms                               │
│  • createdDate                         │
└─────────────────────────────────────────┘
```

## Layout Customization Options

```
LAYOUT SETTINGS
├─ Paper Size
│  ├─ A4 (210 × 297 mm) ✓ Recommended
│  ├─ A3 (297 × 420 mm)
│  ├─ Letter (8.5 × 11")
│  ├─ Legal (8.5 × 14")
│  └─ Executive (7.25 × 10.5")
│
├─ Orientation
│  ├─ Portrait (Default)
│  └─ Landscape (Wide items table)
│
├─ Margins (mm)
│  ├─ Top: 20-50 (Default: 30)
│  ├─ Right: 15-40 (Default: 25)
│  ├─ Bottom: 20-50 (Default: 30)
│  └─ Left: 15-40 (Default: 25)
│
├─ Typography
│  ├─ Font Family
│  │  ├─ Arial (Professional)
│  │  ├─ Times New Roman (Formal)
│  │  ├─ Helvetica
│  │  ├─ Georgia
│  │  ├─ Courier New
│  │  └─ Verdana
│  │
│  ├─ Font Size: 11-16px (Default: 11px)
│  └─ Line Spacing: 1.0-2.0 (Default: 1.4)
│
├─ Content Sections
│  ├─ Header (Custom text)
│  ├─ Body Fields (Selectable)
│  └─ Footer (Custom text + Signature)
│
└─ Optional Features
   ├─ Show Logo
   ├─ Show Date
   ├─ Show Page Number
   └─ Show Signature
```

## Data Flow Example

```
User Creates Quotation Record
            │
            ▼
┌──────────────────────────────┐
│ Quotation Data Structure     │
│ {                            │
│  quoteId: "SQ-25-26/182127" │
│  customerName: "Pratheek"    │
│  email: "user@email.com"     │
│  phone: "7259033369"         │
│  items: [                    │
│   {                          │
│    itemName: "CRM DUSK",     │
│    qty: 2,                   │
│    price: 639.99,            │
│    subtotal: 1279.99         │
│   }                          │
│  ],                          │
│  subtotal: 1279.99,          │
│  tax: 195.25,                │
│  totalAmount: 1280.00        │
│ }                            │
└──────────────────────────────┘
            │
            ▼
    Click "Print" Button
            │
            ▼
  Select Quotation Template
            │
            ▼
┌──────────────────────────────┐
│ printTemplateUtils.js        │
│ generatePDFFromTemplate()    │
└──────────────────────────────┘
            │
     ┌──────┴──────┐
     │             │
┌────▼────┐  ┌────▼─────┐
│ jsPDF   │  │html2canvas│
│Library  │  │Library    │
└────┬────┘  └────┬──────┘
     │            │
     └────────┬───┘
              │
    ┌─────────▼──────────┐
    │ Professional PDF   │
    │ with Table Layout  │
    │ & Formatting       │
    └────────────────────┘
```

## File Organization

```
solid_crm/
├── client/
│   └── src/
│       └── Components/
│           ├── CustomPrints/
│           │   ├── CustomPrints.jsx (Main Component)
│           │   └── CustomPrints.css
│           └── common/
│               └── PrintTemplateSelector.jsx
│
├── utils/
│   └── printTemplateUtils.js (PDF Generation)
│
├── QUOTATION_TEMPLATE_GUIDE.md (User Guide)
└── IMPLEMENTATION_SUMMARY.md (Technical Summary)
```

## Storage

### LocalStorage Keys:
- `customPrintTemplates`: Stores all template definitions
- `userSettings`: Contains company logo
- `companyName`: Company name for header

### Data Persistence:
```
Browser LocalStorage
    │
    ├─ customPrintTemplates (JSON)
    │   ├─ Lead: {...}
    │   ├─ Quotation: {...}
    │   ├─ Customer: {...}
    │   └─ Order: {...}
    │
    └─ Persists across:
       ├─ Page refresh
       ├─ Browser restart
       ├─ Same browser profile
       └─ Clear only with cache clear
```

## Browser Compatibility

✅ **Supported Browsers:**
- Chrome/Edge (Recommended)
- Firefox
- Safari
- Any modern browser with:
  - ES6 support
  - localStorage API
  - Canvas/SVG support

⚠️ **Requirements:**
- JavaScript enabled
- 3rd-party libraries (jsPDF, html2canvas) must load from CDN

## Performance Considerations

- **Template Creation**: < 100ms
- **PDF Generation**: 1-3 seconds (depending on content)
- **Storage**: ~2-5KB per template
- **Memory**: ~5-10MB during PDF generation

## Security Notes

- Templates stored in browser localStorage (not encrypted)
- No sensitive data should be in templates
- PDFs generated client-side (no server upload)
- Company logo stored in localStorage as base64

---

**Last Updated**: February 1, 2026
**Version**: 1.0
**Status**: Ready for Production
