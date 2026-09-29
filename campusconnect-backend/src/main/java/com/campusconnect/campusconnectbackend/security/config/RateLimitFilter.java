package com.campusconnect.campusconnectbackend.security.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * BUG-028 fix: Simple in-memory rate limiter for auth endpoints.
 * Limits login, signup, password reset, and verification code endpoints
 * to prevent brute-force attacks and credential stuffing.
 *
 * Uses a per-IP sliding window approach with automatic cleanup.
 * For production clusters, consider replacing with a Redis-based solution.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Max requests per window per IP
    private static final int MAX_REQUESTS = 10;
    // Window duration in milliseconds (1 minute)
    private static final long WINDOW_MS = 60_000L;
    // Cleanup interval: remove stale entries every 5 minutes
    private static final long CLEANUP_INTERVAL_MS = 300_000L;

    private final Map<String, RateWindow> requestCounts = new ConcurrentHashMap<>();
    private volatile long lastCleanup = System.currentTimeMillis();

    // Paths that should be rate-limited
    private static final String[] RATE_LIMITED_PATHS = {
            "/campus-connect/student/login",
            "/campus-connect/student/signup",
            "/campus-connect/college-admin/login",
            "/campus-connect/college-admin/signup",
            "/campus-connect/professor/login",
            "/campus-connect/professor/signup",
            "/campus-connect/journalist/login",
            "/campus-connect/security/send-code",
            "/campus-connect/security/verify-code",
            "/campus-connect/security/reset-pwd",
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only rate-limit specific auth endpoints
        if (!isRateLimitedPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Only rate-limit POST requests (login/signup/verify attempts)
        if (!"POST".equalsIgnoreCase(request.getMethod()) && !"PATCH".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String key = clientIp + ":" + path;

        // Periodic cleanup of stale entries
        cleanupIfNeeded();

        RateWindow window = requestCounts.computeIfAbsent(key, k -> new RateWindow());

        if (window.isRateLimited()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"error\":\"Too many requests. Please wait a moment and try again.\",\"status\":\"TOO_MANY_REQUESTS\"}"
            );
            return;
        }

        window.increment();
        filterChain.doFilter(request, response);
    }

    private boolean isRateLimitedPath(String path) {
        for (String limitedPath : RATE_LIMITED_PATHS) {
            if (path.equals(limitedPath)) {
                return true;
            }
        }
        return false;
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            // Take the first IP (original client)
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void cleanupIfNeeded() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
            lastCleanup = now;
            requestCounts.entrySet().removeIf(entry -> entry.getValue().isExpired());
        }
    }

    /**
     * Sliding window rate counter.
     */
    private static class RateWindow {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        boolean isRateLimited() {
            resetIfExpired();
            return count.get() >= MAX_REQUESTS;
        }

        void increment() {
            resetIfExpired();
            count.incrementAndGet();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - windowStart > WINDOW_MS * 2;
        }

        private void resetIfExpired() {
            long now = System.currentTimeMillis();
            if (now - windowStart > WINDOW_MS) {
                synchronized (this) {
                    if (now - windowStart > WINDOW_MS) {
                        count.set(0);
                        windowStart = now;
                    }
                }
            }
        }
    }
}
