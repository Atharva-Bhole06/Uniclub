package com.uniclub.backend.service;

import com.uniclub.backend.entity.Club;
import com.uniclub.backend.entity.Role;
import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.ClubRepository;
import com.uniclub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FacultyService {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    public Club createClub(Club club, User loggedInFaculty) {
        if (club.getName() == null || club.getName().isBlank()) {
            throw new RuntimeException("Club name required");
        }
        club.setFaculty(loggedInFaculty);
        return clubRepository.save(club);
    }

    @org.springframework.transaction.annotation.Transactional
    public Club createClubWithHead(com.uniclub.backend.dto.CreateClubRequest request, User loggedInFaculty) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Club name required");
        }
        
        // Validate student exists
        User student = userRepository.findByEmail(request.getStudentEmail())
                .orElseThrow(() -> new RuntimeException("Student not found"));
                
        // Prevent duplicate head
        if (student.getRole() == Role.CLUB_HEAD) {
            throw new RuntimeException("Student is already a club head");
        }

        // Promote student
        student.setRole(Role.CLUB_HEAD);
        userRepository.save(student);

        // Create club
        Club club = new Club();
        club.setName(request.getName());
        club.setDescription(request.getDescription());
        club.setFaculty(loggedInFaculty);
        club.setHead(student);
        
        return clubRepository.save(club);
    }

    public java.util.List<Club> getMyClubs(User loggedInFaculty) {
        return clubRepository.findByFaculty(loggedInFaculty);
    }

    public User promoteToClubHead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (user.getRole() == Role.CLUB_HEAD) {
            throw new RuntimeException("User already a club head");
        }
        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can be promoted to club head");
        }

        user.setRole(Role.CLUB_HEAD);
        return userRepository.save(user);
    }

    public Club assignHead(Long clubId, String moodleId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        if (club.getHead() != null) {
            throw new RuntimeException("Club already has a head");
        }

        User user = userRepository.findByMoodleId(moodleId)
                .orElseThrow(() -> new RuntimeException("User not found or invalid Moodle ID"));

        if (user.getRole() != Role.CLUB_HEAD && user.getRole() != Role.STUDENT) {
            throw new RuntimeException("User must be a STUDENT or CLUB_HEAD");
        }

        club.setHead(user);
        return clubRepository.save(club);
    }
}
