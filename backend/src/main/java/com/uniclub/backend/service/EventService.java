package com.uniclub.backend.service;

import com.uniclub.backend.entity.Club;
import com.uniclub.backend.entity.Event;
import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.ClubRepository;
import com.uniclub.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ClubRepository clubRepository;

    // ── Student: upcoming APPROVED events (date >= now) ───────────────────────
    public List<Event> getUpcomingEvents() {
        return eventRepository.findApprovedUpcoming(LocalDateTime.now());
    }

    // ── Student: past APPROVED events (date < now) ────────────────────────────
    public List<Event> getPastEvents() {
        return eventRepository.findApprovedPast(LocalDateTime.now());
    }

    // ── Faculty: all PENDING events ───────────────────────────────────────────
    public List<Event> getPendingEvents() {
        return eventRepository.findByStatusOrderByStartTimeAsc("PENDING");
    }

    // ── ClubHead: create event (status = PENDING) ─────────────────────────────
    public Event createEvent(Map<String, Object> body, User head) {
        Long clubId = Long.valueOf(body.get("clubId").toString());
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        if (club.getHead() == null || club.getHead().getId() != head.getId()) {
            throw new RuntimeException("Unauthorized: You are not the head of this club");
        }

        Event event = new Event();
        event.setTitle((String) body.get("title"));
        event.setDescription((String) body.get("description"));

        String startTimeStr = (String) body.get("startTime");
        if (startTimeStr != null && !startTimeStr.isEmpty()) {
            event.setStartTime(LocalDateTime.parse(startTimeStr));
        }

        String endTimeStr = (String) body.get("endTime");
        if (endTimeStr != null && !endTimeStr.isEmpty()) {
            event.setEndTime(LocalDateTime.parse(endTimeStr));
        }

        event.setVenue((String) body.get("venue"));
        event.setPosterUrl((String) body.get("posterUrl"));
        event.setRegistrationLink((String) body.get("registrationLink"));

        event.setClub(club);
        event.setCreatedBy(head);
        event.setStatus("PENDING");

        return eventRepository.save(event);
    }

    // ── Faculty: approve event ────────────────────────────────────────────────
    public Event approveEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus("APPROVED");
        return eventRepository.save(event);
    }

    // ── Faculty: reject event ─────────────────────────────────────────────────
    public Event rejectEvent(Long eventId, String reason) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus("REJECTED");
        event.setRejectionReason(reason);
        return eventRepository.save(event);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    // ── ClubHead: all events for a specific club ──────────────────────────────
    public List<Event> getEventsByClub(Long clubId) {
        return eventRepository.findByClubId(clubId);
    }

    // ── Faculty: all APPROVED events (for attendance monitor) ─────────────────
    public List<Event> getApprovedEvents() {
        return eventRepository.findByStatusOrderByStartTimeAsc("APPROVED");
    }
}

