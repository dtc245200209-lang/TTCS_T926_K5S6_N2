package com.ats.controller;

import com.ats.model.*;
import com.ats.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin(origins="*")
public class EvaluationController {
    private final EvaluationRepository repo; private final ApplicationRepository apps;
    public EvaluationController(EvaluationRepository repo,ApplicationRepository apps){this.repo=repo;this.apps=apps;}
    @GetMapping public List<Evaluation> all(){return repo.findAll();}
    @PostMapping
    public ResponseEntity<Evaluation> create(@RequestParam Long applicationId,@RequestBody Evaluation e){
        var app=apps.findById(applicationId); if(app.isEmpty()) return ResponseEntity.badRequest().build();
        e.setApplication(app.get()); return ResponseEntity.ok(repo.save(e));
    }
}
