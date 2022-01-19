import { InputTokenInterface } from './inputTokenInterface';
import { InputPoolInterface } from './inputPoolInterface';

export default interface WalletPoolInterface {
  input0: InputTokenInterface;
  input1: InputTokenInterface;
  pool: InputPoolInterface;
}
