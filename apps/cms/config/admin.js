module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'trangiaAdminSecretKey2026'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'trangiaApiTokenSalt2026'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'trangiaTransferSalt2026'),
    },
  },
});
