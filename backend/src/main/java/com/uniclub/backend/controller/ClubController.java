package com.uniclub.backend.controller;

import com.uniclub.backend.entity.Club;
import com.uniclub.backend.entity.Event;
import com.uniclub.backend.repository.ClubRepository;
import com.uniclub.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clubs")

public class ClubController {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private com.uniclub.backend.repository.UserRepository userRepository;

    @Autowired
    private com.uniclub.backend.repository.VolunteerApplicationRepository volunteerRepo;

    @Autowired
    private com.uniclub.backend.repository.NotificationRepository notificationRepo;

    // ── GET /api/clubs  (list all, optional filter by category) ──────────────
    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String stream,
            @RequestParam(required = false) String type) {
            
        List<Club> allClubs = clubRepository.findAll();
        for (Club c : allClubs) {
            long volunteers = volunteerRepo.findByClubId(c.getId()).stream().filter(a -> "ACCEPTED".equals(a.getStatus())).count();
            int heads = c.getHead() != null ? 1 : 0;
            c.setMemberCount((int) volunteers + heads);
        }
        
        List<Club> filtered = allClubs.stream()
            .filter(c -> category == null || category.trim().isEmpty() || (c.getCategory() != null && c.getCategory().equalsIgnoreCase(category)))
            .filter(c -> stream == null || stream.trim().isEmpty() || c.getStream().equalsIgnoreCase(stream))
            .filter(c -> type == null || type.trim().isEmpty() || c.getType().equalsIgnoreCase(type))
            .toList();
            
        return ResponseEntity.ok(filtered);
    }

    // ── GET /api/clubs/{id}  (single club with full details) ─────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getClubById(@PathVariable Long id) {
        java.util.Optional<Club> clubOpt = clubRepository.findById(id);
        if (clubOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Club not found"));
        }
        Club c = clubOpt.get();
        long volunteers = volunteerRepo.findByClubId(c.getId()).stream().filter(a -> "ACCEPTED".equals(a.getStatus())).count();
        int heads = c.getHead() != null ? 1 : 0;
        c.setMemberCount((int) volunteers + heads);
        return ResponseEntity.ok(c);
    }

    // ── GET /api/clubs/{id}/events  (events for a club, empty list if none) ──
    @GetMapping("/{id}/events")
    public ResponseEntity<?> getClubEvents(@PathVariable Long id) {
        if (!clubRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("message", "Club not found"));
        }
        List<Event> events = eventRepository.findByClubId(id);
        return ResponseEntity.ok(events != null ? events : Collections.emptyList());
    }

    // ── GET /api/clubs/{id}/members  (members who registered for club events) 
    // Returns basic member info; returns empty list safely if no members yet.
    @GetMapping("/{id}/members")
    public ResponseEntity<?> getClubMembers(@PathVariable Long id) {
        Club club = clubRepository.findById(id).orElse(null);
        if (club == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Club not found"));
        }
        List<Map<String, Object>> members = new java.util.ArrayList<>();
        if (club.getHead() != null) {
            members.add(Map.of(
                "id", club.getHead().getId(),
                "name", club.getHead().getFullName(),
                "role", "Head"
            ));
        }
        var volunteers = volunteerRepo.findByClubId(id).stream()
                .filter(a -> "ACCEPTED".equals(a.getStatus()))
                .toList();
        for (var v : volunteers) {
            members.add(Map.of(
                "id", v.getUser().getId(),
                "name", v.getUser().getFullName(),
                "role", v.getRole() != null ? v.getRole() : "Volunteer"
            ));
        }
        return ResponseEntity.ok(members);
    }

    // ── POST /api/clubs/{id}/join ─────────────────────────────────────────────
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinClub(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Club club = clubRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Club not found"));

            if (!club.isHiringOpen()) {
                throw new RuntimeException("Hiring is currently closed for this club");
            }

            Integer userId = Integer.valueOf(body.get("userId").toString());
            String role = (String) body.get("role");

            if (volunteerRepo.existsByUserIdAndClubId(userId, club.getId())) {
                throw new RuntimeException("You have already applied to this club");
            }

            com.uniclub.backend.entity.User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            com.uniclub.backend.entity.VolunteerApplication app = new com.uniclub.backend.entity.VolunteerApplication();
            app.setClub(club);
            app.setUser(user);
            app.setRole(role);
            app.setStatus("PENDING");
            app.setAppliedAt(java.time.LocalDateTime.now());
            volunteerRepo.save(app);

            // Notify Club Head
            if (club.getHead() != null) {
                com.uniclub.backend.entity.Notification notif = new com.uniclub.backend.entity.Notification();
                notif.setUser(club.getHead());
                notif.setMessage(user.getFullName() + " applied as " + role + " for your club.");
                notificationRepo.save(notif);
            }

            return ResponseEntity.ok(Map.of("message", "Application submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
