package com.architectledger.controller;

import com.architectledger.dto.request.TransactionRequest;
import com.architectledger.dto.response.DashboardSummaryResponse;
import com.architectledger.dto.response.PagedResponse;
import com.architectledger.dto.response.TransactionResponse;
import com.architectledger.entity.User;
import com.architectledger.service.TransactionService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;


@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.create(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<TransactionResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserDetails userDetails) {

        PageRequest pageable = PageRequest.of(page, size,
                direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending());
        User.Role role = getRole(userDetails);
        return ResponseEntity.ok(transactionService.getAll(pageable, userDetails.getUsername(), role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transactionService.getById(id, userDetails.getUsername(), getRole(userDetails)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transactionService.update(id, request, userDetails.getUsername(), getRole(userDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        transactionService.delete(id, userDetails.getUsername(), getRole(userDetails));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryResponse> getDashboard(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") int year,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transactionService.getDashboardSummary(userDetails.getUsername(), getRole(userDetails), year));
    }

    @GetMapping("/export")
    public void exportCsv(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"transactions.csv\"");

        User.Role role = getRole(userDetails);
        PageRequest all = PageRequest.of(0, Integer.MAX_VALUE, Sort.by("date").descending());
        PagedResponse<TransactionResponse> paged =
                transactionService.getAll(all, userDetails.getUsername(), role);

        PrintWriter writer = response.getWriter();
        writer.println("ID,Reference,Type,Category,Description,Amount,Status,Date,User");
        for (TransactionResponse tx : paged.getContent()) {
            writer.printf("%d,\"%s\",%s,\"%s\",\"%s\",%.2f,%s,%s,\"%s\"%n",
                    tx.getId(),
                    tx.getReferenceNumber() != null ? tx.getReferenceNumber() : "",
                    tx.getType(),
                    tx.getCategory() != null ? tx.getCategory() : "",
                    tx.getDescription() != null ? tx.getDescription() : "",
                    tx.getAmount(),
                    tx.getStatus(),
                    tx.getDate(),
                    tx.getUserName() != null ? tx.getUserName() : ""
            );
        }
        writer.flush();
    }

    private User.Role getRole(UserDetails userDetails) {
        String authority = userDetails.getAuthorities().iterator().next().getAuthority();
        return User.Role.valueOf(authority.replace("ROLE_", ""));
    }
}
