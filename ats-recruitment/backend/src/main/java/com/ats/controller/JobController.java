package com.ats.controller;

import com.ats.model.Job;
import com.ats.repository.JobRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins="*")
public class JobController {
    private final JobRepository repo;
    public JobController(JobRepository repo){this.repo=repo;}

    @GetMapping public List<Job> all(){return repo.findAll();}
    @GetMapping("/{id}") public ResponseEntity<Job> one(@PathVariable Long id){
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @PostMapping public Job create(@RequestBody Job job){return repo.save(job);}
    @PutMapping("/{id}") public ResponseEntity<Job> update(@PathVariable Long id,@RequestBody Job input){
        return repo.findById(id).map(j->{j.setTitle(input.getTitle());j.setDepartment(input.getDepartment());
            j.setLocation(input.getLocation());j.setSalaryRange(input.getSalaryRange());j.setStatus(input.getStatus());
            return ResponseEntity.ok(repo.save(j));}).orElse(ResponseEntity.notFound().build());
    }
}
