package com.example.todo_backend.Controller;

import com.example.todo_backend.DTOs.TaskRequestDTO;
import com.example.todo_backend.DTOs.TaskResponseDTO;
import com.example.todo_backend.Service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "${app.cors.allowedOrigin}")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // Get the email of the currently authenticated user from the security context
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/create")
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskRequestDTO taskRequestDTO) {
        String userEmail = getCurrentUserEmail();
        TaskResponseDTO createdTask = taskService.createTask(taskRequestDTO, userEmail);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<TaskResponseDTO>> getAllTasks() {
        String userEmail = getCurrentUserEmail();
        List<TaskResponseDTO> tasks = taskService.getAllTasksByUser(userEmail);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> getTaskById(@PathVariable(name = "id") Long taskId) {
        String userEmail = getCurrentUserEmail();
        TaskResponseDTO task = taskService.getTaskById(taskId, userEmail);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(@PathVariable(name = "id") Long taskId,
                                                      @Valid @RequestBody TaskRequestDTO taskRequestDTO) {
        String userEmail = getCurrentUserEmail();
        TaskResponseDTO updatedTask = taskService.updateTask(taskId, taskRequestDTO, userEmail);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable(name = "id") Long taskId) {
        String userEmail = getCurrentUserEmail();
        taskService.deleteTask(taskId, userEmail);
        return ResponseEntity.ok(Collections.singletonMap("message", "Task deleted successfully."));
    }
}