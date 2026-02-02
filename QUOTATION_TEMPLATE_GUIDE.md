# Professional Quotation Print Template Guide

## Overview

The Custom Prints module now includes a **Professional Quotation Template** feature that allows you to create professional, well-formatted PDF quotations with a single click. This guide shows you how to use and customize quotation templates.

## Features

### ✨ Built-in Professional Template

The system includes a pre-configured "Professional Quotation" template with:

- **Header Section**: Company logo and quotation details header
- **Customer Information**: Auto-populated customer name, email, phone, address
- **Items Table**: Professional table format showing:
  - Serial Number
  - Item Description
  - Quantity
  - Price per Unit
  - Subtotal
- **Summary Section**: Subtotal, Tax, Discount, and Total Amount
- **Footer Section**: Terms & Conditions with authorized signatory line
- **Professional Layout**: A4 paper size with optimized margins

### 📋 Customizable Options

You can customize:

1. **Layout Settings**
   - Paper Size (A4, A3, Letter, Legal, Executive)
   - Orientation (Portrait or Landscape)
   - Margins (Top, Right, Bottom, Left)

2. **Content**
   - Header content (company info, quotation title)
   - Body fields (select which information to display)
   - Footer content (terms, conditions, notes)
   - Add company logo
   - Show/hide date and page numbers
   - Add authorized signatory line

3. **Styling**
   - Font family (Arial, Times New Roman, Helvetica, Georgia, Courier New, Verdana)
   - Font size (11px - 16px)
   - Line spacing (1.0 - 2.0)

## Quick Start

### Step 1: Access Custom Prints

Navigate to the **Custom Prints** module in your CRM dashboard.

### Step 2: Switch to Quotation Module

Click on the **Quotation** button in the module selector on the Manage Templates tab.

### Step 3: Create Professional Template

Click the **⭐ Create Professional Quotation** button. This will:
- Load a pre-configured template with all essential quotation fields
- Set it as the default template
- Switch to the template editor so you can customize it further

### Step 4: Customize (Optional)

In the template editor, you can:
- Change the template name
- Adjust layout settings (paper size, orientation, margins)
- Add header content (e.g., "QUOTATION" title)
- Select which fields to include
- Customize footer content
- Enable/disable logo, date, page numbers, and signature line

### Step 5: Save Template

Click **✅ Create Template** to save your customized quotation template.

### Step 6: Use the Template

When viewing a quotation in your CRM:
1. Click the **🖨️ Print** button
2. Select your quotation template
3. Click **Print** to generate the PDF

## Available Quotation Fields

- **Quote ID**: Unique quotation identifier
- **Customer Name**: Name of the customer
- **Email**: Customer email address
- **Phone**: Customer phone number
- **Address**: Customer street address
- **Items List**: Table of products/services with quantities and prices
- **Subtotal**: Total before tax and discount
- **Tax**: Tax amount
- **Discount**: Discount amount (if any)
- **Total Amount**: Final total
- **Valid Until**: Quotation expiration date
- **Terms & Conditions**: Terms and conditions text
- **Created Date**: Date the quotation was created

## Advanced Features

### Items Table Format

When the "Items List" field is included, quotations will automatically display a professional table:

```
SR. No. | Description        | Qty | Price      | Subtotal
--------|-------------------|-----|------------|----------
1       | Premium Package    | 2   | ₹2,500.00  | ₹5,000.00
2       | Add-on Services    | 3   | ₹750.00    | ₹2,250.00
```

### Currency Display

All currency fields automatically format values with:
- Currency symbol (₹)
- Two decimal places
- Right alignment in tables

### Signature Line

Enable "Show Signature" option to add:
- A professional signature line
- "Authorized Signatory" label
- Positioned at the bottom right of the document

### Header & Footer

- **Header**: Add company branding, quotation title, or introductory text
- **Footer**: Include terms, conditions, thank you message, or contact information

## Template Customization Examples

### Formal Business Quotation

1. Header: "QUOTATION\n\nFor Official Quotation" 
2. Include: QuoteID, CustomerName, Email, Phone, Address, Items, Subtotal, Tax, TotalAmount, ValidUntil
3. Footer: "Payment Terms: Net 30\nThis quotation is valid for 30 days from the date above."
4. Signature: Enabled
5. Font: Times New Roman, 12px

### Simple Quotation

1. Header: Empty (or "Quote")
2. Include: CustomerName, Items, TotalAmount
3. Footer: "Thank you for considering us!"
4. Signature: Disabled
5. Font: Arial, 11px

### Detailed Quotation with Terms

1. Header: "QUOTATION"
2. Include: All available fields
3. Footer: "Terms & Conditions:\n- Prices are in Indian Rupees\n- Valid for 30 days\n- Delivery: 5-7 working days"
4. Signature: Enabled
5. Logo: Enabled

## Tips & Best Practices

✅ **Do:**
- Use professional font families (Arial, Helvetica, Times New Roman)
- Include a logo for brand recognition
- Enable signature line for formal quotations
- Set clear header titles
- Include all relevant customer information
- Use clear, descriptive footer content

❌ **Don't:**
- Use too many different fonts
- Make margins too small (use at least 20mm)
- Forget to set expiration dates on quotes
- Leave footer empty on formal quotations
- Use landscape orientation unless you have many items

## Troubleshooting

### Template Not Saving
- Ensure template name is not empty
- Verify at least one field is selected
- Check browser console for errors

### Fields Not Appearing in PDF
- Confirm the field is added to the template
- Verify the data exists in the quotation record
- Check if the field type is supported (some fields may require special data format)

### PDF Layout Issues
- Adjust margins if content overlaps
- Use landscape orientation for quotations with many items
- Reduce font size if content doesn't fit
- Check page size selection

### Items Table Not Displaying Correctly
- Ensure items are provided as an array
- Verify item objects have: itemName, qty, price, subtotal properties
- Use landscape orientation for quotations with many items

## API Reference

### Field Types

- **text**: Text input fields
- **email**: Email addresses
- **phone**: Phone numbers
- **address**: Address fields
- **currency**: Currency amounts (displayed with ₹)
- **date**: Date values
- **table**: Items list (renders as table)
- **textarea**: Long text content
- **status**: Status indicators

### Paper Sizes

- A4: 210 × 297 mm (standard)
- A3: 297 × 420 mm (double A4)
- Letter: 8.5 × 11 inches (US standard)
- Legal: 8.5 × 14 inches (US legal)
- Executive: 7.25 × 10.5 inches (US executive)

## Future Enhancements

Planned features:
- Custom watermarks
- Background images
- Conditional fields
- Multi-language support
- Template inheritance
- Professional templates library
- Email integration

## Support

For issues or feature requests:
1. Check this guide for solutions
2. Review template settings
3. Contact support with template details
