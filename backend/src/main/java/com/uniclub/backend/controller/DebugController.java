package com.uniclub.backend.controller;

import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DebugController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/debug/reset-passwords")
    public String resetPasswords() {
        List<User> users = userRepository.findAll();

        for (User user : users) {
             if (!com.uniclub.backend.entity.Role.FACULTY.equals(user.getRole())) {
                 user.setPassword(passwordEncoder.encode("123456"));
             } else {
                 user.setPassword(null);
             }
        }

        userRepository.saveAll(users);

        return "Passwords reset successfully";
    }
}
