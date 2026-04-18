package com.bezkoder.spring.login.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MlService {

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public String detect(String input){

        String url = "http://localhost:5000/detect";

        Map<String,String> request = Map.of("input", input);

        Map<String,Object> response =
                (Map<String,Object>) restTemplate.postForObject(url, request, Map.class);

        if(response != null && response.get("result") != null){
            return response.get("result").toString();
        }

        return "No response from AI server";
    }
}