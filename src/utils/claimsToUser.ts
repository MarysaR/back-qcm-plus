import { RoleEnum, TokenClaims, User } from 'logic-qcm-plus';

export function claimsToUser(claims: TokenClaims): User {
  return {
    id: claims.userId,
    email: claims.email,
    roleId: claims.roleId,
    firstName: '',
    lastName: '',
    login: '',
    password: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: {
      id: claims.roleId,
      name: claims.roleId == RoleEnum.ADMIN ? 'ADMIN' : 'STAGIAIRE',
      isActive: true,
    },
  };
}
