package com.uniclub.backend.controller;

import com.uniclub.backend.entity.Club;
import com.uniclub.backend.entity.Role;
import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.UserRepository;
import com.uniclub.backend.service.EventService;
import com.uniclub.backend.service.ExcelExportService;
import com.uniclub.backend.service.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private ExcelExportService excelExportService;

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

    private User enforceFacultyOrHeadAuth(String authHeader) {
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

        if (user.getRole() != Role.FACULTY && user.getRole() != Role.CLUB_HEAD) {
            throw new RuntimeException("Forbidden: Resource strictly requires FACULTY or CLUB_HEAD role");
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

    // ── GET /api/faculty/attendance/export/{eventId} ─────────────────────────
    @GetMapping("/attendance/export/{eventId}")
    public ResponseEntity<byte[]> exportAttendanceExcel(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long eventId,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String division,
            @RequestParam(required = false) String searchRoll) {
        try {
            enforceFacultyOrHeadAuth(token);
            byte[] excelData = excelExportService.generateAttendanceExcel(eventId, branch, year, division, searchRoll);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            // We use generic filename here, frontend sets the specific name
            headers.setContentDispositionFormData("attachment", "Attendance_Report.xlsx");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(("Error generating export: " + e.getMessage() + " - " + e.getClass().getName()).getBytes());
        }
    }
}
