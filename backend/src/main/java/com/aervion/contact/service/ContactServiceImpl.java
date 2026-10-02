package com.aervion.contact.service;

import com.aervion.contact.dto.ContactRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Implementation of ContactService providing custom domain email dispatch using Spring Mail JavaMailSender.
 */
@Service
public class ContactServiceImpl implements ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${aervion.mail.from-address:Info@aerviondronetechsolutions.in}")
    private String fromAddress;

    @Value("${aervion.mail.to-address:Info@aerviondronetechsolutions.in}")
    private String toAddress;

    @Value("${aervion.mail.sender-name:Aervion DroneTech Web Portal}")
    private String senderName;

    @Value("${aervion.mail.send-auto-acknowledgment:true}")
    private boolean sendAutoAcknowledgment;

    public ContactServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    @Async
    public void processAndSendContactEmail(ContactRequest request) {
        log.info("Processing contact request from [{}] <{}> for service [{}]",
                request.getFullName(), request.getEmail(), request.getServiceType());

        // 1. Send Admin Notification Email
        try {
            sendAdminNotification(request);
        } catch (Exception e) {
            log.warn("SMTP email dispatch unavailable or failed (e.g. unconfigured SMTP App Password). Quote lead details logged: Name=[{}], Email=[{}], Phone=[{}], Service=[{}], Message=[{}]. Error: {}",
                    request.getFullName(), request.getEmail(), request.getPhone(), request.getServiceType(), request.getMessage(), e.getMessage());
        }

        // 2. Send Customer Auto-Acknowledgment Email (if enabled)
        if (sendAutoAcknowledgment) {
            try {
                sendCustomerAcknowledgment(request);
            } catch (Exception e) {
                log.warn("Failed to send customer auto-acknowledgment email to <{}>: {}",
                        request.getEmail(), e.getMessage());
                // Non-blocking fallback: do not throw error if admin email succeeded
            }
        }
    }

    private void sendAdminNotification(ContactRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, senderName);
            helper.setTo(toAddress);
            helper.setReplyTo(request.getEmail(), request.getFullName());
            
            String subject = String.format("[NEW LEAD] Quote Request: %s - %s", 
                    request.getServiceType(), request.getFullName());
            helper.setSubject(subject);

            String htmlBody = buildAdminEmailHtml(request);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Successfully dispatched admin notification email to [{}] for lead [{}]",
                    toAddress, request.getFullName());

        } catch (MessagingException | MailException e) {
            log.error("SMTP error dispatching admin email for request [{}]: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to send quote request notification via SMTP custom domain server.", e);
        } catch (Exception e) {
            log.error("Unexpected error in email dispatch: {}", e.getMessage(), e);
            throw new RuntimeException("Error processing quote request notification.", e);
        }
    }

    private void sendCustomerAcknowledgment(ContactRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, "Aervion DroneTech Solutions");
            helper.setTo(request.getEmail());
            helper.setSubject("Thank You for Contacting Aervion DroneTech Solutions Pvt. Ltd.");

            String htmlBody = buildCustomerEmailHtml(request);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Sent confirmation email to client <{}>", request.getEmail());

        } catch (Exception e) {
            log.warn("Customer acknowledgment email send failed: {}", e.getMessage());
        }
    }

    private String buildAdminEmailHtml(ContactRequest req) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
                .card { max-width: 650px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0 auto; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .header { border-bottom: 2px solid #22c55e; padding-bottom: 12px; margin-bottom: 20px; }
                .header h2 { margin: 0; color: #0f172a; font-size: 20px; }
                .header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
                .field-table { width: 100%%; border-collapse: collapse; margin-bottom: 20px; }
                .field-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .field-table td.label { font-weight: 600; color: #475569; width: 32%%; background-color: #f8fafc; }
                .message-box { background: #f8fafc; border-left: 4px solid #22c55e; padding: 14px; border-radius: 4px; font-size: 14px; white-space: pre-wrap; line-height: 1.5; color: #334155; }
                .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 12px; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h2>AERVION DRONETECH - New Web Quote Lead</h2>
                  <p>Received on %s</p>
                </div>
                <table class="field-table">
                  <tr><td class="label">Full Name / Org:</td><td><strong>%s</strong></td></tr>
                  <tr><td class="label">Client Email:</td><td><a href="mailto:%s">%s</a></td></tr>
                  <tr><td class="label">Phone / WhatsApp:</td><td><a href="tel:%s">%s</a></td></tr>
                  <tr><td class="label">Service Required:</td><td><strong style="color: #16a34a;">%s</strong></td></tr>
                </table>
                <p style="font-weight:600; font-size:14px; margin-bottom: 6px;">Project Overview & Location:</p>
                <div class="message-box">%s</div>
                <div class="footer">
                  This message was automatically generated by Aervion DroneTech Contact Microservice.<br/>
                  You can click 'Reply' directly in your email client to respond to the lead.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                timestamp,
                escapeHtml(req.getFullName()),
                escapeHtml(req.getEmail()), escapeHtml(req.getEmail()),
                escapeHtml(req.getPhone()), escapeHtml(req.getPhone()),
                escapeHtml(req.getServiceType()),
                escapeHtml(req.getMessage())
        );
    }

    private String buildCustomerEmailHtml(ContactRequest req) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
                .card { max-width: 600px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0 auto; padding: 24px; }
                .header { border-bottom: 2px solid #22c55e; padding-bottom: 12px; margin-bottom: 16px; }
                .header h2 { margin: 0; color: #0f172a; }
                .body-text { font-size: 14px; line-height: 1.6; color: #334155; }
                .details-box { background: #f8fafc; padding: 14px; border-radius: 6px; margin: 16px 0; font-size: 13px; }
                .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h2>Aervion DroneTech Solutions Pvt. Ltd.</h2>
                </div>
                <div class="body-text">
                  <p>Dear <strong>%s</strong>,</p>
                  <p>Thank you for reaching out to Aervion DroneTech Solutions Pvt. Ltd. We have received your inquiry for <strong>%s</strong>.</p>
                  <p>Our drone operations team and geospatial technical leads are reviewing your project requirements and will get back to you within 24 hours.</p>
                  <div class="details-box">
                    <strong>Summary of your request:</strong><br/>
                    • Service: %s<br/>
                    • Contact Phone: %s<br/>
                  </div>
                  <p>If you have urgent inquiries, feel free to contact our flight operations team directly at <strong>+91 63824 14918</strong> or email <strong>Info@aerviondronetechsolutions.in</strong>.</p>
                  <p>Best Regards,<br/><strong>Flight Operations & Technical Team</strong><br/>Aervion DroneTech Solutions Pvt. Ltd., Salem, India</p>
                </div>
                <div class="footer">
                  &copy; Aervion DroneTech Solutions Pvt. Ltd. | Commercial Drone Surveying & Thermal Inspection
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                escapeHtml(req.getFullName()),
                escapeHtml(req.getServiceType()),
                escapeHtml(req.getServiceType()),
                escapeHtml(req.getPhone())
        );
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
}
