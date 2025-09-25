/**
 * Configuration centralisée pour la gestion des tokens sécurisés (HMAC).
 *
 * @property {string} secret - Clé secrète utilisée pour signer et vérifier les tokens.
 * Elle est chargée depuis la variable d’environnement `JWT_SECRET`.
 *
 * En production, cette clé doit impérativement être définie via `JWT_SECRET`.
 * En l’absence de cette variable, l’application échouera au démarrage,
 * garantissant un comportement strictement sécurisé.
 */
export const tokenConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '5min',
};
