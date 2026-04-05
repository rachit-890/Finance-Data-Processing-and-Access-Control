package com.architectledger.dto.request;

import com.architectledger.entity.Transaction;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {
    @NotNull @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    private Transaction.TransactionType type;

    @NotBlank @Size(max = 100)
    private String category;

    @Size(max = 255)
    private String description;

    @NotNull
    private LocalDate date;

    private Transaction.TransactionStatus status;

    @Size(max = 50)
    private String referenceNumber;
}
