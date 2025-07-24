package com.example.todo_backend.Service.Impl;

import com.example.todo_backend.DTOs.TaskRequestDTO;
import com.example.todo_backend.DTOs.TaskResponseDTO;
import com.example.todo_backend.Entity.Task;
import com.example.todo_backend.Entity.User;
import com.example.todo_backend.Exception.UserException;
import com.example.todo_backend.Repository.TaskRepository;
import com.example.todo_backend.Repository.UserRepository;
import com.example.todo_backend.Service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public TaskResponseDTO createTask(TaskRequestDTO taskRequestDTO, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserException("User not found."));

        Task task = Task.builder()
                .title(taskRequestDTO.getTitle())
                .description(taskRequestDTO.getDescription())
                .completed(false) // New tasks are not completed by default
                .user(user)
                .build();

        Task savedTask = taskRepository.save(task);
        return mapToResponseDTO(savedTask);
    }

    @Override
    public List<TaskResponseDTO> getAllTasksByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserException("User not found."));

        return taskRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponseDTO getTaskById(Long taskId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserException("User not found."));
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new UserException("Task not found or you don't have permission to view it."));
        return mapToResponseDTO(task);
    }

    @Override
    @Transactional
    public TaskResponseDTO updateTask(Long taskId, TaskRequestDTO taskRequestDTO, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserException("User not found."));
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new UserException("Task not found or you don't have permission to update it."));

        task.setTitle(taskRequestDTO.getTitle());
        task.setDescription(taskRequestDTO.getDescription());
        if (taskRequestDTO.getCompleted() != null) {
            task.setCompleted(taskRequestDTO.getCompleted());
        }

        Task updatedTask = taskRepository.save(task);
        return mapToResponseDTO(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long taskId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserException("User not found."));
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new UserException("Task not found or you don't have permission to delete it."));

        taskRepository.delete(task);
    }

    private TaskResponseDTO mapToResponseDTO(Task task) {
        return TaskResponseDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .completed(task.isCompleted())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}