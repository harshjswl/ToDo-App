package com.example.todo_backend.Repository;

import com.example.todo_backend.Entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find all tasks for a specific user
    List<Task> findByUserId(Long userId);

    // Find a single task by its ID and user ID to ensure a user can only access their own tasks
    Optional<Task> findByIdAndUserId(Long id, Long userId);
}