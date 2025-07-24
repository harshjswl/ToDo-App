package com.example.todo_backend.Service;

import com.example.todo_backend.DTOs.TaskRequestDTO;
import com.example.todo_backend.DTOs.TaskResponseDTO;

import java.util.List;

public interface TaskService {
    TaskResponseDTO createTask(TaskRequestDTO taskRequestDTO, String userEmail);
    List<TaskResponseDTO> getAllTasksByUser(String userEmail);
    TaskResponseDTO getTaskById(Long taskId, String userEmail);
    TaskResponseDTO updateTask(Long taskId, TaskRequestDTO taskRequestDTO, String userEmail);
    void deleteTask(Long taskId, String userEmail);
}