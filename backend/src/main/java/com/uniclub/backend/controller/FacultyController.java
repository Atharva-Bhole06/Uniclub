package com.uniclub.backend.controller;

import com.uniclub.backend.entity.Club;
import com.uniclub.backend.entity.Role;
import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.UserRepository;
import com.uniclub.backend.service.EventService;
import com.uniclub.backend.service.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/faculty")

public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @Autowired
    private EventService eventService;

    @Autowired
    private UserRepository userRepository;

    // Helper to evaluate mock auth tokens and strictly enforce FACULTY bounds
    private User enforceFacultyAuth(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer dev-token-")) {
            throw new RuntimeException("Unauthorized: Valid Developer Token required");
        }
        String idStr = authHeader.substring("Bearer dev-token-".length());
        int userId;
        try {
            userId = Integer.parseInt(idStr);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Malformed mock token format");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        if (user.getRole() != Role.FACULTY) {
            throw new RuntimeException("Forbidden: Resource strictly requires FACULTY role");
        }
        return user;
    }

    @PostMapping("/create-club-with-head")
    public ResponseEntity<?> createClubWithHead(@RequestHeader(value = "Authorization", required = false) String token, @RequestBody com.uniclub.backend.dto.CreateClubRequest request) {
        try {
            User loggedInFaculty = enforceFacultyAuth(token);
            Club created = facultyService.createClubWithHead(request, loggedInFaculty);
            return ResponseEntity.ok(Map.of(
                    "message", "Club created and head assigned successfully",
                    "club", created
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-clubs")
    public ResponseEntity<?> getMyClubs(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User loggedInFaculty = enforceFacultyAuth(token);
            return ResponseEntity.ok(facultyService.getMyClubs(loggedInFaculty));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── GET /api/faculty/events/pending ────────────────────────────────────
    @GetMapping("/events/pending")
    public ResponseEntity<?> getPendingEvents(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            enforceFacultyAuth(token);
            return ResponseEntity.ok(eventService.getPendingEvents());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── PUT /api/faculty/events/{id}/approve ─────────────────────────────
    @PutMapping("/events/{id}/approve")
    public ResponseEntity<?> approveEvent(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long id) {
        try {
            enforceFacultyAuth(token);
            var event = eventService.approveEvent(id);
            return ResponseEntity.ok(Map.of("message", "Event approved", "event", event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── PUT /api/faculty/events/{id}/reject ──────────────────────────────
    @PutMapping("/events/{id}/reject")
    public ResponseEntity<?> rejectEvent(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            enforceFacultyAuth(token);
            String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : null;
            var event = eventService.rejectEvent(id, reason);
            return ResponseEntity.ok(Map.of("message", "Event rejected", "event", event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── GET /api/faculty/events/approved ─────────────────────────────────────
    @GetMapping("/events/approved")
    public ResponseEntity<?> getApprovedEvents(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            enforceFacultyAuth(token);
            return ResponseEntity.ok(eventService.getApprovedEvents());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
