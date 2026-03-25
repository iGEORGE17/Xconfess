import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from '../contract.service';
import { StellarConfigService } from '../stellar-config.service';
import { TransactionBuilderService } from '../transaction-builder.service';
import {
  StellarTimeoutError,
  StellarMalformedTransactionError,
} from '../utils/stellar-error.handler';

describe('ContractService', () => {
  let service: ContractService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ContractService,
        StellarConfigService,
        TransactionBuilderService,
      ],
    }).compile();
    service = module.get<ContractService>(ContractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encodeContractArgs', () => {
    it('should return args as-is (buggy, to be fixed)', () => {
      const args = ['foo', 123, true];
      expect(service['encodeContractArgs'](args)).toEqual(args);
    });
  });

  describe('Negative Paths & Error Handling', () => {
    it('should throw StellarTimeoutError when transaction times out', async () => {
      jest.spyOn(service as any, 'encodeContractArgs').mockReturnValue([]);
      jest
        .spyOn(module.get(TransactionBuilderService), 'buildTransaction')
        .mockResolvedValue({} as any);
      jest
        .spyOn(module.get(TransactionBuilderService), 'signTransaction')
        .mockReturnValue({} as any);
      jest
        .spyOn(module.get(TransactionBuilderService), 'submitTransaction')
        .mockRejectedValue(new Error('Transaction timeout'));

      await expect(
        service.invokeContract(
          {
            contractId: 'CC...',
            functionName: 'test',
            args: [],
            sourceAccount: 'G...',
          },
          'S...',
        ),
      ).rejects.toThrow(StellarTimeoutError);
    });

    it('should throw StellarMalformedTransactionError on tx_bad_seq (prevents duplicate writes)', async () => {
      jest.spyOn(service as any, 'encodeContractArgs').mockReturnValue([]);
      jest
        .spyOn(module.get(TransactionBuilderService), 'buildTransaction')
        .mockResolvedValue({} as any);
      jest
        .spyOn(module.get(TransactionBuilderService), 'signTransaction')
        .mockReturnValue({} as any);

      const badSeqError = {
        response: {
          data: {
            extras: {
              result_codes: { transaction: 'tx_bad_seq' },
            },
          },
        },
      };
      jest
        .spyOn(module.get(TransactionBuilderService), 'submitTransaction')
        .mockRejectedValue(badSeqError);

      await expect(
        service.invokeContract(
          {
            contractId: 'CC...',
            functionName: 'test',
            args: [],
            sourceAccount: 'G...',
          },
          'S...',
        ),
      ).rejects.toThrow(StellarMalformedTransactionError);
    });
  });
});
