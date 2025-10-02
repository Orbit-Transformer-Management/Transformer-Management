package com.orbit.Orbit.service;
import com.orbit.Orbit.dto.RoboflowResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;


import java.util.HashMap;
import java.util.Map;

@Service
public class RoboflowService {
    @Value("${roboflow.api.url}")
    private String apiUrl;

    @Value("${roboflow.api.key}")
    private String apiKey;

    public RoboflowResponse analyzeInspectionImage(String in){
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();
        body.put("api_key", apiKey);
        body.put("inputs", new HashMap<String, Object>() {{
            put("image", new HashMap<String, Object>() {{
                put("type", "url");
                put("value", "https://pbs.twimg.com/profile_images/541867053351583744/rcxem8NU_400x400.jpeg"); // replace with your image
            }});
        }});

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        //ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);
        ResponseEntity<RoboflowResponse> response = restTemplate.postForEntity(apiUrl, request, RoboflowResponse.class);
        System.out.println(response);
        return response.getBody();
    }
}
