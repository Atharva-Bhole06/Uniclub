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
        if (clubRepository.count() == 0) {
            Club codingClub = new Club();
            codingClub.setName("Coding Club");
            codingClub.setDescription("A community for tech enthusiasts and problem solvers.");
            codingClub.setCategory("Technology");
            clubRepository.save(codingClub);

            Club musicClub = new Club();
            musicClub.setName("Music Club");
            musicClub.setDescription("Where melodies meet passion.");
            musicClub.setCategory("Arts & Culture");
            clubRepository.save(musicClub);

            // Coding Club Events
            Event codingEvent1 = new Event();
            codingEvent1.setTitle("Hackathon 2026");
            codingEvent1.setDescription("Annual 24-hour coding challenge.");
            codingEvent1.setDate(LocalDateTime.now().plusDays(10));
            codingEvent1.setStatus("UPCOMING");
            codingEvent1.setClub(codingClub);
            
            Event codingEvent2 = new Event();
            codingEvent2.setTitle("Intro to Spring Boot");
            codingEvent2.setDescription("A workshop on building REST APIs.");
            codingEvent2.setDate(LocalDateTime.now().minusDays(5));
            codingEvent2.setStatus("COMPLETED");
            codingEvent2.setClub(codingClub);

            Event codingEvent3 = new Event();
            codingEvent3.setTitle("DSA Masterclass");
            codingEvent3.setDescription("Advanced data structures deep-dive.");
            codingEvent3.setDate(LocalDateTime.now().minusDays(20));
            codingEvent3.setStatus("COMPLETED");
            codingEvent3.setClub(codingClub);

            // Music Club Events
            Event musicEvent1 = new Event();
            musicEvent1.setTitle("Summer Concert");
            musicEvent1.setDescription("Annual outdoor music festival.");
            musicEvent1.setDate(LocalDateTime.now().plusDays(15));
            musicEvent1.setStatus("UPCOMING");
            musicEvent1.setClub(musicClub);

            Event musicEvent2 = new Event();
            musicEvent2.setTitle("Acoustic Night");
            musicEvent2.setDescription("A relaxing evening with acoustic performances.");
            musicEvent2.setDate(LocalDateTime.now().minusDays(10));
            musicEvent2.setStatus("COMPLETED");
            musicEvent2.setClub(musicClub);

            Event musicEvent3 = new Event();
            musicEvent3.setTitle("Vocals Workshop");
            musicEvent3.setDescription("Learn classical and contemporary vocals.");
            musicEvent3.setDate(LocalDateTime.now().minusDays(30));
            musicEvent3.setStatus("COMPLETED");
            musicEvent3.setClub(musicClub);

            eventRepository.saveAll(Arrays.asList(codingEvent1, codingEvent2, codingEvent3, musicEvent1, musicEvent2, musicEvent3));
        }
    }
}
