package com.uniclub.backend.repository;

import com.uniclub.backend.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, String> {
    List<AttendanceSession> findByEventId(Long eventId);
}
