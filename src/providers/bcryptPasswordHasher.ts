import bcrypt from 'bcrypt';
import { PasswordHasher } from 'logic-qcm-plus';

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 10;

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }
}
