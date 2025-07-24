package com.example.todo_backend.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void sendOtpEmail(String to, String name, String otp) {
        // Create the Thymeleaf context
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("otp", otp);

        // Process the HTML template with the context variables
        String htmlContent = templateEngine.process("otp-email-template", context);

        // Create a MimeMessage for sending HTML email
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

        try {
            helper.setTo(to);
            helper.setSubject("Your OTP Code for ToDo App");
            helper.setText(htmlContent, true); // true indicates the content is HTML
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            // Consider a more robust error handling
            throw new RuntimeException("Failed to send email", e);
        }
    }
}