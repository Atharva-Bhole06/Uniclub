package com.uniclub.backend.repository;

import com.uniclub.backend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(String status);
    List<Event> findByClubId(Long clubId);

    // Faculty: all events awaiting approval
    List<Event> findByStatusOrderByStartTimeAsc(String status);

    // Student upcoming: APPROVED events that haven't ended yet
    @Query("SELECT e FROM Event e WHERE e.status = 'APPROVED' AND (e.endTime >= :now OR (e.endTime IS NULL AND e.startTime >= :now)) ORDER BY e.startTime ASC")
    List<Event> findApprovedUpcoming(LocalDateTime now);

    // Student past: APPROVED events that have ended
    @Query("SELECT e FROM Event e WHERE e.status = 'APPROVED' AND (e.endTime < :now OR (e.endTime IS NULL AND e.startTime < :now)) ORDER BY e.startTime DESC")
    List<Event> findApprovedPast(LocalDateTime now);
}
