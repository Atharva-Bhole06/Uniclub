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
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.uniclub.backend.repository.OtpVerificationRepository otpRepository;

    @Autowired
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(@RequestBody java.util.Map<String, String> body) {
        try {
            String email = body.get("email");
            if (email == null || email.isBlank()) {
                return badRequest("Email is required");
            }
            if (userService.findByEmail(email).isPresent()) {
                return badRequest("Email is already registered");
            }

            // Generate 6 digit OTP
            String otpCode = String.format("%06d", new java.util.Random().nextInt(999999));

            com.uniclub.backend.entity.OtpVerification otpData = otpRepository.findByEmail(email).orElse(new com.uniclub.backend.entity.OtpVerification());
            otpData.setEmail(email);
            otpData.setOtp(otpCode);
            otpData.setExpiryTime(java.time.LocalDateTime.now().plusMinutes(5));
            otpData.setVerified(false);
            otpRepository.save(otpData);

            // Send actual email (HTML)
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            helper.setTo(email);
            helper.setSubject("Welcome to UniClub \u2013 Verify Your Email");
            
            String htmlContent = "<!DOCTYPE html>\n" +
            "<html>\n" +
            "<body style=\"margin:0;padding:0;background:#05070b;font-family:Inter,Arial,sans-serif;\">\n" +
            "  <div style=\"max-width:600px;margin:40px auto;padding:1px;background:radial-gradient(circle at 20% 20%,rgba(201,242,143,0.15),transparent 40%),radial-gradient(circle at 80% 80%,rgba(201,242,143,0.1),transparent 40%);border-radius:16px;\">\n" +
            "    <div style=\"background:#0b0f14;border-radius:16px;padding:36px;color:#e5e7eb;position:relative;overflow:hidden;\">\n" +
            "      <!-- subtle dot pattern -->\n" +
            "      <div style=\"position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);background-size:22px 22px;opacity:0.4;\"></div>\n" +
            "      <div style=\"position:relative;z-index:2;\">\n" +
            "        <h2 style=\"margin:0 0 8px 0;color:#c9f28f;font-weight:600;\">UniClub Verification</h2>\n" +
            "        <p style=\"margin:0 0 20px 0;color:#9ca3af;font-size:14px;\">Complete your registration using the verification code below.</p>\n" +
            "        <div style=\"margin:28px 0;padding:24px;border-radius:12px;background:#05070b;border:1px solid #111827;text-align:center;\">\n" +
            "          <p style=\"margin:0;color:#6b7280;font-size:12px;letter-spacing:1px;\">VERIFICATION CODE</p>\n" +
            "          <h1 style=\"margin:12px 0 6px 0;font-size:34px;letter-spacing:6px;color:#c9f28f;font-weight:600;\">" + otpCode + "</h1>\n" +
            "          <p style=\"margin:0;color:#6b7280;font-size:12px;\">Valid for 5 minutes</p>\n" +
            "        </div>\n" +
            "        <p style=\"font-size:13px;color:#9ca3af;\">Enter this code in the application to proceed.</p>\n" +
            "        <hr style=\"border:none;border-top:1px solid #111827;margin:24px 0;\" />\n" +
            "        <p style=\"font-size:11px;color:#6b7280;\">If you did not request this, you can safely ignore this email.</p>\n" +
            "        <p style=\"margin-top:20px;font-size:12px;color:#9ca3af;\">UniClub \u2022 Discover \u2022 Connect \u2022 Grow</p>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "</body>\n" +
            "</html>";

            helper.setText(htmlContent, true); // true indicates HTML
            mailSender.send(mimeMessage);

            System.out.println("Actively sent OTP email to: " + email);

            return ResponseEntity.ok(ApiResponse.ok("OTP sent to your email", null));
        } catch (Exception e) {
            e.printStackTrace();
            return serverError("Failed to send OTP: " + e.getMessage());
        }
    }

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
                
                // Enforce OTP verified for student
                var otpRec = otpRepository.findByEmail(req.getEmail()).orElse(null);
                if (otpRec == null || !otpRec.isVerified()) {
                    return badRequest("Email is not verified. Please verify OTP first.");
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
                
                // Once registered, delete the OTP record
                otpRepository.delete(otpRec);

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
        if (req.getEmail() == null || req.getOtp() == null) {
            return badRequest("Email and OTP required");
        }
        
        com.uniclub.backend.entity.OtpVerification otpRec = otpRepository.findByEmail(req.getEmail()).orElse(null);
        if (otpRec == null) {
            return badRequest("No OTP request found for this email");
        }
        
        if (otpRec.getExpiryTime().isBefore(java.time.LocalDateTime.now())) {
            return badRequest("OTP has expired. Please request a new one.");
        }
        
        if (!otpRec.getOtp().equals(req.getOtp())) {
            return badRequest("Invalid OTP. Please try again.");
        }
        
        otpRec.setVerified(true);
        otpRepository.save(otpRec);
        
        return ResponseEntity.ok(ApiResponse.ok("Email verified successfully", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        try {
            String email = body.get("email");
            if (email == null || email.isBlank()) {
                return badRequest("Email is required");
            }
            
            if (userService.findByEmail(email).isEmpty()) {
                // Do not reveal if user exists
                return ResponseEntity.ok(ApiResponse.ok("If the email is registered, an OTP has been sent.", null));
            }

            com.uniclub.backend.entity.OtpVerification otpData = otpRepository.findByEmail(email).orElse(new com.uniclub.backend.entity.OtpVerification());
            if (otpData.getExpiryTime() != null && otpData.getExpiryTime().isAfter(java.time.LocalDateTime.now().minusMinutes(4).minusSeconds(30))) {
                return badRequest("Please wait 30 seconds before requesting another OTP");
            }

            String otpCode = String.format("%06d", new java.util.Random().nextInt(999999));

            otpData.setEmail(email);
            otpData.setOtp(otpCode);
            otpData.setExpiryTime(java.time.LocalDateTime.now().plusMinutes(5));
            otpData.setVerified(false);
            otpRepository.save(otpData);

            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            helper.setTo(email);
            helper.setSubject("UniClub Password Reset Request");
            
            String htmlContent = "<!DOCTYPE html>\n" +
            "<html>\n" +
            "<body style=\"margin:0;padding:0;background:#05070b;font-family:Inter,Arial,sans-serif;\">\n" +
            "  <div style=\"max-width:600px;margin:40px auto;padding:1px;background:radial-gradient(circle at 30% 30%,rgba(201,242,143,0.12),transparent 40%),radial-gradient(circle at 70% 70%,rgba(201,242,143,0.08),transparent 40%);border-radius:16px;\">\n" +
            "    <div style=\"background:#0b0f14;border-radius:16px;padding:36px;color:#e5e7eb;position:relative;overflow:hidden;\">\n" +
            "      <!-- dot matrix -->\n" +
            "      <div style=\"position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);background-size:22px 22px;opacity:0.4;\"></div>\n" +
            "      <div style=\"position:relative;z-index:2;\">\n" +
            "        <h2 style=\"margin:0 0 8px 0;color:#c9f28f;font-weight:600;\">Password Reset</h2>\n" +
            "        <p style=\"margin:0 0 20px 0;color:#9ca3af;font-size:14px;\">Use the code below to reset your password.</p>\n" +
            "        <div style=\"margin:28px 0;padding:24px;border-radius:12px;background:#05070b;border:1px solid #111827;text-align:center;\">\n" +
            "          <p style=\"margin:0;color:#6b7280;font-size:12px;letter-spacing:1px;\">RESET CODE</p>\n" +
            "          <h1 style=\"margin:12px 0 6px 0;font-size:34px;letter-spacing:6px;color:#c9f28f;font-weight:600;\">" + otpCode + "</h1>\n" +
            "          <p style=\"margin:0;color:#6b7280;font-size:12px;\">Expires in 5 minutes</p>\n" +
            "        </div>\n" +
            "        <p style=\"font-size:13px;color:#9ca3af;\">Enter this code to securely update your password.</p>\n" +
            "        <hr style=\"border:none;border-top:1px solid #111827;margin:24px 0;\" />\n" +
            "        <p style=\"font-size:11px;color:#6b7280;\">If this wasn\u2019t you, no action is required.</p>\n" +
            "        <p style=\"margin-top:20px;font-size:12px;color:#9ca3af;\">UniClub Security</p>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "</body>\n" +
            "</html>";

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

            return ResponseEntity.ok(ApiResponse.ok("If the email is registered, an OTP has been sent.", null));
        } catch (Exception e) {
            e.printStackTrace();
            return serverError("Failed to process request: " + e.getMessage());
        }
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ApiResponse<String>> verifyResetOtp(@RequestBody VerifyOtpRequest req) {
        if (req.getEmail() == null || req.getOtp() == null) {
            return badRequest("Email and OTP required");
        }
        
        com.uniclub.backend.entity.OtpVerification otpRec = otpRepository.findByEmail(req.getEmail()).orElse(null);
        if (otpRec == null) {
            return badRequest("No OTP request found for this email");
        }
        
        if (otpRec.getExpiryTime().isBefore(java.time.LocalDateTime.now())) {
            return badRequest("OTP has expired. Please request a new one.");
        }
        
        if (!otpRec.getOtp().equals(req.getOtp())) {
            return badRequest("Invalid OTP. Please try again.");
        }
        
        otpRec.setVerified(true);
        otpRepository.save(otpRec);
        
        return ResponseEntity.ok(ApiResponse.ok("OTP verified successfully. You can now reset your password.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody java.util.Map<String, String> body) {
        try {
            String email = body.get("email");
            String newPassword = body.get("newPassword");
            
            if (email == null || newPassword == null || newPassword.length() < 6) {
                return badRequest("Email and a valid new password (min 6 characters) are required");
            }
            
            com.uniclub.backend.entity.OtpVerification otpRec = otpRepository.findByEmail(email).orElse(null);
            if (otpRec == null || !otpRec.isVerified()) {
                return badRequest("OTP not verified or expired. Please request a new one.");
            }
            
            User user = userService.findByEmail(email).orElse(null);
            if (user == null) {
                return badRequest("User not found");
            }
            
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            // Invalidate OTP after use
            otpRepository.delete(otpRec);
            
            return ResponseEntity.ok(ApiResponse.ok("Password reset successfully. You can now log in.", null));
        } catch (Exception e) {
            e.printStackTrace();
            return serverError("Failed to reset password: " + e.getMessage());
        }
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

    @GetMapping("/test-hash")
    public ResponseEntity<String> testHash() {
        User u = userRepository.findByEmail("riya@apsit.edu.in").orElse(null);
        if (u == null) return ResponseEntity.ok("Not found");
        boolean match = passwordEncoder.matches("123456", u.getPassword());
        return ResponseEntity.ok("DB Pass: " + u.getPassword() + " | Match 123456: " + match);
    }

    private <T> ResponseEntity<ApiResponse<T>> badRequest(String msg) {
        return ResponseEntity.badRequest().body(ApiResponse.error(msg));
    }

    private <T> ResponseEntity<ApiResponse<T>> serverError(String msg) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(msg));
    }
}
