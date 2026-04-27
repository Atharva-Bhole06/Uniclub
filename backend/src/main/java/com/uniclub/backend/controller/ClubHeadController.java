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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/head")
public class ClubHeadController {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventService eventService;

    @Autowired
    private com.uniclub.backend.repository.VolunteerApplicationRepository volunteerRepo;

    @Autowired
    private com.uniclub.backend.repository.NotificationRepository notificationRepo;

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
        if (user.getRole() != Role.CLUB_HEAD && user.getRole() != Role.CO_HEAD) {
            throw new RuntimeException("Forbidden: CLUB_HEAD or CO_HEAD role required");
        }
        return user;
    }

    private Club getClubForUser(User user) {
        if (user.getRole() == Role.CLUB_HEAD || user.getRole() == Role.CO_HEAD) {
            // First check if they are the primary head
            var primaryClub = clubRepository.findByHead(user);
            if (primaryClub.isPresent()) {
                return primaryClub.get();
            }
            // If not primary head, check if they are an accepted volunteer (co-head)
            return volunteerRepo.findByUserId(user.getId()).stream()
                    .filter(app -> "ACCEPTED".equals(app.getStatus()))
                    .findFirst()
                    .map(app -> app.getClub())
                    .orElseThrow(() -> new RuntimeException("No club assigned to this user"));
        }
        throw new RuntimeException("Unauthorized user role");
    }

    // ── GET /api/head/my-club ────────────────────────────────────────────────
    @GetMapping("/my-club")
    public ResponseEntity<?> getMyClub(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User head = enforceClubHeadAuth(authHeader);
            Club club = getClubForUser(head);
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

            // Security: ensure this user manages the club
            Club managedClub = getClubForUser(head);
            if (managedClub.getId() != clubId.longValue()) {
                throw new RuntimeException("Unauthorized: You do not manage this club");
            }

            if (body.containsKey("description")) {
                club.setDescription((String) body.get("description"));
            }
            if (body.containsKey("websiteLink")) {
                club.setWebsiteLink((String) body.get("websiteLink"));
            }
            if (body.containsKey("stream")) {
                club.setStream((String) body.get("stream"));
            }
            if (body.containsKey("type")) {
                club.setType((String) body.get("type"));
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

            // Security: ensure this user manages the club
            Club managedClub = getClubForUser(head);
            if (managedClub.getId() != clubId.longValue()) {
                throw new RuntimeException("Unauthorized: You do not manage this club");
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
            Club club = getClubForUser(head);
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

            // SEC: Event must belong to the user's club
            Club managedClub = getClubForUser(head);
            if (event.getClub() == null || event.getClub().getId() != managedClub.getId()) {
                throw new RuntimeException("Unauthorized: You do not manage the club that owns this event.");
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

            // SEC: Event must belong to the user's club
            Club managedClub = getClubForUser(head);
            if (event.getClub() == null || event.getClub().getId() != managedClub.getId()) {
                throw new RuntimeException("Unauthorized: You do not own this event.");
            }

            var students = registrationService.getRegisteredStudents(eventId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── PUT /api/head/club/hiring ────────────────────────────────────────────
    @PutMapping("/club/hiring")
    public ResponseEntity<?> toggleHiring(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        try {
            User head = enforceClubHeadAuth(authHeader);
            Club club = getClubForUser(head);

            boolean hiringOpen = Boolean.parseBoolean(body.get("hiringOpen").toString());
            club.setHiringOpen(hiringOpen);
            
            if (body.containsKey("interviewDate")) {
                club.setInterviewDate((String) body.get("interviewDate"));
            }
            if (body.containsKey("interviewTime")) {
                club.setInterviewTime((String) body.get("interviewTime"));
            }
            clubRepository.save(club);

            if (hiringOpen) {
                // Notify all students
                List<User> students = userRepository.findAll().stream()
                        .filter(u -> u.getRole() == Role.STUDENT)
                        .collect(Collectors.toList());
                for (User student : students) {
                    com.uniclub.backend.entity.Notification notif = new com.uniclub.backend.entity.Notification();
                    notif.setUser(student);
                    notif.setMessage(club.getName() + " is now hiring volunteers!");
                    notificationRepo.save(notif);
                }
            }

            return ResponseEntity.ok(Map.of("message", "Hiring status updated successfully", "hiringOpen", club.isHiringOpen()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── GET /api/head/club/volunteers ─────────────────────────────────────────
    @GetMapping("/club/volunteers")
    public ResponseEntity<?> getVolunteers(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User head = enforceClubHeadAuth(authHeader);
            Club club = getClubForUser(head);

            List<com.uniclub.backend.entity.VolunteerApplication> applications = volunteerRepo.findByClubId(club.getId());
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── PUT /api/head/club/volunteers/{appId} ─────────────────────────────────
    @PutMapping("/club/volunteers/{appId}")
    public ResponseEntity<?> updateApplicationStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long appId,
            @RequestBody Map<String, String> body) {
        try {
            User head = enforceClubHeadAuth(authHeader);
            Club club = getClubForUser(head);

            com.uniclub.backend.entity.VolunteerApplication app = volunteerRepo.findById(appId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            if (app.getClub().getId() != club.getId()) {
                throw new RuntimeException("Unauthorized: Application does not belong to your club");
            }

            String status = body.get("status");
            app.setStatus(status);
            volunteerRepo.save(app);

            // Notify student
            com.uniclub.backend.entity.Notification notif = new com.uniclub.backend.entity.Notification();
            notif.setUser(app.getUser());
            notif.setMessage("Your volunteer application for " + club.getName() + " was " + status.toLowerCase());
            notificationRepo.save(notif);

            return ResponseEntity.ok(Map.of("message", "Application " + status, "application", app));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── PUT /api/head/club/volunteers/promote/{userId} ────────────────────────
    @PutMapping("/club/volunteers/promote/{userId}")
    public ResponseEntity<?> promoteToCoHead(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer userId) {
        try {
            User head = enforceClubHeadAuth(authHeader);
            Club club = getClubForUser(head);

            com.uniclub.backend.entity.VolunteerApplication app = volunteerRepo.findByUserIdAndClubId(userId, club.getId())
                    .orElseThrow(() -> new RuntimeException("Student is not a volunteer of this club"));

            if (!"ACCEPTED".equals(app.getStatus())) {
                throw new RuntimeException("Student must be an accepted volunteer to be promoted");
            }

            User targetUser = app.getUser();
            targetUser.setRole(Role.CO_HEAD);
            userRepository.save(targetUser);
            
            // Note: If they become CLUB_HEAD, they might need a Club mapping if system assumes one head per club.
            // For now, updating the role is sufficient as requested.

            com.uniclub.backend.entity.Notification notif = new com.uniclub.backend.entity.Notification();
            notif.setUser(targetUser);
            notif.setMessage("You have been promoted to Co-Head for " + club.getName() + "!");
            notificationRepo.save(notif);

            return ResponseEntity.ok(Map.of("message", "User promoted to Co-Head successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
