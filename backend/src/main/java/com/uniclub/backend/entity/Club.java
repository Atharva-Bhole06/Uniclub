package com.uniclub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Data
public class Club {

    @Transient
    private int memberCount;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(length = 1000)
    private String description;

    private String category;
    private String posterUrl;
    private String websiteLink;

    @Column(columnDefinition = "varchar(255) default 'General'")
    private String stream;

    @Column(columnDefinition = "varchar(255) default 'Other'")
    private String type;

    @Column(columnDefinition = "boolean default false")
    private boolean hiringOpen;

    private String interviewDate;
    private String interviewTime;

    public String getStream() {
        return stream != null ? stream : "General";
    }

    public String getType() {
        return type != null ? type : "Other";
    }

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
