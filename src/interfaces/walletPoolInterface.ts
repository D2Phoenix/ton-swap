import { InputTokenInterface } from './inputTokenInterface';
import { InputPoolInterface } from './inputPoolInterface';

export default interface WalletPoolInterface {
    one: InputTokenInterface;
    two: InputTokenInterface;
    pool: InputPoolInterface;
}
