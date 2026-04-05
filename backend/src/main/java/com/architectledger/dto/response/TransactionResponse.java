package com.architectledger.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private String type;
    private String category;
    private String description;
    private LocalDate date;
    private String status;
    private String referenceNumber;
    private LocalDateTime createdAt;
    private Long userId;
    private String userName;
}
