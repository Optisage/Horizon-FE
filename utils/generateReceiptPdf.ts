import { SubscriptionData } from "@/app/(dashboard)/subscriptions/_components/SubscriptionHistoryTable";
import jsPDF from "jspdf";

export const generateReceiptPdf = async (record: SubscriptionData) => {
  const doc = new jsPDF("p", "mm", "a4");
  
  // HTML template with inline styles
  const htmlContent = `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">
        Payment Receipt
      </h1>

      <div style="margin-bottom: 25px;">
        <h2 style="color: #34495e; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px;">
          Transaction Details
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
          <div>
            <strong>Transaction ID:</strong> ${record.transaction_id}
          </div>
          <div>
            <strong>Date:</strong> ${record.date_text}
          </div>
          <div>
            <strong>Amount:</strong> ${record.amount}
          </div>
          <div>
            <strong>Status:</strong> ${record.status === "active" ? "Paid" : record.status}
          </div>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h2 style="color: #34495e; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px;">
          Payment Information
        </h2>
        
        <div style="margin-top: 15px;">
          <div><strong>Payment Method:</strong> ${record.card.brand} ending in ${record.card.last4}</div>
          <div><strong>Customer Email:</strong> ${record.email}</div>
          <div><strong>Description:</strong> Subscription Plan - ${record.plan}</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 14px;">
        <p>Thank you for your payment!</p>
        <p>If you have any questions, please contact support@example.com</p>
      </div>
    </div>
  `;

  // Generate PDF from HTML
  await doc.html(htmlContent, {
    margin: [15, 15, 15, 15],
    filename: `receipt_${record.transaction_id}`,
    html2canvas: {
      scale: 0.8, // Adjust scale for better resolution
      letterRendering: true,
    },
    callback: (doc) => {
      doc.save(`receipt_${record.transaction_id}.pdf`);
    }
  });
};