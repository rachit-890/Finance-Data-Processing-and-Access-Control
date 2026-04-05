package com.architectledger.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder
public class DashboardSummaryResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netBalance;
    private long totalTransactions;
    private List<CategoryBreakdown> topExpenseCategories;
    private List<MonthlyData> monthlyIncome;
    private List<MonthlyData> monthlyExpense;
    private List<TransactionResponse> recentTransactions;

    @Data @Builder
    public static class CategoryBreakdown {
        private String category;
        private BigDecimal amount;
    }

    @Data @Builder
    public static class MonthlyData {
        private int month;
        private BigDecimal amount;
    }
}
