package com.example.todo_backend.Service;

import com.example.todo_backend.DTOs.UserRegistrationDTO;
import com.example.todo_backend.DTOs.UserResponseDTO;
import com.example.todo_backend.Entity.User;

import java.util.Optional;

public interface UserService {
    UserResponseDTO registerUser(UserRegistrationDTO userRegistrationDTO);
    Optional<User>findByEmail(String email);
    UserResponseDTO updateUser(String email,User user);
    void deleteUserByEmail(String email);
}
