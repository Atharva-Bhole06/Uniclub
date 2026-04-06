package com.uniclub.backend.service;

import com.uniclub.backend.entity.Event;
import com.uniclub.backend.entity.Registration;
import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.EventRepository;
import com.uniclub.backend.repository.RegistrationRepository;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EntityManager entityManager;

    public List<Event> getRegisteredEvents(Integer userId) {
        return registrationRepository.findByStudentId(userId)
                .stream()
                .map(Registration::getEvent)
                .toList();
    }

    public Registration register(Integer userId, Long eventId) {
        User user = entityManager.find(User.class, userId);
        if (user == null) {
            throw new RuntimeException("User not found: " + userId);
        }

        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        Registration registration = new Registration();
        registration.setStudent(user);
        registration.setEvent(event);
        registration.setRegisteredAt(LocalDateTime.now());

        return registrationRepository.save(registration);
    }
}
