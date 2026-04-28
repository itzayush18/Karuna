import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);

  constructor(private readonly config: ConfigService) {
    if (getApps().length) return;

    const projectId = this.config.get<string>('firebase.projectId');
    const clientEmail = this.config.get<string>('firebase.clientEmail');
    const privateKey = this.config.get<string>('firebase.privateKey')?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
      return;
    }

    try {
      initializeApp({
        projectId: projectId || 'karuna-3e839',
      });
    } catch (e) {
      // Ignore if already initialized
    }
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    try {
      return await getAuth().verifyIdToken(idToken);
    } catch (error) {
      this.logger.warn(`Firebase Admin token verification failed: ${error instanceof Error ? error.message : String(error)}`);
      return this.verifyIdTokenWithRest(idToken);
    }
  }

  private async verifyIdTokenWithRest(idToken: string): Promise<DecodedIdToken> {
    const apiKey = this.config.get<string>('firebase.webApiKey');
    if (!apiKey) {
      throw new UnauthorizedException('Invalid Firebase credentials');
    }

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Invalid Firebase credentials');
    }

    const payload = (await response.json()) as {
      users?: Array<{
        localId?: string;
        email?: string;
        emailVerified?: boolean;
        displayName?: string;
        photoUrl?: string;
      }>;
    };
    const user = payload.users?.[0];
    if (!user?.localId || !user.email) {
      throw new UnauthorizedException('Invalid Firebase credentials');
    }

    return {
      uid: user.localId,
      sub: user.localId,
      aud: this.config.get<string>('firebase.projectId') ?? '',
      iss: `https://securetoken.google.com/${this.config.get<string>('firebase.projectId') ?? ''}`,
      email: user.email,
      email_verified: user.emailVerified ?? false,
      name: user.displayName,
      picture: user.photoUrl,
      iat: 0,
      exp: 0,
      auth_time: 0,
      firebase: { identities: {}, sign_in_provider: 'password' },
    } as DecodedIdToken;
  }
}
