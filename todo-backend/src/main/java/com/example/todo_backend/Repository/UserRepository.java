package com.example.todo_backend.Repository;

import com.example.todo_backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByNumber(String number);
    boolean existsByEmail(String email);
    boolean existsByNumber(String number);
}
