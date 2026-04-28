package com.uniclub.backend;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CheckHashTest {
    @Test
    public void testHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String generated = encoder.encode("123456");
        System.out.println("GENERATED_HASH_FOR_123456: " + generated);
        assertTrue(encoder.matches("123456", generated));
    }
}
