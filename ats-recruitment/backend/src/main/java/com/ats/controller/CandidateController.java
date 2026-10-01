package com.ats.controller;

import com.ats.model.Candidate;
import com.ats.repository.CandidateRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins="*")
public class CandidateController {
    private final CandidateRepository repo;
    public CandidateController(CandidateRepository repo){this.repo=repo;}
    @GetMapping public List<Candidate> all(){return repo.findAll();}
    @PostMapping public Candidate create(@RequestBody Candidate c){return repo.save(c);}
    @GetMapping("/{id}") public ResponseEntity<Candidate> one(@PathVariable Long id){
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
