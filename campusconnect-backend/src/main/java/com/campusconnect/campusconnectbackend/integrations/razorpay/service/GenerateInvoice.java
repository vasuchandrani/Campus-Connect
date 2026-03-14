package com.campusconnect.campusconnectbackend.integrations.razorpay.service;

import com.campusconnect.campusconnectbackend.college.entity.CollegeSubscription;

import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class GenerateInvoice {

    public MultipartFile generateInvoice(CollegeSubscription payment) {

        try {

            String invoiceNumber = "INV-" + payment.getId();

            // Create PDF in memory
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Invoice Title
            document.add(new Paragraph("INVOICE")
                    .setBold()
                    .setFontSize(20));

            document.add(new Paragraph("Invoice Number: " + invoiceNumber));
            document.add(new Paragraph("Date: " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))));

            document.add(new Paragraph("\nCustomer Details"));
            document.add(new Paragraph("Name: " + payment.getAdminName()));
            document.add(new Paragraph("Email: " + payment.getAdminEmail()));

            document.add(new Paragraph("\nPayment Details"));

            Table table = new Table(2);

            table.addCell("Payment ID");
            table.addCell(payment.getPaymentId());

            table.addCell("Order ID");
            table.addCell(payment.getOrderId());

            table.addCell("Amount");
            table.addCell("₹ " + payment.getAmount());

            table.addCell("Status");
            table.addCell("SUCCESS");

            document.add(table);

            document.add(new Paragraph("\nThank you for your payment!"));

            document.close();

            // convert generated PDF to MultipartFile
            return new MockMultipartFile(
                    invoiceNumber + ".pdf",
                    invoiceNumber + ".pdf",
                    "application/pdf",
                    outputStream.toByteArray()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate and upload invoice", e);
        }
    }
}