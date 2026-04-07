package com.uniclub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String fullName;
    private String email;
    @Column(name = "password")
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    private String department;
    private String year;
    private String mobile;
    private String moodleId;

    @OneToMany(mappedBy = "student")
    @JsonIgnore
    private List<Registration> registrations;
}
