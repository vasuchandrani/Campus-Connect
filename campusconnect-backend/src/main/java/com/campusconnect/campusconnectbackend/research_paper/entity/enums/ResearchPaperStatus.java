package com.campusconnect.campusconnectbackend.research_paper.entity.enums;

public enum ResearchPaperStatus {
    PROFESSOR_SUBMITTED,    // direct publish within college
    STUDENT_SUBMITTED,      // awaiting professor assignment
    NOT_REVIEWED,           // unreviewed submission awaiting assignment
    UNDER_REVIEW,           // professor assigned and reviewing
    APPROVED,               // approved and published within college
    ACCEPTED,               // accepted and published
    REJECTED,               // rejected by professor
    DELETED,                // removed by college admin after publication
    GLOBALIZATION_REQUESTED,// professor requested publication across colleges
    UNDER_VOTING,           // all college-admin voting for publish global
    GLOBALLY_PUBLISHED      // published globally
}
