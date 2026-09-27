package com.campusconnect.campusconnectbackend.integrations.cloudinary.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    // upload image
    public String uploadImage(MultipartFile file, String path) {

        try {

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "folder", path
                    )
            );

            return uploadResult.get("secure_url").toString();

        } catch (Exception e) {
            throw new RuntimeException("Image upload failed");
        }
    }


    // upload pdf
    public String uploadPdf(MultipartFile file, String path) {

        try {

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "folder", path
                    )
            );

            return uploadResult.get("secure_url").toString();

        } catch (Exception e) {
            log.error("Cloudinary PDF upload failed for path {}: {}", path, e.getMessage(), e);
            throw new RuntimeException("PDF upload failed: " + e.getMessage(), e);
        }
    }
}
