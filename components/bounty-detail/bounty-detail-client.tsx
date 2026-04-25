"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileCTA, SidebarCTA } from "./bounty-detail-sidebar-cta";
import { HeaderCard } from "./bounty-detail-header-card";
import { DescriptionCard } from "./bounty-detail-description-card";
import { BountyDetailSubmissionsCard } from "./bounty-detail-submissions-card";
import { BountyDetailSkeleton } from "./bounty-detail-bounty-detail-skeleton";
import { useBountyDetail } from "@/hooks/use-bounty-detail";
import { FcfsApprovalPanel } from "@/components/bounty/fcfs-approval-panel";
import { CompetitionJudging } from "@/components/bounty/competition-judging";
import { EscrowDetailPanel } from "../bounty/escrow-detail-panel";
import { RefundStatusTracker } from "../bounty/refund-status";
import { FeeCalculator } from "../bounty/fee-calculator";
import { useEscrowPool } from "@/hooks/use-escrow";
import { authClient } from "@/lib/auth-client";
import type { CancellationRecord } from "@/types/escrow";

export function BountyDetailClient({ bountyId }: { bountyId: string }) {
  const router = useRouter();
  const { data: bounty, isPending, isError, error } = useBountyDetail(bountyId);
  const { data: pool } = useEscrowPool(bountyId);
  const { data: session } = authClient.useSession();
  const [cancellationRecord, setCancellationRecord] =
    useState<CancellationRecord | null>(null);
  const [pastDeadline, setPastDeadline] = useState(false);

  const handleCancelled = useCallback((record: CancellationRecord) => {
    setCancellationRecord(record);
  }, []);

  const endDate = bounty?.bountyWindow?.endDate ?? null;
  useEffect(() => {
    if (!endDate) return;
    const check = () =>
      setPastDeadline(Date.now() > new Date(endDate).getTime());
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, [endDate]);

  if (isPending) return <BountyDetailSkeleton />;

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="size-16 rounded-full bg-gray-800/50 flex items-center justify-center">
          <AlertCircle className="size-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-200">
          Failed to load bounty
        </h2>
        <p className="text-gray-400 max-w-sm text-sm">
          {error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."}
        </p>
        <Button
          variant="outline"
          className="border-gray-700 hover:bg-gray-800 mt-2"
          onClick={() => router.push("/bounty")}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to bounties
        </Button>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="size-16 rounded-full bg-gray-800/50 flex items-center justify-center">
          <AlertCircle className="size-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-200">Bounty not found</h2>
        <p className="text-gray-400 max-w-sm text-sm">
          This bounty may have been removed or doesn&apos;t exist.
        </p>
        <Button
          variant="outline"
          className="border-gray-700 hover:bg-gray-800 mt-2"
          onClick={() => router.push("/bounty")}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to bounties
        </Button>
      </div>
    );
  }

  const isCancelled =
    bounty.status === "CANCELLED" || cancellationRecord !== null;

  const isCompetition = bounty.type === "COMPETITION";
  const isCreator =
    (session?.user as { id?: string } | undefined)?.id === bounty.createdBy;
  const isFinalized = bounty.status === "COMPLETED";
  // submissions is present on BountyQuery (single-bounty query) but not on
  // BountyFieldsFragment (list query). The cast is safe here because
  // useBountyDetail returns BountyFieldsFragment & Partial<BountyQuery["bounty"]>.
  const competitionSubmissions =
    (
      bounty as {
        submissions?: Array<{
          id: string;
          submittedBy: string;
          submittedByUser?: {
            name?: string | null;
            image?: string | null;
          } | null;
          githubPullRequestUrl?: string | null;
          status: string;
        }> | null;
      }
    ).submissions ?? [];

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        <HeaderCard bounty={bounty} />
        <DescriptionCard description={bounty.description} />
        {!isCancelled && pool && <EscrowDetailPanel poolId={bountyId} />}
        <RefundStatusTracker bountyId={bountyId} isCancelled={isCancelled} />
        {bounty.type !== "FIXED_PRICE" && !isCompetition && (
          <BountyDetailSubmissionsCard bounty={bounty} />
        )}
        {bounty.type === "FIXED_PRICE" && <FcfsApprovalPanel bounty={bounty} />}
        {isCompetition && isCreator && (pastDeadline || isFinalized) && (
          <CompetitionJudging
            bountyId={bountyId}
            submissions={competitionSubmissions}
            isFinalized={isFinalized}
            totalReward={bounty.rewardAmount}
            currency={bounty.rewardCurrency}
          />
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="lg:sticky lg:top-24 space-y-4">
          <SidebarCTA bounty={bounty} onCancelled={handleCancelled} />
          <FeeCalculator />
        </div>
      </aside>

      {/* Mobile sticky CTA */}
      <MobileCTA bounty={bounty} onCancelled={handleCancelled} />
    </div>
  );
}
