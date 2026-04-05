package com.uniclub.backend.dto;

/**
 * Registration request DTO.
 * Matches frontend payload: { name, email, password, role }
 */
public class RegisterRequest {
    private String name;      // maps to User.fullName
    private String email;
    private String password;
    private String role;       // STUDENT | CLUB_HEAD | FACULTY

    // Getters & Setters
    public String getName()     { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail()    { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole()     { return role; }
    public void setRole(String role) { this.role = role; }
}
