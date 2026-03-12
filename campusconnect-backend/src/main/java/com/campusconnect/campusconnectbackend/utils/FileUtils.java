package com.campusconnect.campusconnectbackend.utils;

import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Component
public class FileUtils {

    public MultipartFile convertUrlToMultipartFile(String imageUrl) {

        HttpURLConnection connection = null;

        try {

            URL url = new URL(imageUrl);
            connection = (HttpURLConnection) url.openConnection();

            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            connection.setRequestMethod("GET");

            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                throw new RuntimeException("Failed to download file");
            }

            String contentType = connection.getContentType();
            String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1).split("\\?")[0];

            try (InputStream inputStream = connection.getInputStream()) {

                return new MockMultipartFile(
                        "file",
                        fileName,
                        contentType,
                        inputStream
                );
            }

        } catch (Exception e) {
            throw new RuntimeException("Error converting URL to MultipartFile", e);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}