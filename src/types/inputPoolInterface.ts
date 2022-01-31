import PoolInterface from './poolInterface';

export interface InputPoolInterface {
  token: PoolInterface;
  amount: string;
  overallAmount: string;
  removeAmount?: string;
}
