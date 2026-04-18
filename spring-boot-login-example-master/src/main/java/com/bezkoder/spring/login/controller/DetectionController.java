package com.bezkoder.spring.login.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bezkoder.spring.login.service.MlService;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class DetectionController {

    private final MlService mlService;

    public DetectionController(MlService mlService){
        this.mlService = mlService;
    }

    @PostMapping("/detect")
    public Map<String,String> detect(@RequestBody Map<String,String> body){

        String input = body.get("input");

        String result = mlService.detect(input);

        return Map.of("result", result);
    }
}