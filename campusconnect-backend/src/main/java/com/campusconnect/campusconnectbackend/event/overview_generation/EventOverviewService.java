package com.campusconnect.campusconnectbackend.event.overview_generation;

import com.campusconnect.campusconnectbackend.event.entity.*;
import com.campusconnect.campusconnectbackend.event.repository.*;
import com.campusconnect.campusconnectbackend.integrations.ai.service.AiService;
import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.club.dto.req.SaveOverviewRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventWinnerRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventOverviewService {

    private final EventRepository eventRepository;
    private final EventOverviewPromptBuilder promptBuilder;
    private final AiService aiService;
    private final EventImagesRepository eventImagesRepository;
    private final EventSponsorRepository eventSponsorRepository;
    private final EventSpeakerRepository eventSpeakerRepository;
    private final EventWinnerRepository eventWinnerRepository;
    private final CloudinaryService cloudinaryService;

    // get event sponsors-name list
    private List<String> getSponsors(Long eventId) {
        // find sponsors
        List<EventSponsor> sponsors = eventSponsorRepository.findAllByEvent_Id(eventId);
        List<String> sponsorNames = new ArrayList<>();

        for (EventSponsor sponsor : sponsors) {
            sponsorNames.add(sponsor.getName());
        }
        return sponsorNames;
    }

    // get event speakers-name list
    private List<String> getSpeakers(Long eventId) {
        // find speakers
        List<EventSpeaker> speakers = eventSpeakerRepository.findAllByEvent_Id(eventId);
        List<String> speakersNames = new ArrayList<>();

        for (EventSpeaker speaker : speakers) {
            speakersNames.add(speaker.getName());
        }
        return speakersNames;
    }

    // get event winners list
    private List<String> getWinners(Long eventId) {
        // find winners
        List<EventWinner> winners = eventWinnerRepository.findAllByEvent_Id(eventId);
        List<String> winnerNames = new ArrayList<>();

        for (EventWinner winner : winners) {
            winnerNames.add(winner.getName());
        }
        return winnerNames;
    }

    // generate markdown overview for an event
    @Transactional
    public String generateOverview(Long eventId) {

        // find event
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Event not found with id: " + eventId)
                );

        // find sponsors
        List<String> sponsors = getSponsors(eventId);
        // find speakers
        List<String> speakers = getSpeakers(eventId);
        // find winners
        List<String> winners = getWinners(eventId);

        // build prompt by event-data
        String prompt = promptBuilder.buildPrompt(event, sponsors, speakers, winners);

        // generate markdown overview by open-ai
        String markdownOverview = aiService.generateText(prompt);

        // save in db
        event.setOverview(markdownOverview);
        eventRepository.save(event);

        return markdownOverview;
    }

    // save overview
    @Transactional
    public MessageResponseDto saveOverview(Long clubId, Long eventId, SaveOverviewRequestDto request, List<MultipartFile> images) {

        // find event
        Event event = eventRepository.findEventById(eventId).orElseThrow(
                () -> new IllegalArgumentException("Event not found with id: " + eventId)
        );

        // save overview in db
        event.setOverview(request.getOverview());
        eventRepository.save(event);

        // delete old data
        eventImagesRepository.deleteAllByEvent_Id(eventId);
        eventSpeakerRepository.deleteAllByEvent_Id(eventId);
        eventSponsorRepository.deleteAllByEvent_Id(eventId);
        eventWinnerRepository.deleteAllByEvent_Id(eventId);

        // store images on cloudinary
        List<String> imageUrls = new ArrayList<>(request.getOldImages());
        if (images != null && !images.isEmpty()) {
            for (MultipartFile file : images) {
                String path = "clubs/" + clubId + "/events/" + eventId;
                String url = cloudinaryService.uploadImage(file, path);

                imageUrls.add(url);
            }
        }
        // save images in db
        for(String imageUrl : imageUrls) {
            EventImages image = new EventImages();
            image.setImageUrl(imageUrl);
            image.setEvent(event);
            eventImagesRepository.save(image);
        }

        // save winners in db
        List<EventWinnerRequestDto> winners = request.getWinners();
        for (EventWinnerRequestDto winner : winners) {
            EventWinner eventWinner = new EventWinner();
            eventWinner.setName(winner.getName());
            eventWinner.setEmail(winner.getEmail());
            eventWinner.setEvent(event);
            eventWinnerRepository.save(eventWinner);
        }

        return new MessageResponseDto("Event Overview saved successfully");
    }
}
