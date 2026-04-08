package com.uniclub.backend.repository;

import com.uniclub.backend.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByStudentId(Integer studentId);
    List<Registration> findByEventId(Long eventId);
    boolean existsByStudentIdAndEventId(Integer studentId, Long eventId);
}
