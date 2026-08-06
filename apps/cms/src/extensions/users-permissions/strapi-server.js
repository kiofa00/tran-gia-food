'use strict';

module.exports = (plugin) => {
  if (plugin.contentTypes && plugin.contentTypes.user) {
    plugin.contentTypes.user.pluginOptions = {
      ...plugin.contentTypes.user.pluginOptions,
      'content-manager': {
        visible: false,
      },
    };
  }
  return plugin;
};
