'use strict';

module.exports = {
  register({ strapi }) {
    if (strapi.plugin('users-permissions')?.contentType('user')) {
      const userContentType = strapi.plugin('users-permissions').contentType('user');
      userContentType.pluginOptions = {
        ...userContentType.pluginOptions,
        'content-manager': {
          visible: false,
        },
        'content-type-builder': {
          visible: false,
        },
      };
    }
  },
  bootstrap(/*{ strapi }*/) {},
};
