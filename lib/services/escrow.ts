import { EscrowPool, EscrowSlot, FeeBreakdown } from "@/types/escrow";

export class EscrowService {
  // Mock data mapping bountyId/poolId to EscrowPool and Slots
  private static pools: Record<string, EscrowPool> = {
    // Escrowed pool
    "1": {
      poolId: "1",
      totalAmount: 500,
      asset: "USDC",
      isLocked: true,
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      releasedAmount: 0,
      status: "Escrowed",
    },
    // Partially Released pool
    "2": {
      poolId: "2",
      totalAmount: 300,
      asset: "USDC",
      isLocked: true,
      expiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      releasedAmount: 150,
      status: "Partially Released",
    },
    // Fully Released pool
    "3": {
      poolId: "3",
      totalAmount: 200,
      asset: "USDC",
      isLocked: false,
      expiry: null,
      releasedAmount: 200,
      status: "Fully Released",
    },
  };

  private static slots: Record<string, EscrowSlot[]> = {
    "1": [
      {
        index: 0,
        recipientAddress: "GBSX...A2M4",
        amount: 500,
        status: "Pending",
      },
    ],
    "2": [
      {
        index: 0,
        recipientAddress: "GC2F...9KPL",
        amount: 150,
        status: "Released",
      },
      {
        index: 1,
        recipientAddress: "GD8A...5RTY",
        amount: 150,
        status: "Pending",
      },
    ],
    "3": [
      {
        index: 0,
        recipientAddress: "GBX3...B4C9",
        amount: 200,
        status: "Released",
      },
    ],
  };

  /**
   * Get the escrow pool details for a given pool ID (usually bounty ID in our mock).
   */
  static async getPool(poolId: string): Promise<EscrowPool | null> {
    await this.simulateDelay();
    return this.pools[poolId] || null;
  }

  /**
   * Get the release slots for a given pool ID.
   */
  static async getSlots(poolId: string): Promise<EscrowSlot[]> {
    await this.simulateDelay();
    return this.slots[poolId] || [];
  }

  /**
   * Calculate the fee breakdown for a given amount.
   * Based on subType, fees can vary (mocking a 5% platform fee and 1% insurance fee).
   */
  static async calculateFee(
    amount: number,
    subType: string,
  ): Promise<FeeBreakdown> {
    await this.simulateDelay();

    // Default mock rates
    let platformRate = 0.05;
    let insuranceRate = 0.01;

    // Adjust rates based on some mock logic for different types
    if (subType === "COMPETITION") {
      platformRate = 0.08;
      insuranceRate = 0.02;
    } else if (subType === "MILESTONE_BASED") {
      platformRate = 0.06;
      insuranceRate = 0.01;
    }

    const platformFee = Number((amount * platformRate).toFixed(2));
    const insuranceFee = Number((amount * insuranceRate).toFixed(2));
    const netPayout = Number((amount - platformFee - insuranceFee).toFixed(2));

    return {
      grossAmount: amount,
      platformFee,
      insuranceFee,
      netPayout,
    };
  }

  private static async simulateDelay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}
