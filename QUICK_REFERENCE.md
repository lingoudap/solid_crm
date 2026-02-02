# Professional Quotation Template - Quick Reference Card

## 🚀 Quick Start (30 Seconds)

1. Go to **Custom Prints** → Select **Quotation** module
2. Click **⭐ Create Professional Quotation**
3. Click **✅ Create Template** (use as-is or customize first)
4. Done! Template is ready to use

## 📋 Creating & Using Templates

### From Quotation Module:
```
Quotation → Print Button → Select Template → Generate PDF
```

### Manage Templates:
```
Custom Prints → Manage → Quotation Tab → Create/Edit/Delete
```

## 🎨 Pre-Configured Fields (Professional Template)

| Field | Type | Display |
|-------|------|---------|
| Quote ID | Text | Bold |
| Customer Name | Text | Normal |
| Email | Email | Normal |
| Phone | Phone | Normal |
| Address | Address | Normal |
| Items | Table | Professional Table |
| Subtotal | Currency | ₹ Bold |
| Tax | Currency | ₹ Bold |
| Total Amount | Currency | ₹ Bold |
| Valid Until | Date | Normal |
| Terms & Conditions | Text | Footer |

## 🎯 Customization Quick Tips

### To Change Paper Size:
1. Edit Template → Layout Settings → Paper Size
2. Choose: A4 | A3 | Letter | Legal | Executive

### To Change Font:
1. Edit Template → Layout Settings → Font Family
2. Choose: Arial | Times New Roman | Helvetica | Georgia | Courier New | Verdana

### To Adjust Margins:
1. Edit Template → Layout Settings → Margins
2. Set: Top, Right, Bottom, Left (in mm)

### To Add Company Logo:
1. Edit Template → Options → Check "Show Logo"
2. Upload logo in Settings first

### To Add Signature Line:
1. Edit Template → Options → Check "Show Signature"
2. PDF will include "Authorized Signatory" line at bottom right

### To Change Header:
1. Edit Template → Middle Panel → Header Content
2. Enter custom text (e.g., "QUOTATION", "Invoice No")

### To Change Footer:
1. Edit Template → Middle Panel → Footer Content
2. Enter terms, conditions, or thank you message

## 📊 Items Table Rendering

The system automatically creates a professional table:

```
SR. No. | Description | Qty | Price | Subtotal
--------|-------------|-----|-------|----------
1       | Item 1      | 2   | ₹500  | ₹1000
2       | Item 2      | 1   | ₹750  | ₹750
```

**Automatic Features:**
- ✓ Borders and headers
- ✓ Currency formatting with ₹
- ✓ Auto page breaks for long lists
- ✓ Proper alignment

## 🔧 Field Selection

### How to Add Fields:
1. Edit Template → Middle Panel → Body Fields
2. Click field button to add
3. Fields appear in Selected Fields section
4. Drag to reorder (if enabled)

### How to Remove Fields:
1. Edit Template → Right Panel → Selected Fields
2. Click ✕ button next to field

### Available Fields for Quotation:

**Identity:** Quote ID

**Customer:** Name, Email, Phone, Address

**Items:** Items List (displays as table)

**Summary:** Subtotal, Tax, Discount, Total Amount

**Dates:** Valid Until, Created Date

**Terms:** Terms & Conditions

## 💾 Saving & Management

### Save Template:
1. Fill in details
2. Click **✅ Create Template**
3. Toast notification confirms

### Edit Template:
1. Manage Tab → Find template
2. Click **✏️ Edit**
3. Make changes
4. Click **✅ Update Template**

### Delete Template:
1. Manage Tab → Find template
2. Click **🗑️ Delete**
3. Confirm deletion

### Set as Default:
1. Manage Tab → Find template
2. Click **⭐ Set as Default**
3. Used automatically next time

### Preview Before Printing:
1. Template card → Click **👁️ Preview**
2. Review in iframe
3. Click **🖨️ Print Now** or Close

## 📱 Paper Size Reference

| Size | Dimensions | Best For |
|------|-----------|----------|
| A4 | 210 × 297 mm | Standard documents (recommended) |
| A3 | 297 × 420 mm | Wide items lists, large quotes |
| Letter | 8.5 × 11" | US standard |
| Legal | 8.5 × 14" | US legal documents |
| Executive | 7.25 × 10.5" | Executive summaries |

## 🖨️ Printing Steps

1. Open Quotation record
2. Click **🖨️ Print** button
3. Select template from dropdown
4. Click **Print** button
5. PDF downloads automatically
6. Use browser's Print (Ctrl+P) to print physical copy

## 🎓 Best Practices

### ✅ Do:
- ✓ Use professional fonts (Arial, Times New Roman)
- ✓ Include Quote ID field
- ✓ Include Items table for product sales
- ✓ Enable signature for formal quotations
- ✓ Add company logo
- ✓ Set clear expiration dates
- ✓ Include terms in footer

### ❌ Don't:
- ✗ Use margins less than 20mm
- ✗ Use too many font sizes
- ✗ Forget to set Valid Until date
- ✗ Include sensitive company information
- ✗ Use complex HTML in text fields

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Template won't save | Ensure name is filled & at least 1 field selected |
| Template disappeared | Check module selector - might be in different module |
| Fields not showing in PDF | Verify data exists in quotation record |
| Items table looks weird | Try landscape orientation if many items |
| PDF cuts off | Adjust margins or use larger paper size |
| Signature line missing | Enable "Show Signature" in template options |
| Logo not showing | Upload logo in Settings module first |
| Currency format wrong | Check field type is set to currency |
| Date format wrong | Verify date is in valid format (YYYY-MM-DD) |

## 📞 Getting Help

**For Template Issues:**
1. Check this quick reference
2. Review preview before printing
3. Check QUOTATION_TEMPLATE_GUIDE.md for detailed info
4. Review SYSTEM_ARCHITECTURE.md for technical details

**Common Questions:**
- Q: Can I use multiple templates?
  A: Yes! Create as many as you need. Set one as default.

- Q: Can I share templates between modules?
  A: Not directly, but you can duplicate settings manually.

- Q: Does template data save?
  A: Yes, in browser localStorage. Persists across restarts.

- Q: Can I export template?
  A: Currently stored locally. Manual export by screenshot/PDF.

- Q: What if I clear browser cache?
  A: Templates are deleted. Backup by taking screenshots.

## 🎯 Template Examples

### Example 1: Formal Business Quotation
- Font: Times New Roman, 12px
- Paper: A4, Portrait
- Logo: Enabled
- Signature: Enabled
- Header: "QUOTATION"
- Fields: All fields
- Footer: "Payment Terms: Net 30"

### Example 2: Simple Quotation
- Font: Arial, 11px
- Paper: A4, Portrait
- Logo: Disabled
- Signature: Disabled
- Header: Empty
- Fields: Name, Items, Total
- Footer: "Thank you!"

### Example 3: Detailed with Terms
- Font: Arial, 11px
- Paper: A4, Landscape (many items)
- Logo: Enabled
- Signature: Enabled
- Fields: All + comprehensive Terms field
- Margins: 20mm all sides

---

**Pro Tip 💡**: Start with "Professional Quotation" template and customize from there - it's faster than building from scratch!

---

*Last Updated: February 1, 2026*
*Version: 1.0 Quick Reference*
