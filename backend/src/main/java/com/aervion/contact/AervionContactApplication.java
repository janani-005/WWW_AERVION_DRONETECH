package com.aervion.contact;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main entry point for Aervion DroneTech Solutions Contact & Quote Request Microservice.
 * Configured with Java 17, Spring Web, Validation, and Spring Mail.
 */
@SpringBootApplication
@EnableAsync
public class AervionContactApplication {

    public static void main(String[] args) {
        SpringApplication.run(AervionContactApplication.class, args);
    }
}
