/**
 * CustomPrints Constants
 * Centralized field options, paper sizes, font families, and modules
 */

export const MODULES = ["Lead", "Quotation", "Customer", "Order"];

export const FIELD_OPTIONS = {
  Lead: [
    { id: "leadId", label: "Lead ID", icon: "🆔", type: "text" },
    { id: "name", label: "Name", icon: "👤", type: "text" },
    { id: "email", label: "Email", icon: "📧", type: "email" },
    { id: "phone", label: "Phone", icon: "📱", type: "phone" },
    { id: "company", label: "Company", icon: "🏢", type: "text" },
    { id: "jobTitle", label: "Job Title", icon: "💼", type: "text" },
    { id: "address", label: "Address", icon: "📍", type: "address" },
    { id: "city", label: "City", icon: "🏙️", type: "text" },
    { id: "state", label: "State", icon: "🗺️", type: "text" },
    { id: "zipCode", label: "Zip Code", icon: "📮", type: "text" },
    { id: "source", label: "Source", icon: "📌", type: "text" },
    { id: "status", label: "Status", icon: "📊", type: "status" },
    { id: "createdDate", label: "Created Date", icon: "📅", type: "date" },
    { id: "lastContact", label: "Last Contact", icon: "💬", type: "date" },
    { id: "notes", label: "Notes", icon: "📝", type: "textarea" },
  ],
  Quotation: [
    { id: "quoteId", label: "Quote ID", icon: "🆔", type: "text" },
    { id: "customerName", label: "Customer Name", icon: "👤", type: "text" },
    { id: "company", label: "Company", icon: "🏢", type: "text" },
    { id: "email", label: "Email", icon: "📧", type: "email" },
    { id: "phone", label: "Phone", icon: "📱", type: "phone" },
    { id: "address", label: "Address", icon: "📍", type: "address" },
    { id: "items", label: "Items List", icon: "📦", type: "table" },
    { id: "subtotal", label: "Subtotal", icon: "💰", type: "currency" },
    { id: "tax", label: "Tax", icon: "🏛️", type: "currency" },
    { id: "discount", label: "Discount", icon: "🎯", type: "currency" },
    { id: "totalAmount", label: "Total Amount", icon: "💵", type: "currency" },
    { id: "validUntil", label: "Valid Until", icon: "⏳", type: "date" },
    { id: "terms", label: "Terms & Conditions", icon: "📄", type: "textarea" },
    { id: "createdDate", label: "Created Date", icon: "📅", type: "date" },
  ],
  Customer: [
    { id: "customerId", label: "Customer ID", icon: "🆔", type: "text" },
    { id: "name", label: "Name", icon: "👤", type: "text" },
    { id: "email", label: "Email", icon: "📧", type: "email" },
    { id: "phone", label: "Phone", icon: "📱", type: "phone" },
    { id: "company", label: "Company", icon: "🏢", type: "text" },
    { id: "address", label: "Address", icon: "📍", type: "address" },
    { id: "city", label: "City", icon: "🏙️", type: "text" },
    { id: "state", label: "State", icon: "🗺️", type: "text" },
    { id: "zipCode", label: "Zip Code", icon: "📮", type: "text" },
    { id: "customerType", label: "Customer Type", icon: "🏷️", type: "text" },
    { id: "joinDate", label: "Join Date", icon: "📅", type: "date" },
    { id: "totalOrders", label: "Total Orders", icon: "📊", type: "number" },
    { id: "totalSpent", label: "Total Spent", icon: "💰", type: "currency" },
    { id: "lastOrder", label: "Last Order Date", icon: "🛒", type: "date" },
  ],
  Order: [
    { id: "orderId", label: "Order ID", icon: "🆔", type: "text" },
    { id: "customerName", label: "Customer Name", icon: "👤", type: "text" },
    { id: "email", label: "Email", icon: "📧", type: "email" },
    { id: "phone", label: "Phone", icon: "📱", type: "phone" },
    { id: "shippingAddress", label: "Shipping Address", icon: "🚚", type: "address" },
    { id: "billingAddress", label: "Billing Address", icon: "💳", type: "address" },
    { id: "items", label: "Items List", icon: "📦", type: "table" },
    { id: "subtotal", label: "Subtotal", icon: "💰", type: "currency" },
    { id: "shippingCost", label: "Shipping Cost", icon: "🚚", type: "currency" },
    { id: "tax", label: "Tax", icon: "🏛️", type: "currency" },
    { id: "totalAmount", label: "Total Amount", icon: "💵", type: "currency" },
    { id: "paymentMethod", label: "Payment Method", icon: "💳", type: "text" },
    { id: "orderStatus", label: "Order Status", icon: "📊", type: "status" },
    { id: "orderDate", label: "Order Date", icon: "📅", type: "date" },
    { id: "estimatedDelivery", label: "Estimated Delivery", icon: "📦", type: "date" },
  ],
};

export const PAPER_SIZES = [
  { value: "A4", label: "A4 (210 × 297 mm)" },
  { value: "A3", label: "A3 (297 × 420 mm)" },
  { value: "Letter", label: "Letter (8.5 × 11 in)" },
  { value: "Legal", label: "Legal (8.5 × 14 in)" },
  { value: "Executive", label: "Executive (7.25 × 10.5 in)" },
];

export const FONT_FAMILIES = [
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Courier New", label: "Courier New" },
  { value: "Verdana", label: "Verdana" },
];
