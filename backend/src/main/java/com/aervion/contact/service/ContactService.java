package com.aervion.contact.service;

import com.aervion.contact.dto.ContactRequest;

/**
 * Service interface for processing contact form requests and dispatching emails.
 */
public interface ContactService {

    /**
     * Validates and dispatches contact request notification email via Spring Mail SMTP.
     *
     * @param request The contact request form payload
     */
    void processAndSendContactEmail(ContactRequest request);
}
