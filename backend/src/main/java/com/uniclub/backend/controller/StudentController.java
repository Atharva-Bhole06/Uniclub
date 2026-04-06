package com.uniclub.backend.controller;

import com.uniclub.backend.entity.Event;
import com.uniclub.backend.entity.Registration;
import com.uniclub.backend.service.EventService;
import com.uniclub.backend.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private EventService eventService;

    @Autowired
    private RegistrationService registrationService;

    @GetMapping("/events/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @GetMapping("/events/past")
    public ResponseEntity<List<Event>> getPastEvents() {
        return ResponseEntity.ok(eventService.getPastEvents());
    }

    @PostMapping("/register/{eventId}")
    public ResponseEntity<?> register(@PathVariable Long eventId, @RequestParam Integer userId) {
        try {
            Registration registration = registrationService.register(userId, eventId);
            return ResponseEntity.ok(registration);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<Event>> getMyEvents(@RequestParam Integer userId) {
        return ResponseEntity.ok(registrationService.getRegisteredEvents(userId));
    }

    @GetMapping("/event/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }
}
