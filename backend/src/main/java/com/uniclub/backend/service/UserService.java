package com.uniclub.backend.service;

import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    // ─── Register ─────────────────────────────
    public User register(User user) {
        return userRepo.save(user);
    }

    // ─── Login ────────────────────────────────
    public User login(String email, String password) {
        System.out.println("Login intent for email: " + email);
        User user = userRepo.findByEmail(email);
        if (user == null) {
            System.out.println("User not found for email: " + email);
            return null;
        }
        boolean matches = user.getPassword().equals(password);
        System.out.println("Password match for " + email + ": " + matches);
        if (matches) {
            return user;
        }
        return null;
    }

    // ─── Check Email Exists ───────────────────
    public boolean existsByEmail(String email) {
        return userRepo.existsByEmail(email);
    }

    // ─── Find by Email ───────────────────────
    public User findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    // ─── Get All Users (FIX ADDED) ✅
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }
}
