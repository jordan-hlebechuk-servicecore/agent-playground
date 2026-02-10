import { useState, useEffect, useCallback } from "react";
import type { JiraTicket } from "../../../../types";

interface UseJiraTicketsReturn {
  tickets: JiraTicket[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useJiraTickets = (): UseJiraTicketsReturn => {
  const [tickets, setTickets] = useState<JiraTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/jira/tickets");

      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }

      const data = (await response.json()) as { tickets: JiraTicket[]; total: number };
      setTickets(data.tickets);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, isLoading, error, refetch: fetchTickets };
};
