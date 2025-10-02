import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import QRCode from "react-qr-code";

export default function ReceiptPage({ order }) {
  const invoiceRef = useRef();

  // PDF Generate Function
 const generatePDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0.2,
      filename: `invoice-${order?._id || "order"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: "#ffffff" }, // Safe background
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(element).set(opt).save();
  };

//   const deliveryCFee = totalAmount > 500 ? 0 : 40
// amountWithDeliveryFee

  return (
    <>

      {/* Download Button */}
      <div className="text-center mt-6">
        <button
          onClick={generatePDF}
          style={{ backgroundColor: "#2563eb" }}
          className="hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow"
        >
          Download Invoice PDF
        </button>
      </div>
    <div style={{display:"none" }} className="p-8 min-h-screen">
      {/* Invoice Box */}
      <div
        ref={invoiceRef}
        style={{ backgroundColor: "#ffffff" }}
        className="shadow-xl rounded-lg p-8 w-full max-w-3xl mx-auto text-sm"
      >
        {/* Header */}
        <div style={{ borderBottom: "1px solid #e5e7eb" }} className="flex justify-between items-center pb-4 mb-6">
          <div className="flex items-center gap-3">
            <img
              src="https://via.placeholder.com/60" // Safe placeholder
              alt="Logo"
              className="w-14 h-14 rounded"
            />
            <div>
              <h1 style={{ color: "#111827" }} className="text-2xl font-bold">Your Shop</h1>
              <p style={{ color: "#6b7280" }} className="text-sm">Trusted Online Store</p>
            </div>
          </div>
          <div className="text-right">
            <h2 style={{ color: "#111827" }} className="text-xl font-semibold">INVOICE</h2>
            <p style={{ color: "#6b7280" }}>Order ID: #{order?._id?.slice(-6)}</p>
            <p style={{ color: "#6b7280" }}>
              Date: {new Date(order?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          {/* Billing To */}
          <div>
            <h3 style={{ color: "#111827" }} className="font-semibold mb-2">Billing To:</h3>
            <p style={{ color: "#374151" }}>{order?.user?.fullName}</p>
            <p style={{ color: "#374151" }}>{order?.deliveryAddress?.text}</p>
            <p style={{ color: "#374151" }}>{order?.user?.mobileNumber}</p>
            <p style={{ color: "#374151" }}>{order?.user?.email}</p>
          </div>

          {/* Billing From */}
          <div className="text-right">
            <h3 style={{ color: "#111827" }} className="font-semibold mb-2">Billing From:</h3>
            {order?.shopOrders?.map((shopOrder, i) => (
              <div key={i} className="mb-2">
                <p style={{ color: "#374151" }} className="font-medium">
                  {shopOrder?.shop?.name}
                </p>
                <p style={{ color: "#6b7280" }} className="text-sm">
                  {shopOrder?.shop?.address || "Shop Address"}
                </p>
                <p style={{ color: "#6b7280" }} className="text-sm">
                  {shopOrder?.owner?.email || "shop@email.com"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h3 style={{ color: "#111827" }} className="font-semibold mb-2">Order Items</h3>
          <table style={{ border: "1px solid #d1d5db" }} className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>
                <th style={{ border: "1px solid #d1d5db", padding: "0.5rem" }} className="text-left">Item</th>
                <th style={{ border: "1px solid #d1d5db", padding: "0.5rem" }} className="text-center">Qty</th>
                <th style={{ border: "1px solid #d1d5db", padding: "0.5rem" }} className="text-right">Price</th>
                <th style={{ border: "1px solid #d1d5db", padding: "0.5rem" }} className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order?.shopOrders[0]?.shopOrderItems?.map((item, i) => (
                <tr key={i} style={{ color: "#374151" }}>
                  <td style={{ border: "1px solid #d1d5db", padding: "0.5rem" }}>{item?.name}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "0.5rem" }} className="text-center">{item?.quantity}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "0.5rem" }} className="text-right">₹{item?.price}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "0.5rem" }} className="text-right">₹{item?.price * item?.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-between mb-6">
          <div style={{ color: "#374151" }} className="text-sm">
            <p className="font-medium">Payment Method: {order?.paymentMethod?.toUpperCase()}</p>
          </div>
          <div className="w-1/3">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <span>₹{order?.totalAmount}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Shipping</span>
              <span>₹100</span>
            </div>
            <div className="flex justify-between py-1 font-semibold">
              <span>Total</span>
              <span>₹{order?.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* QR Code + Signature */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-center">
            <QRCode
              value={`upi://pay?pa=yourshop@upi&pn=YourShop&am=${order?.totalAmount}`}
              size={100}
            />
            <p style={{ color: "#6b7280" }} className="text-xs mt-2">Scan to Pay</p>
          </div>
          <div className="text-center">
            <p style={{ color: "#374151" }}>Authorized Signature</p>
            <div style={{ borderBottom: "2px solid #9ca3af" }} className="h-12 w-48 mx-auto"></div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e5e7eb", color: "#6b7280" }} className="pt-4 mt-6 text-center text-xs">
          <p>Thank you for shopping with us!</p>
          <p>For support contact: support@yourshop.com</p>
        </div>
      </div>

    
    </div>
    </>
  );
}
