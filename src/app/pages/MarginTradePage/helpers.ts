import { utils } from 'ethers';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { signData } from 'eth-permit/dist/rpc';
import { MarginLimitOrder } from './types';
import {
  getContract,
  getTokenContract,
  getTokenLendingContract,
} from '../../../utils/blockchain/contract-helpers';
import type { Asset } from '../../../types';

export class MarginOrder {
  static ORDER_TYPEHASH =
    '0x081065ed5fb223d1fbe21ab1bb041dfac552070112cff5e8d4be7dada1f96cd6';

  readonly loanTokenAddress: string;
  readonly collateralTokenAddress: string;

  constructor(
    readonly loanId: string,
    readonly leverageAmount: string,
    loanToken: Asset,
    readonly loanTokenSent: string,
    readonly collateralTokenSent: string,
    collateralToken: Asset,
    readonly trader: string,
    readonly minEntryPrice: string,
    readonly loanDataBytes: string,
    readonly deadline: string,
    readonly createdTimestamp: string,
    readonly v?: number,
    readonly r?: string,
    readonly s?: string,
  ) {
    this.loanTokenAddress = getTokenLendingContract(loanToken).address;
    this.collateralTokenAddress = getTokenContract(collateralToken).address;
  }

  hash(overrides?: MarginLimitOrder) {
    return utils.keccak256(
      utils.defaultAbiCoder.encode(
        [
          'bytes32',
          'bytes32',
          'uint256',
          'address',
          'uint256',
          'uint256',
          'address',
          'address',
          'uint256',
          'bytes32',
          'uint256',
          'uint256',
        ],
        [
          MarginOrder.ORDER_TYPEHASH,
          overrides?.loanId || this.loanId,
          overrides?.leverageAmount || this.leverageAmount,
          overrides?.loanTokenAddress || this.loanTokenAddress,
          overrides?.loanTokenSent || this.loanTokenSent,
          overrides?.collateralTokenSent || this.collateralTokenSent,
          overrides?.collateralTokenAddress || this.collateralTokenAddress,
          overrides?.trader || this.trader,
          overrides?.minEntryPrice || this.minEntryPrice,
          overrides?.loanDataBytes || this.loanDataBytes,
          overrides?.deadline || this.deadline,
          overrides?.createdTimestamp || this.createdTimestamp,
        ],
      ),
    );
  }

  async sign(chainId: number) {
    const domain = {
      name: 'OrderBookMargin',
      version: '1',
      chainId,
      verifyingContract: getContract('orderBookMargin').address,
    };
    const types = {
      Order: [
        { name: 'loanId', type: 'bytes32' },
        { name: 'leverageAmount', type: 'uint256' },
        { name: 'loanTokenAddress', type: 'address' },
        { name: 'loanTokenSent', type: 'uint256' },
        { name: 'collateralTokenSent', type: 'uint256' },
        { name: 'collateralTokenAddress', type: 'address' },
        { name: 'trader', type: 'address' },
        { name: 'minEntryPrice', type: 'uint256' },
        { name: 'loanDataBytes', type: 'bytes32' },
        { name: 'deadline', type: 'uint256' },
        { name: 'createdTimestamp', type: 'uint256' },
      ],
    };

    const value = {
      loanId: this.loanId,
      leverageAmount: this.leverageAmount,
      loanTokenAddress: this.loanTokenAddress,
      loanTokenSent: this.loanTokenSent,
      collateralTokenSent: this.collateralTokenSent,
      collateralTokenAddress: this.collateralTokenAddress,
      trader: this.trader,
      minEntryPrice: this.minEntryPrice,
      loanDataBytes: this.loanDataBytes,
      deadline: this.deadline,
      createdTimestamp: this.createdTimestamp,
    };

    const payload = _TypedDataEncoder.getPayload(domain, types, value);

    // todo: use provider instead of window.ethereum as only browser wallets support it.
    // todo: refactor sovryn-monorepo a lot!
    return await signData(window.ethereum, this.trader, payload);
  }

  async toArgs(chainId: number) {
    const { v, r, s } =
      this.v && this.r && this.s
        ? { v: this.v, r: this.r, s: this.s }
        : await this.sign(chainId);

    return [
      this.loanId,
      this.leverageAmount,
      this.loanTokenAddress,
      this.loanTokenSent,
      this.collateralTokenSent,
      this.collateralTokenAddress,
      this.trader,
      this.minEntryPrice,
      this.loanDataBytes,
      this.deadline,
      this.createdTimestamp,
      v,
      r,
      s,
    ];
  }
}
