import { InputPoolInterface } from './inputPoolInterface';
import { InputTokenInterface } from './inputTokenInterface';

export default interface WalletPoolInterface {
  input0: InputTokenInterface;
  input1: InputTokenInterface;
  pool: InputPoolInterface;
}
