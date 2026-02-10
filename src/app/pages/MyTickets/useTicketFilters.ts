import { useState, useMemo, useCallback } from "react";
import type { JiraTicket } from "../../types";

const DEFAULT_EXCLUDED = new Set(["cancelled", "canceled", "done"]);

const TYPE_ORDER: Record<string, number> = {
  bug: 0,
  task: 1,
  story: 2,
  "sub-task": 3,
};

const PRIORITY_ORDER: Record<string, number> = {
  highest: 0,
  high: 1,
  medium: 2,
  low: 3,
  lowest: 4,
};

const STATUS_ORDER: Record<string, number> = {
  "in progress": 0,
  "in review": 1,
  "code review": 2,
  "to do": 3,
  open: 4,
  backlog: 5,
};

export interface TicketGroup {
  type: string;
  tickets: JiraTicket[];
}

interface UseTicketFiltersReturn {
  availableStatuses: string[];
  excludedStatuses: Set<string>;
  toggleStatus: (status: string) => void;
  groups: TicketGroup[];
  filteredCount: number;
  totalCount: number;
}

export const useTicketFilters = (
  tickets: JiraTicket[]
): UseTicketFiltersReturn => {
  const [excludedStatuses, setExcludedStatuses] =
    useState<Set<string>>(DEFAULT_EXCLUDED);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    for (const t of tickets) {
      if (t.status) statuses.add(t.status);
    }
    return Array.from(statuses).sort((a, b) => a.localeCompare(b));
  }, [tickets]);

  const toggleStatus = useCallback((status: string) => {
    setExcludedStatuses((prev) => {
      const next = new Set(prev);
      const key = status.toLowerCase();
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const groups = useMemo(() => {
    const filtered = tickets.filter(
      (t) => !excludedStatuses.has(t.status?.toLowerCase() ?? "")
    );

    const grouped = new Map<string, JiraTicket[]>();
    for (const ticket of filtered) {
      const type = ticket.type || "Other";
      const existing = grouped.get(type);
      if (existing) {
        existing.push(ticket);
      } else {
        grouped.set(type, [ticket]);
      }
    }

    const sortTickets = (a: JiraTicket, b: JiraTicket): number => {
      const pa = PRIORITY_ORDER[a.priority?.toLowerCase() ?? ""] ?? 999;
      const pb = PRIORITY_ORDER[b.priority?.toLowerCase() ?? ""] ?? 999;
      if (pa !== pb) return pa - pb;

      const sa = STATUS_ORDER[a.status?.toLowerCase() ?? ""] ?? 999;
      const sb = STATUS_ORDER[b.status?.toLowerCase() ?? ""] ?? 999;
      return sa - sb;
    };

    const result: TicketGroup[] = Array.from(grouped.entries())
      .sort(([typeA], [typeB]) => {
        const oa = TYPE_ORDER[typeA.toLowerCase()] ?? 999;
        const ob = TYPE_ORDER[typeB.toLowerCase()] ?? 999;
        if (oa !== ob) return oa - ob;
        return typeA.localeCompare(typeB);
      })
      .map(([type, typeTickets]) => ({
        type,
        tickets: typeTickets.sort(sortTickets),
      }));

    return result;
  }, [tickets, excludedStatuses]);

  const filteredCount = groups.reduce((sum, g) => sum + g.tickets.length, 0);

  return {
    availableStatuses,
    excludedStatuses,
    toggleStatus,
    groups,
    filteredCount,
    totalCount: tickets.length,
  };
};
