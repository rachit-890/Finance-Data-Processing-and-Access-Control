package com.architectledger.service;

import com.architectledger.dto.request.TransactionRequest;
import com.architectledger.dto.response.DashboardSummaryResponse;
import com.architectledger.dto.response.PagedResponse;
import com.architectledger.dto.response.TransactionResponse;
import com.architectledger.entity.Transaction;
import com.architectledger.entity.User;
import com.architectledger.exception.BadRequestException;
import com.architectledger.exception.ResourceNotFoundException;
import com.architectledger.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;

    @Transactional
    public TransactionResponse create(TransactionRequest request, String email) {
        User user = userService.findByEmail(email);

        String refNum = request.getReferenceNumber() != null
                ? request.getReferenceNumber()
                : "REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        if (transactionRepository.existsByReferenceNumber(refNum)) {
            throw new BadRequestException("Reference number already exists: " + refNum);
        }

        Transaction tx = Transaction.builder()
                .amount(request.getAmount())
                .type(request.getType())
                .category(request.getCategory())
                .description(request.getDescription())
                .date(request.getDate())
                .status(request.getStatus() != null ? request.getStatus() : Transaction.TransactionStatus.COMPLETED)
                .referenceNumber(refNum)
                .user(user)
                .build();

        Transaction saved = transactionRepository.save(tx);
        auditLogService.log("TRANSACTION_CREATED", "Transaction", saved.getId(),
                "Created " + saved.getType() + " transaction of " + saved.getAmount(), null, user);

        return toResponse(saved);
    }

    public PagedResponse<TransactionResponse> getAll(Pageable pageable, String email, User.Role role) {
        Page<Transaction> page;
        if (role == User.Role.ADMIN || role == User.Role.ANALYST) {
            page = transactionRepository.findAll(pageable);
        } else {
            User user = userService.findByEmail(email);
            page = transactionRepository.findByUserId(user.getId(), pageable);
        }
        return toPagedResponse(page);
    }

    public PagedResponse<TransactionResponse> getMyTransactions(String email, Pageable pageable) {
        User user = userService.findByEmail(email);
        return toPagedResponse(transactionRepository.findByUserId(user.getId(), pageable));
    }

    public TransactionResponse getById(Long id, String email, User.Role role) {
        Transaction tx = findTransaction(id, email, role);
        return toResponse(tx);
    }

    @Transactional
    public TransactionResponse update(Long id, TransactionRequest request, String email, User.Role role) {
        Transaction tx = findTransaction(id, email, role);

        tx.setAmount(request.getAmount());
        tx.setType(request.getType());
        tx.setCategory(request.getCategory());
        tx.setDescription(request.getDescription());
        tx.setDate(request.getDate());
        if (request.getStatus() != null) tx.setStatus(request.getStatus());

        Transaction saved = transactionRepository.save(tx);
        User user = userService.findByEmail(email);
        auditLogService.log("TRANSACTION_UPDATED", "Transaction", id, "Updated transaction " + id, null, user);

        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id, String email, User.Role role) {
        Transaction tx = findTransaction(id, email, role);
        transactionRepository.delete(tx);

        User user = userService.findByEmail(email);
        auditLogService.log("TRANSACTION_DELETED", "Transaction", id, "Deleted transaction " + id, null, user);
    }

    public DashboardSummaryResponse getDashboardSummary(String email, User.Role role, int year) {
        boolean isGlobal = (role == User.Role.ADMIN || role == User.Role.ANALYST);
        Long userId = isGlobal ? null : userService.findByEmail(email).getId();

        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear   = LocalDate.of(year, 12, 31);

        BigDecimal totalIncome;
        BigDecimal totalExpense;
        List<DashboardSummaryResponse.CategoryBreakdown> topCategories;
        List<DashboardSummaryResponse.MonthlyData> monthlyInc;
        List<DashboardSummaryResponse.MonthlyData> monthlyExp;
        List<TransactionResponse> recent;

        if (isGlobal) {
            totalIncome  = transactionRepository.sumAllByType(Transaction.TransactionType.INCOME);
            totalExpense = transactionRepository.sumAllByType(Transaction.TransactionType.EXPENSE);

            topCategories = transactionRepository
                    .sumByCategoryGlobal(Transaction.TransactionType.EXPENSE, startOfYear, endOfYear)
                    .stream().limit(5)
                    .map(r -> DashboardSummaryResponse.CategoryBreakdown.builder()
                            .category((String) r[0]).amount((BigDecimal) r[1]).build())
                    .toList();

            monthlyInc = transactionRepository
                    .monthlyTotalsGlobal(Transaction.TransactionType.INCOME, year)
                    .stream()
                    .map(r -> DashboardSummaryResponse.MonthlyData.builder()
                            .month(((Number) r[0]).intValue()).amount((BigDecimal) r[1]).build())
                    .toList();

            monthlyExp = transactionRepository
                    .monthlyTotalsGlobal(Transaction.TransactionType.EXPENSE, year)
                    .stream()
                    .map(r -> DashboardSummaryResponse.MonthlyData.builder()
                            .month(((Number) r[0]).intValue()).amount((BigDecimal) r[1]).build())
                    .toList();

            recent = transactionRepository.findTop5ByOrderByDateDescIdDesc()
                    .stream().map(this::toResponse).toList();
        } else {
            totalIncome  = transactionRepository.sumByUserIdAndType(userId, Transaction.TransactionType.INCOME);
            totalExpense = transactionRepository.sumByUserIdAndType(userId, Transaction.TransactionType.EXPENSE);

            topCategories = transactionRepository
                    .sumByCategory(userId, Transaction.TransactionType.EXPENSE, startOfYear, endOfYear)
                    .stream().limit(5)
                    .map(r -> DashboardSummaryResponse.CategoryBreakdown.builder()
                            .category((String) r[0]).amount((BigDecimal) r[1]).build())
                    .toList();

            monthlyInc = transactionRepository
                    .monthlyTotals(userId, Transaction.TransactionType.INCOME, year)
                    .stream()
                    .map(r -> DashboardSummaryResponse.MonthlyData.builder()
                            .month(((Number) r[0]).intValue()).amount((BigDecimal) r[1]).build())
                    .toList();

            monthlyExp = transactionRepository
                    .monthlyTotals(userId, Transaction.TransactionType.EXPENSE, year)
                    .stream()
                    .map(r -> DashboardSummaryResponse.MonthlyData.builder()
                            .month(((Number) r[0]).intValue()).amount((BigDecimal) r[1]).build())
                    .toList();

            recent = transactionRepository.findTop5ByUserIdOrderByDateDescIdDesc(userId)
                    .stream().map(this::toResponse).toList();
        }

        long totalTx = isGlobal
                ? transactionRepository.count()
                : transactionRepository.findByUserId(userId, Pageable.unpaged()).getTotalElements();

        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(totalIncome.subtract(totalExpense))
                .totalTransactions(totalTx)
                .topExpenseCategories(topCategories)
                .monthlyIncome(monthlyInc)
                .monthlyExpense(monthlyExp)
                .recentTransactions(recent)
                .build();
    }

    private Transaction findTransaction(Long id, String email, User.Role role) {
        if (role == User.Role.ADMIN || role == User.Role.ANALYST) {
            return transactionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        }
        User user = userService.findByEmail(email);
        return transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
    }

    private PagedResponse<TransactionResponse> toPagedResponse(Page<Transaction> page) {
        return PagedResponse.<TransactionResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private TransactionResponse toResponse(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .amount(tx.getAmount())
                .type(tx.getType().name())
                .category(tx.getCategory())
                .description(tx.getDescription())
                .date(tx.getDate())
                .status(tx.getStatus().name())
                .referenceNumber(tx.getReferenceNumber())
                .createdAt(tx.getCreatedAt())
                .userId(tx.getUser().getId())
                .userName(tx.getUser().getName())
                .build();
    }
}
