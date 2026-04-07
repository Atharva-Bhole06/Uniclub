package com.uniclub.backend.repository;

import com.uniclub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByMoodleId(String moodleId);
    boolean existsByEmail(String email);
    java.util.List<User> findByRole(com.uniclub.backend.entity.Role role);
}
