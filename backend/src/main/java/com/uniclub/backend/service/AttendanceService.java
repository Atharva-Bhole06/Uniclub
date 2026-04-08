package com.uniclub.backend.service;

import com.uniclub.backend.entity.AttendanceSession;
import com.uniclub.backend.entity.AttendanceSubmission;
import com.uniclub.backend.entity.Event;
import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.AttendanceSessionRepository;
import com.uniclub.backend.repository.AttendanceSubmissionRepository;
import com.uniclub.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceSubmissionRepository submissionRepository;
    private final EventRepository eventRepository;
    private final UserService userService;

    public AttendanceSession generateQR(Long eventId, List<String> customFields) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        List<AttendanceSession> existingSessions = sessionRepository.findByEventId(eventId);
        if (existingSessions.size() >= 3) {
            throw new RuntimeException("Maximum of 3 QR generation attempts reached for this event");
        }

        AttendanceSession session = new AttendanceSession();
        session.setId(UUID.randomUUID().toString());
        session.setEvent(event);
        session.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        session.setCustomFields(customFields);

        return sessionRepository.save(session);
    }

    public AttendanceSession getSession(String sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This QR code has expired");
        }
        return session;
    }

    public AttendanceSubmission submitAttendance(String sessionId, Integer studentId, Map<String, String> responses, String rollNo, String division) {
        AttendanceSession session = getSession(sessionId); // validates expiry

        boolean alreadySubmitted = submissionRepository.findAll().stream()
                .anyMatch(s -> s.getSession().getEvent().getId().equals(session.getEvent().getId())
                               && s.getStudent().getId() == studentId);

        if (alreadySubmitted) {
            throw new RuntimeException("You have already marked attendance for this event");
        }

        User student = userService.findByEmail(userService.getAllUsers().stream().filter(u -> u.getId() == studentId).findFirst().get().getEmail()).get();

        AttendanceSubmission submission = new AttendanceSubmission();
        submission.setSession(session);
        submission.setStudent(student);
        submission.setResponses(responses);
        submission.setRollNo(rollNo);
        submission.setDivision(division);
        submission.setSubmittedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    public List<AttendanceSubmission> getSubmissionsByEvent(Long eventId) {
        return submissionRepository.findAll().stream()
                .filter(s -> s.getSession().getEvent().getId().equals(eventId))
                .toList();
    }
}
