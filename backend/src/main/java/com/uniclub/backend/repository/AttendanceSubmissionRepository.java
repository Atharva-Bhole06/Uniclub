package com.uniclub.backend.repository;

import com.uniclub.backend.entity.AttendanceSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AttendanceSubmissionRepository extends JpaRepository<AttendanceSubmission, Long> {
    Optional<AttendanceSubmission> findBySessionIdAndStudentId(String sessionId, Integer studentId);
}
