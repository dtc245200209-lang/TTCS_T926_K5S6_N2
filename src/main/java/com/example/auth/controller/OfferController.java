package com.example.auth.controller;

import com.example.auth.dto.ApiResponse;
import com.example.auth.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {
    private final OfferService offerService;

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('APPROVER', 'ADMIN')")
    public ResponseEntity<?> getPendingOffers() {
        return ResponseEntity.ok(ApiResponse.success("Thành công", offerService.getPendingApprovalOffers()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('APPROVER', 'ADMIN')")
    public ResponseEntity<?> approveOffer(@PathVariable Long id, @RequestParam boolean isApproved) {
        if (isApproved) {
            offerService.approveOffer(id);
            return ResponseEntity.ok(ApiResponse.success("Đã phê duyệt Offer thành công."));
        } else {
            offerService.rejectOffer(id);
            return ResponseEntity.ok(ApiResponse.success("Đã từ chối Offer."));
        }
    }
}
