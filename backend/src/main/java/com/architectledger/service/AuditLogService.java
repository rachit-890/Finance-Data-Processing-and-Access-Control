package com.architectledger.service;

import com.architectledger.dto.response.AuditLogResponse;
import com.architectledger.dto.response.PagedResponse;
import com.architectledger.entity.AuditLog;
import com.architectledger.entity.User;
import com.architectledger.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String entityType, Long entityId, String details, String ipAddress, User user) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .user(user)
                .build();
        auditLogRepository.save(log);
    }

    public PagedResponse<AuditLogResponse> getAllLogs(Pageable pageable) {
        return toPagedResponse(auditLogRepository.findAll(pageable));
    }

    public PagedResponse<AuditLogResponse> getLogsByUser(Long userId, Pageable pageable) {
        return toPagedResponse(auditLogRepository.findByUserId(userId, pageable));
    }

    public PagedResponse<AuditLogResponse> getLogsByEntityType(String entityType, Pageable pageable) {
        return toPagedResponse(auditLogRepository.findByEntityType(entityType, pageable));
    }

    private PagedResponse<AuditLogResponse> toPagedResponse(Page<AuditLog> page) {
        return PagedResponse.<AuditLogResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userName(log.getUser() != null ? log.getUser().getName() : null)
                .build();
    }
}
