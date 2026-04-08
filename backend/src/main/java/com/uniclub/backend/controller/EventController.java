package com.uniclub.backend.controller;

import com.uniclub.backend.entity.Event;
import com.uniclub.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")

public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public ResponseEntity<List<Event>> getAllApprovedEvents() {
        // Return all approved events for explore pages
        List<Event> approvedEvents = eventRepository.findByStatusOrderByStartTimeAsc("APPROVED");
        return ResponseEntity.ok(approvedEvents);
    }
}
