package com.uniclub.backend.controller;

import com.uniclub.backend.dto.*;
import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.UserRepository;
import com.uniclub.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody RegisterRequest req) {
        try {
            if (req.getName() == null || req.getName().isBlank())
                return badRequest("Name is required");

            if (req.getEmail() == null || req.getEmail().isBlank())
                return badRequest("Email is required");

            if (req.getPassword() == null || req.getPassword().length() < 6)
                return badRequest("Password must be at least 6 characters");
                
            if (req.getConfirmPassword() == null || !req.getPassword().equals(req.getConfirmPassword()))
                return badRequest("Passwords do not match");

            String requestRole = req.getRole() != null && !req.getRole().isBlank() ? req.getRole().toUpperCase() : "STUDENT";
            User existingUser = userService.findByEmail(req.getEmail()).orElse(null);

            if ("FACULTY".equals(requestRole)) {
                boolean emailExistsInDB = existingUser != null;
                if (!emailExistsInDB) {
                    throw new RuntimeException("Faculty not authorized");
                }
                
                existingUser.setPassword(passwordEncoder.encode(req.getPassword()));
                if (req.getName() != null && !req.getName().isBlank()) {
                    existingUser.setFullName(req.getName());
                }
                User saved = userService.register(existingUser);
                UserResponse response = new UserResponse(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole());
                return ResponseEntity.ok(ApiResponse.ok("Faculty registration successful", response));
            } else if ("STUDENT".equals(requestRole)) {
                if (existingUser != null) {
                    return badRequest("Email already exists");
                }
                
                if (req.getMoodleId() == null || req.getMoodleId().isBlank()) {
                    return badRequest("Moodle ID is required");
                }
                if (req.getDepartment() == null || req.getDepartment().isBlank()) {
                    return badRequest("Department is required");
                }
                if (req.getYear() == null || req.getYear().isBlank()) {
                    return badRequest("Year is required");
                }

                User user = new User();
                user.setFullName(req.getName());
                user.setEmail(req.getEmail());
                user.setPassword(passwordEncoder.encode(req.getPassword()));
                user.setRole(com.uniclub.backend.entity.Role.valueOf(requestRole));
                user.setMoodleId(req.getMoodleId());
                user.setDepartment(req.getDepartment());
                user.setYear(req.getYear());

                User saved = userService.register(user);

                UserResponse response = new UserResponse(
                        saved.getId(),
                        saved.getFullName(),
                        saved.getEmail(),
                        saved.getRole()
                );

                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.ok("Registration successful", response));
            }
            
            return badRequest("Invalid role selected.");

        } catch (Exception e) {
            return serverError("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@RequestBody VerifyOtpRequest req) {
        System.out.println("VERIFY OTP HIT");
        // For now, accept any 6-digit code to unblock frontend development
        if (req.getOtp() != null && req.getOtp().length() == 6) {
            return ResponseEntity.ok(ApiResponse.ok("Email verified successfully", null));
        }
        return badRequest("Invalid OTP. Please try again.");
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@RequestBody LoginRequest req) {
        System.out.println("Login POST hit for " + req.getEmail());
        try {
            if (req.getEmail() == null || req.getPassword() == null)
                return badRequest("Email and password required");

            User user = userService.login(req.getEmail(), req.getPassword());

            if (user == null) {
                // Temporary debug details for the user
                User checkUser = userService.findByEmail(req.getEmail()).orElse(null);
                if (checkUser == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(ApiResponse.error("Invalid credentials: User not found for email " + req.getEmail()));
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(ApiResponse.error("Invalid credentials: Password does not match"));
                }
            }

            UserResponse userRes = new UserResponse(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole()
            );

            String token = "dev-token-" + user.getId();

            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("token", token);
            payload.put("user", userRes);

            return ResponseEntity.ok(ApiResponse.ok("Login successful", payload));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("No token provided"));
            }

            // Parse dev token format: "dev-token-{userId}"
            String token = authHeader.substring(7); // strip "Bearer "
            if (!token.startsWith("dev-token-")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid token format"));
            }

            String idStr = token.substring("dev-token-".length());
            int userId;
            try {
                userId = Integer.parseInt(idStr);
            } catch (NumberFormatException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Malformed token"));
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not found"));
            }

            System.out.println("/me => userId=" + userId + " role=" + user.getRole());

            UserResponse userRes = new UserResponse(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole()
            );
            return ResponseEntity.ok(ApiResponse.ok("User fetched", userRes));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch user"));
        }
    }

    private <T> ResponseEntity<ApiResponse<T>> badRequest(String msg) {
        return ResponseEntity.badRequest().body(ApiResponse.error(msg));
    }

    private <T> ResponseEntity<ApiResponse<T>> serverError(String msg) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(msg));
    }
}