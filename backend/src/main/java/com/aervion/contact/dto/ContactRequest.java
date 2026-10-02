package com.aervion.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object (DTO) for incoming quote request submissions.
 * Includes Spring Validation annotations to enforce data integrity.
 */
public class ContactRequest {

    @NotBlank(message = "Full Name or Organization is required")
    @Size(min = 2, max = 100, message = "Full Name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address (e.g. name@company.com)")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^[+]?[0-9\\s\\-\\(\\)]{7,20}$",
        message = "Please provide a valid phone number (7 to 20 digits/symbols)"
    )
    private String phone;

    @NotBlank(message = "Service selection is required")
    private String serviceType;

    @NotBlank(message = "Project overview and location description is required")
    @Size(min = 10, max = 3000, message = "Project details must be between 10 and 3000 characters")
    private String message;

    // Default Constructor
    public ContactRequest() {}

    // All-Arguments Constructor
    public ContactRequest(String fullName, String email, String phone, String serviceType, String message) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.serviceType = serviceType;
        this.message = message;
    }

    // Getters and Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "ContactRequest{" +
                "fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", serviceType='" + serviceType + '\'' +
                ", messageLength=" + (message != null ? message.length() : 0) +
                '}';
    }
}
