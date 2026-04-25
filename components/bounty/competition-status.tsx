"use client";

import { useState, useEffect } from "react";
import { Users, Clock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface CompetitionStatusProps {
  // NOTE: The backend schema exposes _count.submissions (not a separate
  // participant/claim count). This reflects submitted entries; contributors
  // who joined but haven't submitted yet are not counted here. A dedicated
  // claimCount field on the Bounty type would be needed for an accurate
  // "joined" figure — tracked in the backend schema backlog.
  participantCount: number;
  maxParticipants?: number | null;
  submissionCount: number;
  deadline: string | null | undefined;
  isFinalized: boolean;
}

export function CompetitionStatus({
  participantCount,
  maxParticipants,
  submissionCount,
  deadline,
  isFinalized,
}: CompetitionStatusProps) {
  // Initialize as null to avoid SSR/client hydration mismatch from Date.now().
  const [pastDeadline, setPastDeadline] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () =>
      setPastDeadline(
        deadline ? Date.now() > new Date(deadline).getTime() : false,
      );
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <div className="rounded-xl border border-gray-800 bg-background-card p-4 space-y-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Competition Status
      </h4>

      <div className="grid grid-cols-2 gap-3">
        {/* Participants */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="size-4 text-gray-500 shrink-0" />
          <span className="text-gray-300">
            {participantCount}
            {maxParticipants != null ? `/${maxParticipants}` : ""}{" "}
            <span className="text-gray-500 text-xs">joined</span>
          </span>
        </div>

        {/* Submissions */}
        <div className="flex items-center gap-2 text-sm">
          {pastDeadline ? (
            <Eye className="size-4 text-emerald-400 shrink-0" />
          ) : (
            <EyeOff className="size-4 text-gray-500 shrink-0" />
          )}
          <span className="text-gray-300">
            {pastDeadline ? submissionCount : "?"}{" "}
            <span className="text-gray-500 text-xs">
              {pastDeadline ? "revealed" : "hidden"}
            </span>
          </span>
        </div>
      </div>

      {/* Phase indicator — only render once client-side value is known */}
      {pastDeadline !== null && (
        <div className="flex items-center gap-2 text-xs">
          {isFinalized ? (
            <>
              <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-medium">
                Results published
              </span>
            </>
          ) : pastDeadline ? (
            <>
              <Clock className="size-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-400 font-medium">
                Judging in progress
              </span>
            </>
          ) : (
            <>
              <Clock className="size-3.5 text-blue-400 shrink-0" />
              <span className="text-blue-400 font-medium">
                Accepting submissions
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
