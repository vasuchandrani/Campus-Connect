package com.campusconnect.campusconnectbackend.security.config;

import com.campusconnect.campusconnectbackend.security.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // public routes
                        .requestMatchers(
                                "/campus-connect/college-admin/signup",
                                "/campus-connect/college-admin/login",
                                "/campus-connect/college-admin/create-order",
                                "/campus-connect/college-admin/verify",

                                "/campus-connect/student/signup",
                                "/campus-connect/student/login",

                                "/campus-connect/journalist/login",
                                "/campus-connect/reviewer/login",

                                "/campus-connect/colleges",

                                "/campus-connect/email/**",

                                "/campus-connect/security/reset-pwd",
                                "/campus-connect/security/send-code",
                                "/campus-connect/security/verify-code"
                        ).permitAll()

                        // Role-based routes
                        .requestMatchers("/campus-connect/college-admin/**")
                        .hasRole("COLLEGE_ADMIN")

                        .requestMatchers("/campus-connect/student/**")
                        .hasRole("STUDENT")

                        .requestMatchers("/campus-connect/journalist/**")
                        .hasRole("JOURNALIST")

                        .requestMatchers("/campus-connect/reviewer/**")
                        .hasRole("REVIEWER")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}