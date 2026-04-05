package com.uniclub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String fullName;
    private String email;
    private String password;
    private String role;
    private String department;
    private String year;
    private String mobile;
    private String moodleId;
}
