package com.example.todo_backend.DTOs;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskRequestDTO {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private Boolean completed;
}