import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import QRCode from "react-qr-code";
import { serverURL } from "../App"; 

export default function ReceiptPage({ order }) {
  const invoiceRef = useRef();

  // Price Calculations (Delivery fee logic)
  const shippingFee = order?.totalAmount > 500 ? 0 : 40;
  const finalTotal = (order?.totalAmount || 0) + shippingFee;

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
      {/* UI Button Section - Iska design nahi badla gaya */}
      <div className="flex flex-col items-center justify-center p-10 bg-white shadow-xl rounded-3xl max-w-md mx-auto mt-10 border border-gray-100">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-gray-800">Order Placed!</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">Aapka bill taiyar hai. Niche click karke download karein.</p>
        <button onClick={generatePDF} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all">
          Download Invoice PDF
        </button>
      </div>

      {/* Hidden PDF Section */}
      <div style={{ position: "absolute", top: "-9999px", left: "0" }}>
        <div ref={invoiceRef} style={{ width: "790px", minHeight: "1000px", padding: "40px", backgroundColor: "#fff", color: "#333", fontFamily: "Arial, sans-serif", position: "relative" }}>
          
          {/* Header */}
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

          {/* Customer & Seller Section */}
          <div style={{ display: "flex", justifyContent: "space-between", margin: "30px 0", gap: "20px" }}>
            {/* Billed To */}
            <div style={{ width: "45%" }}>
              <h4 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "5px", color: "#1e40af", fontSize: "11px", textTransform: "uppercase", fontWeight: "bold" }}>Billed To</h4>
              <p style={{ fontWeight: "bold", fontSize: "15px", margin: "10px 0 5px" }}>{order?.deliveryAddress?.fullName || order?.user?.fullName}</p>
              <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.5", color: "#475569" }}>
                {order?.deliveryAddress?.flatNo}, {order?.deliveryAddress?.area}<br/>
                {order?.deliveryAddress?.city}, {order?.deliveryAddress?.state} - {order?.deliveryAddress?.pincode}<br/>
                <b>Mobile: {order?.deliveryAddress?.phone}</b>
              </p>
            </div>

            {/* Sold By - Fixed Email Logic */}
            <div style={{ width: "45%", textAlign: "right" }}>
              <h4 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "5px", color: "#1e40af", fontSize: "11px", textTransform: "uppercase", fontWeight: "bold" }}>Sold By</h4>
              {order?.shopOrders?.map((so, idx) => {
                // Backend schema ke hisab se email check
                const sellerEmail = so?.shop?.email || so?.owner?.email || "support@vatsstore.com";
                const sellerName = so?.shop?.name || "VatsStore Partner";

                return (
                  <div key={idx} style={{ marginTop: "10px" }}>
                    <p style={{ fontWeight: "bold", fontSize: "15px", margin: "0", color: "#1f2937" }}>{sellerName}</p>
                    <p style={{ fontSize: "12px", color: "#475569", margin: "2px 0" }}>{sellerEmail}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1", fontSize: "12px" }}>Item Details</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1", textAlign: "center", fontSize: "12px" }}>Qty</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1", textAlign: "right", fontSize: "12px" }}>Price</th>
                <th style={{ padding: "12px", borderBottom: "2px solid #cbd5e1", textAlign: "right", fontSize: "12px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order?.shopOrders?.map((shopOrder) => 
                shopOrder.shopOrderItems.map((item, iIdx) => (
                  <tr key={iIdx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${serverURL}/${item.images?.[0]}`} style={{ width: "30px", height: "30px", borderRadius: "4px" }} alt="" />
                      <span style={{ fontWeight: "bold", fontSize: "13px" }}>{item.name}</span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center", fontSize: "13px" }}>{item.quantity}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontSize: "13px" }}>₹{item.price}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>₹{item.price * item.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Summary & Signature */}
          <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <QRCode value={`Order:${order?._id}`} size={60} />
              <p style={{ fontSize: "9px", color: "#94a3b8", marginTop: "5px" }}>Official VATSTORE Invoice</p>
            </div>

            <div style={{ width: "250px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: "13px" }}>
                <span>Subtotal:</span><span style={{ fontWeight: "bold" }}>₹{order?.totalAmount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: "13px" }}>
                <span>Delivery:</span><span style={{ fontWeight: "bold", color: "#16a34a" }}>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "2px solid #1e40af", marginTop: "5px" }}>
                <span style={{ fontSize: "16px", fontWeight: "900" }}>TOTAL:</span>
                <span style={{ fontSize: "16px", fontWeight: "900", color: "#1e40af" }}>₹{finalTotal}</span>
              </div>

              {/* ⭐ FIXED SIGNATURE SECTION ⭐ */}
              <div style={{ marginTop: "70px", textAlign: "center", width: "170px", marginLeft: "auto" }}>
                <img 
                  src="/sign.jpg" 
                  alt="Signature" 
                  style={{ width: "90px", height: "auto", marginBottom: "-8px", display: "block", marginLeft: "auto", marginRight: "auto" }} 
                />
                <div style={{ borderTop: "1.5px solid #333", paddingTop: "5px" }}>
                  <p style={{ margin: "0", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}>Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>

          {/* ⭐ COMPUTER GENERATED LINE - Fixed Bottom ⭐ */}
          <div style={{ position: "absolute", bottom: "40px", left: "0", width: "100%", textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #f1f5f9", width: "90%", margin: "0 auto 10px auto" }}></div>
            <p style={{ fontSize: "10px", color: "#94a3b8", margin: "0" }}>
              This is a computer-generated document. No signature is required.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}