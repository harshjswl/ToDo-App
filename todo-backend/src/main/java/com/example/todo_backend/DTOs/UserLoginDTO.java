package com.example.todo_backend.DTOs;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginDTO {

    @NotBlank(message = "Email or phone number is required")
    private String emailOrNumber;

    @NotBlank(message = "Password is required")
    private String password;
}
