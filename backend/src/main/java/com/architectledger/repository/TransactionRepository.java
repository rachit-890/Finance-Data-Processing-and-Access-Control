package com.architectledger.repository;

import com.architectledger.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByUserId(Long userId, Pageable pageable);

    Page<Transaction> findByUserIdAndType(Long userId, Transaction.TransactionType type, Pageable pageable);

    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.status = 'COMPLETED'")
    BigDecimal sumByUserIdAndType(@Param("userId") Long userId, @Param("type") Transaction.TransactionType type);

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.date BETWEEN :start AND :end GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumByCategory(@Param("userId") Long userId, @Param("type") Transaction.TransactionType type, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT EXTRACT(MONTH FROM t.date) as month, SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND EXTRACT(YEAR FROM t.date) = :year GROUP BY EXTRACT(MONTH FROM t.date) ORDER BY EXTRACT(MONTH FROM t.date)")
    List<Object[]> monthlyTotals(@Param("userId") Long userId, @Param("type") Transaction.TransactionType type, @Param("year") int year);

    boolean existsByReferenceNumber(String referenceNumber);

    // ── Admin-global queries (no userId filter) ───────────────────────────
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type AND t.status = 'COMPLETED'")
    BigDecimal sumAllByType(@Param("type") Transaction.TransactionType type);

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.type = :type AND t.date BETWEEN :start AND :end GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumByCategoryGlobal(@Param("type") Transaction.TransactionType type, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT EXTRACT(MONTH FROM t.date) as month, SUM(t.amount) FROM Transaction t WHERE t.type = :type AND EXTRACT(YEAR FROM t.date) = :year GROUP BY EXTRACT(MONTH FROM t.date) ORDER BY EXTRACT(MONTH FROM t.date)")
    List<Object[]> monthlyTotalsGlobal(@Param("type") Transaction.TransactionType type, @Param("year") int year);

    List<Transaction> findTop5ByOrderByDateDescIdDesc();

    List<Transaction> findTop5ByUserIdOrderByDateDescIdDesc(Long userId);
}
