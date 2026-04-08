package com.uniclub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Data
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(length = 1000)
    private String description;

    private String category;
    private String posterUrl;
    private String websiteLink;

    @OneToMany(mappedBy = "club")
    @JsonIgnore
    private List<Event> events;

    @ManyToOne
    @JoinColumn(name = "head_id", referencedColumnName = "id")
    private User head;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    private User faculty;
}
