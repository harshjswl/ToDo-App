package com.example.todo_backend.Service.Impl;
import com.example.todo_backend.Exception.UserException;
import com.example.todo_backend.DTOs.UserRegistrationDTO;
import com.example.todo_backend.DTOs.UserResponseDTO;
import com.example.todo_backend.Entity.User;
import com.example.todo_backend.Repository.UserRepository;
import com.example.todo_backend.Service.EmailService;
import com.example.todo_backend.Service.OtpService;
import com.example.todo_backend.Service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private OtpService otpService;
    @Autowired
    private EmailService emailService;

    @Override
    @Transactional
    public UserResponseDTO registerUser(UserRegistrationDTO userRegistrationDTO) {
        if (userRepository.existsByEmail(userRegistrationDTO.getEmail())) {
            throw new UserException("Email is already in use.");
        }
        if (userRepository.existsByNumber(userRegistrationDTO.getNumber())) {
            throw new UserException("Number is already in use.");
        }

        String otp = otpService.generateOtp();

        User newUser = User.builder()
                .name(userRegistrationDTO.getName())
                .email(userRegistrationDTO.getEmail())
                .number(userRegistrationDTO.getNumber())
                .password(passwordEncoder.encode(userRegistrationDTO.getPassword()))
                .enabled(false) // User is not enabled until OTP is verified
                .otp(otp)
                .otpGeneratedTime(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(newUser);

        // Send OTP to user's email
        emailService.sendOtpEmail(savedUser.getEmail(), savedUser.getName(), otp);

        // We don't return user details until they are verified
        return UserResponseDTO.builder()
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .number(savedUser.getNumber())
                .build();
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    @Override
    @Transactional
    public UserResponseDTO updateUser(String email, User user) {
        User existingUser=userRepository.findByEmail(email)
                .orElseThrow(()->new UserException("User with email "+email+" not found."));
        if(!existingUser.getEmail().equals(user.getEmail())&& userRepository.existsByEmail(user.getEmail())){
            throw new UserException("New email is already in use by another user.");
        }
        if(!existingUser.getNumber().equals(user.getNumber())&& userRepository.existsByNumber(user.getNumber())){
            throw new UserException("New number is already in use by another user.");
        }
        existingUser.setName(user.getName());
        existingUser.setNumber(user.getNumber());
        existingUser.setEmail(user.getEmail());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        User updatedUser = userRepository.save(existingUser);
        return UserResponseDTO.builder()
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .number(updatedUser.getNumber())
                .build();
    }

    @Override
    public void deleteUserByEmail(String email) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isEmpty()) {
            throw new UserException("User with email " + email + " not found.");
        }
        userRepository.delete(existingUser.get());
    }
}
