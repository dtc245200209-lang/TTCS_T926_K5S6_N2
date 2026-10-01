package com.ats.config;

import com.ats.model.*;
import com.ats.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seed(JobRepository jobs, CandidateRepository candidates, ApplicationRepository apps) {
        return args -> {
            if (jobs.count() == 0) {
                Job j = jobs.save(new Job("Lập trình viên Java", "Công nghệ", "Hà Nội", "20.000.000 - 30.000.000 VND"));
                Candidate c = candidates.save(new Candidate("Nguyễn Văn A","a@example.com","0900000000","/cv/demo.pdf"));
                apps.save(new Application(j,c));
            }
        };
    }
}
