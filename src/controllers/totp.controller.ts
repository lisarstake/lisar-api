// TOTP controller: endpoints for 2FA setup, verification, and validation
// Assumes user authentication middleware sets req.user (with userId)
// Secrets should be encrypted in DB (not handled here)
import { Request, Response } from 'express';
import { totpService } from '../services/totp.service';
import { userService } from '../services/user.service'; // You must implement secure secret storage in userService

class TOTPController {
  // Step 1: Generate secret and QR code for user
  async setup(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
   
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      // Fetch user email from DB
      const userProfile = await userService.getUserProfile(userId);
      const email = userProfile?.email;
      if (!email) {
        return res.status(400).json({ success: false, error: 'User email not found' });
      }
      // Always use issuer 'Lisar' and name as email
      const secretObj = await totpService.generateSecret({ name: email, issuer: 'Lisar' });
      // Store secretObj.base32 securely (encrypted) in user DB record
      await userService.setTOTPSecret(userId, secretObj.base32);
      const qr = await totpService.generateQRCode(secretObj.otpauth_url);
      return res.json({ success: true, qr, otpauth_url: secretObj.otpauth_url });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to generate TOTP secret' });
    }
  }

  // Step 2: Verify code and enable 2FA
  async verify(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { token } = req.body;
      if (!userId || !token) {
        return res.status(400).json({ success: false, error: 'Missing user or token' });
      }
      const secret = await userService.getTOTPSecret(userId);
      if (!secret) {
        return res.status(400).json({ success: false, error: 'No TOTP secret found' });
      }
      const valid = await totpService.verify(token, secret);
      if (valid) {
        await userService.enableTOTP(userId);
        return res.json({ success: true });
      } else {
        return res.status(400).json({ success: false, error: 'Invalid code' });
      }
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to verify TOTP code' });
    }
  }

  // Step 3: Validate code during login
  async validate(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { token } = req.body;
      if (!userId || !token) {
        return res.status(400).json({ success: false, error: 'Missing user or token' });
      }
      const secret = await userService.getTOTPSecret(userId);
      if (!secret) {
        return res.status(400).json({ success: false, error: 'No TOTP secret found' });
      }
      const valid = await totpService.verify(token, secret);
      if (valid) {
        return res.json({ success: true });
      } else {
        return res.status(400).json({ success: false, error: 'Invalid code' });
      }
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to validate TOTP code' });
    }
  }
}

export const totpController = new TOTPController();
