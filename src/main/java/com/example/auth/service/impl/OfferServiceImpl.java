package com.example.auth.service.impl;

import com.example.auth.dto.OfferDto;
import com.example.auth.entity.Offer;
import com.example.auth.repository.OfferRepository;
import com.example.auth.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfferServiceImpl implements OfferService {
    private final OfferRepository offerRepository;

    @Override
    public List<OfferDto> getPendingApprovalOffers() {
        return offerRepository.findByStatus("PENDING_APPROVAL").stream().map(offer -> {
            OfferDto dto = new OfferDto();
            dto.setId(offer.getId());
            if (offer.getApplication() != null) {
                if (offer.getApplication().getCandidateProfile() != null) {
                    dto.setCandidateName(offer.getApplication().getCandidateProfile().getFullName());
                }
                if (offer.getApplication().getJobRequest() != null) {
                    dto.setJobTitle(offer.getApplication().getJobRequest().getTitle());
                    dto.setMaxSalary(offer.getApplication().getJobRequest().getMaxSalary());
                }
            }
            dto.setOfferedSalary(offer.getOfferedSalary());
            dto.setStatus(offer.getStatus());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public void approveOffer(Long id) {
        Offer offer = offerRepository.findById(id).orElseThrow(() -> new RuntimeException("Offer not found"));
        offer.setStatus("APPROVED");
        offerRepository.save(offer);
    }

    @Override
    public void rejectOffer(Long id) {
        Offer offer = offerRepository.findById(id).orElseThrow(() -> new RuntimeException("Offer not found"));
        offer.setStatus("DECLINED");
        offerRepository.save(offer);
    }
}
