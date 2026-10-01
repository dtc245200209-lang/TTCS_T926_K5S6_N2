package com.ats.controller;

import com.ats.model.*;
import com.ats.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins="*")
public class ApplicationController {
    private final ApplicationRepository appRepo;
    private final JobRepository jobRepo;
    private final CandidateRepository candidateRepo;

    public ApplicationController(ApplicationRepository a,JobRepository j,CandidateRepository c){
        appRepo=a;jobRepo=j;candidateRepo=c;
    }

    @GetMapping public List<Application> all(){return appRepo.findAll();}

    @PostMapping
    public ResponseEntity<Application> create(@RequestParam Long jobId,@RequestParam Long candidateId){
        var job=jobRepo.findById(jobId); var candidate=candidateRepo.findById(candidateId);
        if(job.isEmpty()||candidate.isEmpty()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(appRepo.save(new Application(job.get(),candidate.get())));
    }

    @PatchMapping("/{id}/stage")
    public ResponseEntity<Application> stage(@PathVariable Long id,@RequestParam ApplicationStage value){
        return appRepo.findById(id).map(a->{a.setStage(value);return ResponseEntity.ok(appRepo.save(a));})
            .orElse(ResponseEntity.notFound().build());
    }
}
