import TokenInterface from './tokenInterface';

export default interface TokenListInterface {
    name: string;
    logoURI: string;
    timestamp: string;
    tokens: TokenInterface[];
    version: {
        major: number;
        minor: number;
        patch: number;
    };
    isActive: boolean;
}
