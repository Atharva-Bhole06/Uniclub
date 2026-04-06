package com.uniclub.backend.service;

import com.uniclub.backend.entity.Event;
import com.uniclub.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public List<Event> getUpcomingEvents() {
        return eventRepository.findByStatus("UPCOMING");
    }

    public List<Event> getPastEvents() {
        return eventRepository.findByStatus("COMPLETED");
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }
}
