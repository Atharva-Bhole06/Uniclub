package com.uniclub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class VolunteerApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "club_id")
    private Club club;

    private String role; // Selected profession (e.g., Tech, Design, etc.)

    private String status; // PENDING, ACCEPTED, REJECTED

    private LocalDateTime appliedAt;
}
