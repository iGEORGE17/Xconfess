import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tip } from './entities/tip.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { StellarService } from '../stellar/stellar.service';
import { VerifyTipDto } from './dto/verify-tip.dto';

export interface TipStats {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
}

interface SettlementReceiptMetadata {
  settlementId: string | null;
  proofMetadata: string | null;
  anonymousSender: boolean;
}

@Injectable()
export class TippingService {
  private static readonly MAX_RECEIPT_PROOF_METADATA_LEN = 128;

  constructor(
    @InjectRepository(Tip)
    private readonly tipRepository: Repository<Tip>,
    @InjectRepository(AnonymousConfession)
    private readonly confessionRepository: Repository<AnonymousConfession>,
    private readonly stellarService: StellarService,
  ) {}

  private extractSettlementReceiptMetadata(txData: any): SettlementReceiptMetadata {
    const empty: SettlementReceiptMetadata = {
      settlementId: null,
      proofMetadata: null,
      anonymousSender: false,
    };

    const memoType = txData?.memo_type;
    const memoValue = txData?.memo;
    if (memoType !== 'text' || typeof memoValue !== 'string' || memoValue.length === 0) {
      return empty;
    }

    try {
      const payload = JSON.parse(memoValue);
      const settlementId =
        typeof payload?.settlement_id === 'string' && payload.settlement_id.length > 0
          ? payload.settlement_id
          : null;
      const proofMetadata =
        typeof payload?.proof_metadata === 'string' && payload.proof_metadata.length > 0
          ? payload.proof_metadata
          : null;

      if (
        proofMetadata &&
        proofMetadata.length > TippingService.MAX_RECEIPT_PROOF_METADATA_LEN
      ) {
        throw new BadRequestException('Settlement receipt proof metadata exceeds allowed bounds');
      }

      return {
        settlementId,
        proofMetadata,
        anonymousSender: payload?.anonymous_sender === true,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Non-JSON or non-receipt memo should not invalidate otherwise valid payments.
      return empty;
    }
  }

  /**
   * Get all tips for a confession
   */
  async getTipsByConfessionId(confessionId: string): Promise<Tip[]> {
    return this.tipRepository.find({
      where: { confessionId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get tipping statistics for a confession
   */
  async getTipStats(confessionId: string): Promise<TipStats> {
    const tips = await this.tipRepository.find({
      where: { confessionId },
    });

    const totalAmount = tips.reduce((sum, tip) => sum + Number(tip.amount), 0);
    const totalCount = tips.length;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    return {
      totalAmount,
      totalCount,
      averageAmount,
    };
  }

  /**
   * Verify a tip transaction on-chain and record it
   */
  async verifyAndRecordTip(
    confessionId: string,
    dto: VerifyTipDto,
  ): Promise<Tip> {
    // Check if confession exists
    const confession = await this.confessionRepository.findOne({
      where: { id: confessionId },
    });

    if (!confession) {
      throw new NotFoundException(`Confession with ID ${confessionId} not found`);
    }

    // Check if tip already exists
    const existingTip = await this.tipRepository.findOne({
      where: { txId: dto.txId },
    });

    if (existingTip) {
      throw new BadRequestException('Tip transaction already recorded');
    }

    // Verify transaction on-chain
    const isValid = await this.stellarService.verifyTransaction(dto.txId);

    if (!isValid) {
      throw new BadRequestException(
        'Transaction not found or invalid on Stellar network',
      );
    }

    // Fetch transaction details from Horizon to get amount and sender
    try {
      const horizonUrl = this.stellarService.getHorizonTxUrl(dto.txId);
      const response = await fetch(horizonUrl);
      
      if (!response.ok) {
        throw new BadRequestException('Failed to fetch transaction details');
      }

      const txData = await response.json();
      
      // Extract payment operation details
      // Note: Operations are in the _embedded.records array in Horizon API
      const operations = txData._embedded?.operations || [];
      const paymentOps = operations.filter(
        (op: any) => op.type === 'payment' && op.asset_type === 'native',
      );

      if (!paymentOps || paymentOps.length === 0) {
        throw new BadRequestException('Transaction does not contain XLM payment');
      }

      // Use the first payment operation
      const paymentOp = paymentOps[0];
      const amount = parseFloat(paymentOp.amount);
      const receiptMetadata = this.extractSettlementReceiptMetadata(txData);
      const senderAddress = receiptMetadata.anonymousSender
        ? null
        : paymentOp.from || null;

      // Minimum tip amount check (0.1 XLM)
      const MIN_TIP_AMOUNT = 0.1;
      if (amount < MIN_TIP_AMOUNT) {
        throw new BadRequestException(
          `Tip amount ${amount} XLM is below minimum of ${MIN_TIP_AMOUNT} XLM`,
        );
      }

      // For anonymous tipping, we don't verify the recipient address
      // We just record that a tip was sent to this confession
      // The actual recipient is determined by the transaction itself
      // If the memo includes settlement receipt metadata, this validates bounded proof payloads
      // and supports reconciliation identifiers without exposing sender details.
      void receiptMetadata.settlementId;
      void receiptMetadata.proofMetadata;

      // Create and save tip
      const tip = this.tipRepository.create({
        confessionId,
        amount,
        txId: dto.txId,
        senderAddress: senderAddress, // Optional for anonymity - can be null
      });

      return await this.tipRepository.save(tip);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to process tip transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get tip by transaction ID
   */
  async getTipByTxId(txId: string): Promise<Tip | null> {
    return this.tipRepository.findOne({
      where: { txId },
      relations: ['confession'],
    });
  }
}
