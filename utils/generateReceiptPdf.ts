import { SubscriptionData } from "@/app/(dashboard)/subscriptions/_components/SubscriptionHistoryTable";
import jsPDF from "jspdf";
//import { SubscriptionData } from "./SubscriptionHistoryTable";

export const generateReceiptPdf = (record: SubscriptionData) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerText = "Payment Receipt";
  const headerWidth = doc.getTextWidth(headerText);
  doc.text(headerText, (pageWidth - headerWidth) / 2, yPos); // Center header
  yPos += 15;

  // Transaction Details
  // Bold Label + Normal Value
  doc.setFont("helvetica", "bold");
  const transactionLabel = "Transaction ID: ";
  const labelWidth = doc.getTextWidth(transactionLabel);
  doc.text(transactionLabel, 20, yPos);

  doc.setFont("helvetica", "normal");
  doc.text(record.transaction_id, 20 + labelWidth, yPos);
  yPos += 11;
  ///////////////////
  doc.setFont("helvetica", "bold");
  const dateLabel = "Date: ";
  const dateWidth = doc.getTextWidth(dateLabel);
  doc.text(dateLabel, 20, yPos);

  doc.setFont("helvetica", "normal");
  doc.text(record.date_text, 20 + dateWidth, yPos);
  yPos += 11;
  //////////////////////
  doc.setFont("helvetica", "bold");
  const amountLabel = "Amount: ";
  const amountWidth = doc.getTextWidth(amountLabel);
  doc.text(amountLabel, 20, yPos);

  doc.setFont("helvetica", "normal");
  doc.text(record.amount, 20 + amountWidth, yPos);
  yPos += 11;
  ////////////////\
  doc.setFont("helvetica", "bold");
  const paymentLabel = "Payment Method: ";
  const paymentWidth = doc.getTextWidth(paymentLabel);
  doc.text(paymentLabel, 20, yPos);

  doc.setFont("helvetica", "normal");
  doc.text(
    `${record.card.brand} ending in ${record.card.last4}`,
    20 + paymentWidth,
    yPos
  );
  //doc.text(`Payment Method: ${record.card.brand} ending in ${record.card.last4}`, 20, yPos);
  yPos += 11;
  ///////////////////
  doc.setFont("helvetica", "bold");
  const statusLabel = "Amount: ";
  const statusWidth = doc.getTextWidth(statusLabel);
  doc.text(statusLabel, 20, yPos);

  doc.setFont("helvetica", "normal");
  doc.text(
    `${record.status === "active" ? "Paid" : record.status}`,
    20 + statusWidth,
    yPos
  );
  //doc.text(`Status: ${record.status === "active" ? "Paid" : record.status}`, 20, yPos);
  yPos += 11;
  /////////////////
  doc.setFont("helvetica", "bold");
  const emailLabel = "Customer Email: ";
  const emailWidth = doc.getTextWidth(emailLabel);
  doc.text(emailLabel, 20, yPos);

  doc.setFont("helvetica", "normal");
  doc.text(record.email, 20 + emailWidth, yPos);
  //doc.text(`Customer Email: ${record.email}`, 20, yPos);
  yPos += 11;
  //////////////////
  doc.setFont("helvetica", "bold");
  const palnLabel = "Description: ";
  const planWidth = doc.getTextWidth(palnLabel);
  doc.text(palnLabel, 20, yPos);

  doc.setFont("helvetica", "normal");
  doc.text(`Subscription Plan - ${record.plan}`, 20 + planWidth, yPos);
  //doc.text(`Description: Subscription Plan - ${record.plan}`, 20, yPos);
  yPos += 15;

  // Centered Footer
  doc.setFontSize(14);
  const thankYouText = "Thank you for your payment!";
  const thankYouWidth = doc.getTextWidth(thankYouText);
  doc.text(thankYouText, (pageWidth - thankYouWidth) / 2, yPos);
  yPos += 8;

  doc.setFontSize(12);
  const supportText =
    "If you have any questions, please contact support@example.com";
  const supportWidth = doc.getTextWidth(supportText);
  doc.text(supportText, (pageWidth - supportWidth) / 2, yPos);

  doc.save(`receipt_${record.transaction_id}.pdf`);
};
