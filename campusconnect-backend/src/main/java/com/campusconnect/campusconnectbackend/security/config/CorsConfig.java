package com.campusconnect.campusconnectbackend.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Allowed Frontend Origins & Dynamic Patterns (supports localhost, LAN/Hotspot IP addresses, and production domains)
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://10.*.*.*:*",
                "http://192.168.*.*:*",
                "https://campus-connect.xyz",
                "https://campus-conect.xyz",
                "https://www.campus-connect.xyz",
                "https://www.campus-conect.xyz"
        ));

        // Allowed HTTP Methods
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
        ));

        // Allowed Headers
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));

        // Exposed Headers
        config.setExposedHeaders(List.of(
                "Authorization",
                "Content-Disposition"
        ));

        // Allow cookies / auth headers
        config.setAllowCredentials(true);

        // Cache CORS preflight response for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}