package com.uniclub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class AttendanceSession {

    @Id
    private String id; // UUID for the QR code

    @ManyToOne
    @JoinColumn(name = "event_id")
    @JsonIgnoreProperties({"registrations", "createdBy", "club"})
    private Event event;

    private LocalDateTime expiresAt;

    @ElementCollection
    @CollectionTable(name = "attendance_session_custom_fields", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "field_name")
    private List<String> customFields;
}
