package com.uniclub.backend.service;

import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ─── Register ─────────────────────────────
    public User register(User user) {
        return userRepo.save(user);
    }

    // ─── Login ────────────────────────────────
    public User login(String email, String password) {
        System.out.println("LOGIN ATTEMPT: " + email);
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("USER FOUND: " + user);
        
        System.out.println("RAW PASSWORD: " + password);
        System.out.println("DB PASSWORD: " + user.getPassword());
        
        if (user.getRole() == com.uniclub.backend.entity.Role.FACULTY && user.getPassword() == null) {
            throw new RuntimeException("Please set your password first");
        }

        if (user.getPassword() == null) {
            throw new RuntimeException("Password not set for user");
        }
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        return user;
    }

    // ─── Check Email Exists ───────────────────
    public boolean existsByEmail(String email) {
        return userRepo.existsByEmail(email);
    }

    // ─── Find by Email ───────────────────────
    public java.util.Optional<User> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    // ─── Get All Users (FIX ADDED) ✅
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // ─── Get Users by Role ───────────────────
    public List<User> getUsersByRole(com.uniclub.backend.entity.Role role) {
        return userRepo.findByRole(role);
    }
}
