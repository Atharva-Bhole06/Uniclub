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

    // ─── College reference location ─────────────────────────────────────────────
    private static final double COLLEGE_LATITUDE  = 19.2680325;
    private static final double COLLEGE_LONGITUDE = 72.9672445;
    /** Allowed campus radius in metres */
    private static final double ALLOWED_RADIUS_METERS = 300.0;

    // ─── Haversine distance (metres) ────────────────────────────────────────────
    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6_371_000; // Earth radius in metres
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // ─── Public API ────────────────────────────────────────────────────────────

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

    /**
     * Submits attendance with an optional server-side location validation.
     *
     * @param sessionId  UUID of the attendance session
     * @param studentId  ID of the submitting student
     * @param responses  Custom field answers
     * @param rollNo     Student roll number
     * @param division   Student division
     * @param latitude   Student latitude at time of submission (nullable)
     * @param longitude  Student longitude at time of submission (nullable)
     */
    public AttendanceSubmission submitAttendance(
            String sessionId,
            Integer studentId,
            Map<String, String> responses,
            String rollNo,
            String division,
            Double latitude,
            Double longitude
    ) {
        AttendanceSession session = getSession(sessionId); // validates expiry

        // ── Server-side location check ───────────────────────────────────────
        if (latitude != null && longitude != null) {
            double dist = haversineDistance(COLLEGE_LATITUDE, COLLEGE_LONGITUDE, latitude, longitude);
            if (dist > ALLOWED_RADIUS_METERS) {
                long distRounded = Math.round(dist);
                throw new RuntimeException(
                    "Location validation failed: you are " + distRounded +
                    "m from college. Attendance is only allowed within " +
                    (int) ALLOWED_RADIUS_METERS + "m of the campus."
                );
            }
        }
        // If coords are null (browser didn't provide them), the frontend gate
        // should have already blocked submission. We still proceed to avoid
        // breaking flows where location was intentionally omitted.

        boolean alreadySubmitted = submissionRepository.findAll().stream()
                .anyMatch(s -> s.getSession().getEvent().getId().equals(session.getEvent().getId())
                               && s.getStudent().getId() == studentId);

        if (alreadySubmitted) {
            throw new RuntimeException("You have already marked attendance for this event");
        }

        User student = userService.findByEmail(
                userService.getAllUsers().stream()
                        .filter(u -> u.getId() == studentId)
                        .findFirst()
                        .get()
                        .getEmail()
        ).get();

        AttendanceSubmission submission = new AttendanceSubmission();
        submission.setSession(session);
        submission.setStudent(student);
        submission.setResponses(responses);
        submission.setRollNo(rollNo);
        submission.setDivision(division);
        submission.setLatitude(latitude);
        submission.setLongitude(longitude);
        submission.setSubmittedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    public List<AttendanceSubmission> getSubmissionsByEvent(Long eventId) {
        return submissionRepository.findAll().stream()
                .filter(s -> s.getSession().getEvent().getId().equals(eventId))
                .toList();
    }
}
