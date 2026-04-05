package com.uniclub.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // ✅ Enable CORS (uses bean below)
                .cors(Customizer.withDefaults())

                // ✅ Disable CSRF for development
                .csrf(AbstractHttpConfigurer::disable)

                // ✅ IMPORTANT: Allow OPTIONS (preflight) requests
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ Allow your frontend (standard and backup ports)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));

        // ✅ Allow all necessary methods (including OPTIONS)
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        // ✅ Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // ✅ Allow credentials (important if using cookies/JWT later)
        configuration.setAllowCredentials(true);

        // ✅ Cache preflight response
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // Apply to all endpoints
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
