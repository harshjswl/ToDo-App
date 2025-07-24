package com.example.todo_backend.Controller;

import com.example.todo_backend.DTOs.*;
import com.example.todo_backend.Entity.User;
import com.example.todo_backend.Exception.UserException;
import com.example.todo_backend.Repository.UserRepository;
import com.example.todo_backend.Security.JwtUtil;
import com.example.todo_backend.Service.EmailService;
import com.example.todo_backend.Service.OtpService;
import com.example.todo_backend.Service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

@Slf4j
@RestController
@Validated
@RequestMapping("/api/users")
@CrossOrigin(origins = "${app.cors.allowedOrigin}")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private OtpService otpService;
    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        userService.registerUser(registrationDTO);
        return ResponseEntity.status(201).body(Collections.singletonMap("message", "Registration successful. Please check your email for OTP to verify your account."));
    }

    @PostMapping("/verify-otp")
    @Transactional
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerificationDTO verificationDTO) {
        User user = userRepository.findByEmail(verificationDTO.getEmail())
                .orElseThrow(() -> new UserException("User not found with this email."));

        if (user.isEnabled()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Account is already verified."));
        }

        if (user.getOtp() == null || !user.getOtp().equals(verificationDTO.getOtp())) {
            throw new UserException("Invalid OTP.");
        }

        if (!otpService.isOtpValid(user.getOtpGeneratedTime())) {
            throw new UserException("OTP has expired. Please request a new one.");
        }

        user.setEnabled(true);
        user.setOtp(null); // Clear OTP after successful verification
        user.setOtpGeneratedTime(null);
        userRepository.save(user);

        return ResponseEntity.ok(Collections.singletonMap("message", "Account verified successfully. You can now log in."));
    }

    @PostMapping("/login-otp")
    @Transactional
    public ResponseEntity<?> loginStep1_SendOtp(@Valid @RequestBody UserLoginDTO login) {
        User user = userRepository.findByEmail(login.getEmailOrNumber())
                .or(() -> userRepository.findByNumber(login.getEmailOrNumber()))
                .orElseThrow(() -> new UserException("Invalid credentials"));

        if (!user.isEnabled()) {
            throw new UserException("Account is not verified. Please verify your account first.");
        }

        if (!passwordEncoder.matches(login.getPassword(), user.getPassword())) {
            throw new UserException("Invalid credentials");
        }

        String otp = otpService.generateOtp();
        user.setOtp(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());
        userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), user.getName(), otp);

        return ResponseEntity.ok(Collections.singletonMap("message", "OTP sent to your email for login verification."));
    }

    @PostMapping("/login-verify-otp")
    public ResponseEntity<?> loginStep2_VerifyOtpAndGetToken(@Valid @RequestBody OtpVerificationDTO verificationDTO) {
        User user = userRepository.findByEmail(verificationDTO.getEmail())
                .orElseThrow(() -> new UserException("User not found."));

        if (user.getOtp() == null || !user.getOtp().equals(verificationDTO.getOtp())) {
            throw new UserException("Invalid OTP.");
        }

        if (!otpService.isOtpValid(user.getOtpGeneratedTime())) {
            throw new UserException("OTP has expired. Please try logging in again.");
        }

        user.setOtp(null); // Clear OTP
        user.setOtpGeneratedTime(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }

    @PostMapping("/resend-otp")
    @Transactional
    public ResponseEntity<?> resendOtp(@Valid @RequestBody OtpRequestDTO otpRequestDTO) {
        User user = userRepository.findByEmail(otpRequestDTO.getEmail())
                .orElseThrow(() -> new UserException("User not found with this email."));

        if (user.isEnabled()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Account is already verified."));
        }

        String otp = otpService.generateOtp();
        user.setOtp(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), user.getName(), otp);

        return ResponseEntity.ok(Collections.singletonMap("message", "A new OTP has been sent to your email."));
    }

    // Your existing GET, PUT, DELETE endpoints
    // These now require a valid JWT token from the /login-verify-otp endpoint

    @GetMapping("/{email}")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new UserException("User not found with email: " + email));

        UserResponseDTO response = UserResponseDTO.builder()
                .name(user.getName())
                .email(user.getEmail())
                .number(user.getNumber())
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{email}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable String email, @RequestBody User updatedUser) {
        UserResponseDTO response = userService.updateUser(email, updatedUser);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<String> deleteUser(@PathVariable String email) {
        userService.deleteUserByEmail(email);
        return ResponseEntity.ok("User with email " + email + " deleted successfully.");
    }
}