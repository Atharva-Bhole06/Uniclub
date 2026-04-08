package com.uniclub.backend.controller;

import com.uniclub.backend.entity.Club;
import com.uniclub.backend.entity.Role;
import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.ClubRepository;
import com.uniclub.backend.repository.EventRepository;
import com.uniclub.backend.repository.UserRepository;
import com.uniclub.backend.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/head")
@CrossOrigin(origins = "http://localhost:5173")
public class ClubHeadController {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventService eventService;

    // ── Auth helper (same dev-token pattern as rest of app) ──────────────────
    private User enforceClubHeadAuth(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer dev-token-")) {
            throw new RuntimeException("Unauthorized: Valid token required");
        }
        String idStr = authHeader.substring("Bearer dev-token-".length());
        int userId;
        try {
            userId = Integer.parseInt(idStr);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Malformed token");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.CLUB_HEAD) {
            throw new RuntimeException("Forbidden: CLUB_HEAD role required");
        }
        return user;
    }

    // ── GET /api/head/my-club ────────────────────────────────────────────────
    @GetMapping("/my-club")
    public ResponseEntity<?> getMyClub(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User head = enforceClubHeadAuth(authHeader);
            Club club = clubRepository.findByHead(head)
                    .orElseThrow(() -> new RuntimeException("No club assigned to this head"));
            return ResponseEntity.ok(club);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── PUT /api/head/club/update ────────────────────────────────────────────
    @PutMapping("/club/update")
    public ResponseEntity<?> updateClub(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        try {
            User head = enforceClubHeadAuth(authHeader);

            Long clubId = Long.valueOf(body.get("clubId").toString());
            Club club = clubRepository.findById(clubId)
                    .orElseThrow(() -> new RuntimeException("Club not found"));

            // Security: ensure this head owns the club
            if (club.getHead() == null || club.getHead().getId() != head.getId()) {
                throw new RuntimeException("Unauthorized: You are not the head of this club");
            }

            if (body.containsKey("description")) {
                club.setDescription((String) body.get("description"));
            }
            if (body.containsKey("websiteLink")) {
                club.setWebsiteLink((String) body.get("websiteLink"));
            }

            clubRepository.save(club);
            return ResponseEntity.ok(Map.of("message", "Club updated successfully", "club", club));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── POST /api/head/club/upload-poster ────────────────────────────────────
    @PostMapping("/club/upload-poster")
    public ResponseEntity<?> uploadPoster(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("file") MultipartFile file,
            @RequestParam Long clubId) {
        try {
            User head = enforceClubHeadAuth(authHeader);

            Club club = clubRepository.findById(clubId)
                    .orElseThrow(() -> new RuntimeException("Club not found"));

            // Security: ensure this head owns the club
            if (club.getHead() == null || club.getHead().getId() != head.getId()) {
                throw new RuntimeException("Unauthorized: You are not the head of this club");
            }

            // Build absolute upload path relative to the Spring Boot working directory
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String baseDir = System.getProperty("user.dir");
            String absoluteUploadDir = baseDir + File.separator + "uploads" + File.separator;

            File dir = new File(absoluteUploadDir);
            if (!dir.exists()) dir.mkdirs();

            File dest = new File(absoluteUploadDir + fileName);
            file.transferTo(dest);

            club.setPosterUrl("uploads/" + fileName);
            clubRepository.save(club);

            return ResponseEntity.ok(Map.of(
                    "message", "Poster uploaded successfully",
                    "posterUrl", "uploads/" + fileName
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── POST /api/head/events  (create event, status = PENDING) ──────────────
    @PostMapping("/events")
    public ResponseEntity<?> createEvent(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        try {
            User head = enforceClubHeadAuth(authHeader);
            var event = eventService.createEvent(body, head);
            return ResponseEntity.ok(Map.of("message", "Event submitted for approval", "event", event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── GET /api/head/events  (list this head's club events) ─────────────────
    @GetMapping("/events")
    public ResponseEntity<?> getMyEvents(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User head = enforceClubHeadAuth(authHeader);
            Club club = clubRepository.findByHead(head)
                    .orElseThrow(() -> new RuntimeException("No club assigned to this head"));
            var events = eventService.getEventsByClub(club.getId());
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── POST /api/head/events/upload-poster ──────────────────────────────────
    @PostMapping("/events/upload-poster")
    public ResponseEntity<?> uploadEventPoster(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("file") MultipartFile file,
            @RequestParam Long eventId) {
        try {
            User head = enforceClubHeadAuth(authHeader);

            var event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            // SEC: Event must belong to the head's club
            if (event.getClub() == null || event.getClub().getHead() == null || event.getClub().getHead().getId() != head.getId()) {
                throw new RuntimeException("Unauthorized: You are not the head of the club that owns this event.");
            }

            String fileName = System.currentTimeMillis() + "_event_" + file.getOriginalFilename();
            String baseDir = System.getProperty("user.dir");
            String absoluteUploadDir = baseDir + File.separator + "uploads" + File.separator;

            File dir = new File(absoluteUploadDir);
            if (!dir.exists()) dir.mkdirs();

            File dest = new File(absoluteUploadDir + fileName);
            file.transferTo(dest);

            event.setPosterUrl("uploads/" + fileName);
            eventRepository.save(event);

            return ResponseEntity.ok(Map.of(
                    "message", "Event poster uploaded successfully",
                    "posterUrl", "uploads/" + fileName
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── GET /api/head/events/{eventId}/registrations ─────────────────────────
    @Autowired
    private com.uniclub.backend.service.RegistrationService registrationService;

    @GetMapping("/events/{eventId}/registrations")
    public ResponseEntity<?> getEventRegistrations(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long eventId) {
        try {
            User head = enforceClubHeadAuth(authHeader);

            var event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            // SEC: Event must belong to the head's club
            if (event.getClub() == null || event.getClub().getHead() == null || event.getClub().getHead().getId() != head.getId()) {
                throw new RuntimeException("Unauthorized: You do not own this event.");
            }

            var students = registrationService.getRegisteredStudents(eventId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
