package com.uniclub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Data
public class AttendanceSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id")
    @JsonIgnoreProperties({"customFields", "event"})
    @ToString.Exclude
    private AttendanceSession session;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonIgnoreProperties({"registrations", "password"})
    @ToString.Exclude
    private User student;

    private String rollNo;
    private String division;

    // We can store default and custom responses here
    @ElementCollection
    @CollectionTable(name = "attendance_submission_responses", joinColumns = @JoinColumn(name = "submission_id"))
    @MapKeyColumn(name = "question")
    @Column(name = "answer", length = 1000)
    private Map<String, String> responses;

    private LocalDateTime submittedAt;
}
