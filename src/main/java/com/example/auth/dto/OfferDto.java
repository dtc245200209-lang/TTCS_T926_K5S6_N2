package com.example.auth.dto;

import lombok.Data;

@Data
public class OfferDto {
    private Long id;
    private String candidateName;
    private String jobTitle;
    private Double offeredSalary;
    private Double maxSalary;
    private String status;
}
