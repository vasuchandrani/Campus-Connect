package com.campusconnect.campusconnectbackend.club.event.overview_generation;

import com.campusconnect.campusconnectbackend.club.event.entity.Event;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EventOverviewPromptBuilder {

    public String buildPrompt(
            Event event,
            List<String> sponsors,
            List<String> speakers,
            List<String> winners
    ) {
        return """
        You are generating a post-event summary for a web application.

        TASK:
        Generate a clean, well-formatted Markdown overview for a COMPLETED event.

        STRICT OUTPUT RULES (MUST FOLLOW):
        - Output ONLY raw Markdown
        - DO NOT include explanations, comments, or meta text
        - DO NOT use code blocks or triple backticks
        - Content must be directly renderable in a Markdown previewer
        - Use proper spacing and line breaks (no cramped content)

        FORMATTING RULES (VERY IMPORTANT):
        - Use ONE main title with `#`
        - Use section headings with `##`
        - Add a blank line after every heading
        - Write content in short paragraphs or bullet points
        - Do NOT place multiple ideas on the same line
        - Do NOT use label-style text like **Title:** or **Description:**
        - Use past tense (event has already happened)
        - Section headings must be visually clear and evenly spaced

        REQUIRED STRUCTURE (FOLLOW EXACTLY):

        # <Event Title>

        ## Overview
        - Write 2–3 short paragraphs (NOT a single paragraph)
        - Describe what the event was about, how it went, and overall participation
        - Naturally mention speakers or sponsors inside the text ONLY if provided
        - Do NOT mention missing information

        ## Highlights
        - Use bullet points
        - Mention:
          - Key sessions, activities, or outcomes
          - Winners (if provided)
          - Speakers (if informative event)
        - Skip anything that is not provided

        EVENT DATA:
        Event Title: %s
        Description: %s
        Date & Time: %s
        Location: %s
        Speakers (list): %s
        Sponsors (list): %s
        Winners (list): %s
        Prize Money: %s
        """
                .formatted(
                        event.getTitle(),
                        event.getDescription(),
                        event.getStartTime(),
                        event.getLocation(),
                        safeList(speakers),
                        safeList(sponsors),
                        safeList(winners),
                        event.getPrizeMoney() != null
                                ? "₹" + event.getPrizeMoney()
                                : ""
                );
    }

    private String safeList(List<String> list) {
        return (list == null || list.isEmpty())
                ? ""
                : String.join(", ", list);
    }
}
