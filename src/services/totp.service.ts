// TOTPService: pluggable TOTP (2FA) service for user authentication
// This service abstracts the TOTP implementation so you can swap out the underlying library (speakeasy, otplib, etc.)
// All secrets should be encrypted at rest in your DB (not handled here)


import { totp as otplibTotp, authenticator as otplibAuthenticator } from 'otplib';
import qrcode from 'qrcode';

export interface ITOTPProvider {
  generateSecret(options?: { name?: string; issuer?: string }): Promise<{ ascii: string; base32: string; otpauth_url: string }>;
  generateQRCode(otpauthUrl: string): Promise<string>;
  verify(token: string, secret: string): Promise<boolean>;
}


// Default provider using otplib
export class OtplibTOTPProvider implements ITOTPProvider {
  async generateSecret(options?: { name?: string; issuer?: string }) {
    const secret = otplibAuthenticator.generateSecret();
    const otpauth_url = otplibAuthenticator.keyuri(
      options?.name || '',
      options?.issuer || '',
      secret
    );
    return {
      ascii: secret,
      base32: secret,
      otpauth_url,
    };
  }

  async generateQRCode(otpauthUrl: string) {
    return qrcode.toDataURL(otpauthUrl);
  }

  async verify(token: string, secret: string) {
    return otplibAuthenticator.check(token, secret);
  }
}

// Main TOTP service, can swap provider
export class TOTPService {
  private provider: ITOTPProvider;

  constructor(provider?: ITOTPProvider) {
    this.provider = provider || new OtplibTOTPProvider();
  }

  setProvider(provider: ITOTPProvider) {
    this.provider = provider;
  }

  async generateSecret(options?: { name?: string; issuer?: string }) {
    return this.provider.generateSecret(options);
  }

  async generateQRCode(otpauthUrl: string) {
    return this.provider.generateQRCode(otpauthUrl);
  }

  async verify(token: string, secret: string) {
    return this.provider.verify(token, secret);
  }
}

export const totpService = new TOTPService();
