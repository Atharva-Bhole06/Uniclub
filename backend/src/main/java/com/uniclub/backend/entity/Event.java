package com.uniclub.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String venue;

    private String posterUrl;

    private String registrationLink;

    // Status values: PENDING | APPROVED | REJECTED
    private String status;
    
    @Column(length = 1000)
    private String rejectionReason;

    @ManyToOne
    @JoinColumn(name = "club_id")
    private Club club;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "event")
    @JsonIgnore
    @ToString.Exclude
    private List<Registration> registrations;
}
