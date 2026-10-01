package com.ats.controller;

import com.ats.model.*;
import com.ats.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins="*")
public class InterviewController {
    private final InterviewRepository repo; private final ApplicationRepository apps;
    public InterviewController(InterviewRepository repo,ApplicationRepository apps){this.repo=repo;this.apps=apps;}
    @GetMapping public List<Interview> all(){return repo.findAll();}
    @PostMapping
    public ResponseEntity<Interview> create(@RequestParam Long applicationId,@RequestParam String interviewer,
        @RequestParam String startAt,@RequestParam String endAt,@RequestParam(required=false) String meetingUrl){
        var app=apps.findById(applicationId); if(app.isEmpty()) return ResponseEntity.badRequest().build();
        Interview i=new Interview(); i.setApplication(app.get()); i.setInterviewer(interviewer);
        i.setStartAt(LocalDateTime.parse(startAt)); i.setEndAt(LocalDateTime.parse(endAt)); i.setMeetingUrl(meetingUrl);
        return ResponseEntity.ok(repo.save(i));
    }
}
