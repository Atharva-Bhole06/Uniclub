package com.uniclub.backend.dto;

import lombok.Data;

@Data
public class CreateClubRequest {
    private String name;
    private String description;
    private String studentEmail;
}
