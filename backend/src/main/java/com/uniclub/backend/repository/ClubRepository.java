package com.uniclub.backend.repository;

import com.uniclub.backend.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    List<Club> findByFaculty(com.uniclub.backend.entity.User faculty);
    List<Club> findByCategory(String category);
    java.util.Optional<Club> findByHead(com.uniclub.backend.entity.User head);
}
