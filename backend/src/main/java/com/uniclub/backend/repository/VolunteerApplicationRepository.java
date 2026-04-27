package com.uniclub.backend.repository;

import com.uniclub.backend.entity.VolunteerApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VolunteerApplicationRepository extends JpaRepository<VolunteerApplication, Long> {
    List<VolunteerApplication> findByClubId(Long clubId);
    List<VolunteerApplication> findByUserId(Integer userId);
    Optional<VolunteerApplication> findByUserIdAndClubId(Integer userId, Long clubId);
    boolean existsByUserIdAndClubId(Integer userId, Long clubId);
}
