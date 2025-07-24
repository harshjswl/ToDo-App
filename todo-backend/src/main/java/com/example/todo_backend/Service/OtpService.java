package com.example.todo_backend.Service;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    private static final long OTP_VALID_DURATION = 5; // 5 minutes

    public String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public boolean isOtpValid(LocalDateTime otpGeneratedTime) {
        if (otpGeneratedTime == null) {
            return false;
        }
        return otpGeneratedTime.plusMinutes(OTP_VALID_DURATION).isAfter(LocalDateTime.now());
    }
}