package com.uniclub.backend.config;

import com.uniclub.backend.entity.Club;
import com.uniclub.backend.entity.Event;
import com.uniclub.backend.repository.ClubRepository;
import com.uniclub.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class SampleDataLoader implements CommandLineRunner {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private EventRepository eventRepository;

    @Override
    public void run(String... args) throws Exception {
        // Mock data initialization removed for Phase 0 clean state reset
    }
}
