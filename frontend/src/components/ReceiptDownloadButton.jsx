import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import QRCode from "react-qr-code";
import { serverURL } from "../App"; // Ensure serverURL is correct

export default function ReceiptPage({ order }) {
  const invoiceRef = useRef();

  // Calculations
  const shippingFee = order?.totalAmount > 500 ? 0 : 40;
  const finalTotal = (order?.totalAmount || 0) + shippingFee;

  // PDF Download Logic
  const generatePDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0.2,
      filename: `VatsStore_Invoice_${order?._id?.slice(-6)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  if (!order) return <div className="text-center p-10 font-bold">Loading Order...</div>;

  return (
    <>
      {/* UI Button Section */}
      <div className="flex flex-col items-center justify-center p-10 bg-white shadow-xl rounded-3xl max-w-md mx-auto mt-10 border border-gray-100">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-gray-800">Order Placed!</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">Aapka bill taiyar hai. Niche click karke download karein.</p>
        
        <button
          onClick={generatePDF}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
        >
          Download Invoice PDF
        </button>
      </div>

      {/* Hidden PDF Content Section */}
      <div style={{ position: "absolute", top: "-9999px", left: "0" }}>
        <div ref={invoiceRef} style={{ width: "790px", padding: "40px", backgroundColor: "#fff", color: "#333", fontFamily: "Arial, sans-serif" }}>
          
          {/* 1. Header Section */}
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "4px solid #1e40af", paddingBottom: "20px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#1e40af", margin: "0" }}>VATSTORE</h1>
              <p style={{ color: "#64748b", margin: "5px 0", fontSize: "12px", fontWeight: "bold" }}>ECOMMERCE MALL PVT LTD</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: "0", color: "#1e40af" }}>TAX INVOICE</h2>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>Order ID: <b>#{order?._id?.slice(-8).toUpperCase()}</b></p>
              <p style={{ margin: "0", color: "#64748b", fontSize: "12px" }}>Date: {new Date(order?.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* 2. Billing & Shipping Info */}
          <div style={{ display: "flex", justifyContent: "space-between", margin: "30px 0" }}>
            <div style={{ width: "50%" }}>
              <h4 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "5px", color: "#1e40af", fontSize: "12px", textTransform: "uppercase" }}>Shipping Address</h4>
              <p style={{ fontWeight: "bold", fontSize: "15px", margin: "10px 0 5px" }}>{order?.user?.fullName}</p>
              <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.6", color: "#475569" }}>
                {order?.deliveryAddress?.flatNo}, {order?.deliveryAddress?.area}<br/>
                {order?.deliveryAddress?.city}, {order?.deliveryAddress?.state} - {order?.deliveryAddress?.pincode}<br/>
                <b>Mobile: {order?.deliveryAddress?.phone || order?.user?.mobileNumber}</b>
              </p>
            </div>
            <div style={{ width: "40%", textAlign: "right" }}>
              <h4 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "5px", color: "#1e40af", fontSize: "12px", textTransform: "uppercase" }}>Payment Info</h4>
              <p style={{ margin: "10px 0 5px", fontSize: "14px" }}>Method: <b>{order?.paymentMethod?.toUpperCase()}</b></p>
              <p style={{ margin: "0", fontSize: "14px" }}>Status: <span style={{ color: "#16a34a", fontWeight: "bold" }}>PAID</span></p>
            </div>
          </div>

          {/* 3. Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1", fontSize: "13px" }}>Item Details</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1", textAlign: "center", fontSize: "13px" }}>Qty</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1", textAlign: "right", fontSize: "13px" }}>Price</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1", textAlign: "right", fontSize: "13px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order?.shopOrders?.map((shopOrder, sIdx) => (
                <React.Fragment key={sIdx}>
                  {/* Shop Info Row */}
                  <tr>
                    <td colSpan="4" style={{ padding: "8px 12px", backgroundColor: "#eff6ff", fontSize: "11px", fontWeight: "bold", color: "#2563eb", textTransform: "uppercase" }}>
                      Sold By: {shopOrder?.shop?.name || "Partner Store"}
                    </td>
                  </tr>
                  {shopOrder.shopOrderItems.map((item, iIdx) => (
                    <tr key={iIdx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                        <img 
                          src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${serverURL}/${item.images?.[0]}`} 
                          style={{ width: "35px", height: "35px", borderRadius: "4px", objectFit: "cover", border: "1px solid #e2e8f0" }} 
                          alt=""
                        />
                        <div>
                          <p style={{ fontWeight: "bold", fontSize: "14px", margin: "0" }}>{item.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", fontSize: "14px" }}>{item.quantity}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontSize: "14px" }}>₹{item.price}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "bold" }}>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* 4. Summary Section */}
          <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "200px" }}>
              <QRCode value={`InvoiceID:${order?._id}`} size={80} />
              <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "10px" }}>Scan to verify order</p>
            </div>
            <div style={{ width: "280px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ fontSize: "14px", color: "#64748b" }}>Subtotal:</span>
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>₹{order?.totalAmount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ fontSize: "14px", color: "#64748b" }}>Delivery:</span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "#16a34a" }}>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", marginTop: "5px", borderTop: "2px solid #1e40af" }}>
                <span style={{ fontSize: "18px", fontWeight: "900" }}>TOTAL:</span>
                <span style={{ fontSize: "18px", fontWeight: "900", color: "#1e40af" }}>₹{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* 5. Signature Section (Option 2) */}
          <div style={{ marginTop: "90px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <img 
              src="/sign.jpg" 
              alt="Signature" 
              style={{ width: "100px", height: "70px", marginBottom: "", marginRight: "" }} 
            />
            <div style={{ borderTop: "2px solid #1f2937", width: "100px", textAlign: "center", paddingTop: "5px" }}>
              <p style={{ margin: "0", fontSize: "12px", fontWeight: "bold", color: "#1f2937", textTransform: "uppercase" }}>
                Authorized Signatory
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div style={{ marginTop: "60px", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
            <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0" }}>
              This is a computer-generated tax invoice. No physical signature is required.
            </p>
            <p style={{ fontSize: "13px", fontWeight: "bold", color: "#1e40af", marginTop: "10px" }}>
              Thank you for shopping at VatsStore!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}