package com.example.todo_backend.DTOs;

import jakarta.annotation.Nullable;
import lombok.*;


@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private String name;
    private String number;
    private String email;
}
