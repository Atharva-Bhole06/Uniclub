package com.uniclub.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime registeredAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private User student;

    @ManyToOne
    @JoinColumn(name = "event_id")
    @ToString.Exclude
    private Event event;
}
