package com.aervion.contact.controller;

import com.aervion.contact.dto.ApiResponse;
import com.aervion.contact.dto.ContactRequest;
import com.aervion.contact.service.ContactService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for managing contact form submissions and quote requests.
 */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    /**
     * Health check / status endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Aervion Contact Microservice is online and healthy."));
    }

    /**
     * POST endpoint for submitting a drone service quote request.
     * Enforces DTO validation and triggers custom domain SMTP email dispatch.
     *
     * @param request Validated ContactRequest payload
     * @return ResponseEntity with structured ApiResponse DTO
     */
    @PostMapping
    public ResponseEntity<ApiResponse> submitContactForm(@Valid @RequestBody ContactRequest request) {
        log.info("Received quote request submission for service [{}] from email [{}]",
                request.getServiceType(), request.getEmail());

        contactService.processAndSendContactEmail(request);

        ApiResponse response = ApiResponse.success(
                "Thank you for contacting Aervion DroneTech Solutions Pvt. Ltd.! Your quote request has been submitted successfully."
        );
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
