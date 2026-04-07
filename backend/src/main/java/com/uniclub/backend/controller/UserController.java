package com.uniclub.backend.controller;

import com.uniclub.backend.entity.User;
import com.uniclub.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // ✅ Supported multiple ports
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/students")
    public List<User> getStudents() {
        java.util.List<User> users = new java.util.ArrayList<>();
        users.addAll(userService.getUsersByRole(com.uniclub.backend.entity.Role.STUDENT));
        users.addAll(userService.getUsersByRole(com.uniclub.backend.entity.Role.CLUB_HEAD));
        return users;
    }
}
