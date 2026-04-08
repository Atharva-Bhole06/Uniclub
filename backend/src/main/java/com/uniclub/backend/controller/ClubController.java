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

    // ── GET /api/clubs  (list all, optional filter by category) ──────────────
    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs(@RequestParam(required = false) String category) {
        if (category != null && !category.trim().isEmpty()) {
            return ResponseEntity.ok(clubRepository.findByCategory(category));
        }
        return ResponseEntity.ok(clubRepository.findAll());
    }

    // ── GET /api/clubs/{id}  (single club with full details) ─────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getClubById(@PathVariable Long id) {
        return clubRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(Map.of("message", "Club not found")));
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
        if (!clubRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("message", "Club not found"));
        }
        // For now return an empty list — member tracking will be wired in a future phase
        return ResponseEntity.ok(Collections.emptyList());
    }
}

