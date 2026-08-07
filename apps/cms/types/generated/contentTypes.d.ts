import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String & Attribute.Required & Attribute.SetMinMaxLength;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    description: Attribute.String & Attribute.SetMinMaxLength & Attribute.DefaultTo;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String & Attribute.Required & Attribute.Unique & Attribute.SetMinMaxLength;
    permissions: Attribute.Relation;
    type: Attribute.Enumeration & Attribute.Required & Attribute.DefaultTo;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required & Attribute.SetMinMaxLength;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    token: Attribute.Relation;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required & Attribute.SetMinMaxLength;
    actionParameters: Attribute.JSON & Attribute.DefaultTo;
    conditions: Attribute.JSON & Attribute.DefaultTo;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo;
    role: Attribute.Relation;
    subject: Attribute.String & Attribute.SetMinMaxLength;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Required & Attribute.Unique & Attribute.SetMinMaxLength;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    description: Attribute.String;
    name: Attribute.String & Attribute.Required & Attribute.Unique & Attribute.SetMinMaxLength;
    permissions: Attribute.Relation;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
    users: Attribute.Relation;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String & Attribute.Required & Attribute.SetMinMaxLength;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    description: Attribute.String & Attribute.SetMinMaxLength & Attribute.DefaultTo;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String & Attribute.Required & Attribute.Unique & Attribute.SetMinMaxLength;
    permissions: Attribute.Relation;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required & Attribute.SetMinMaxLength;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    token: Attribute.Relation;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength;
    firstname: Attribute.String & Attribute.SetMinMaxLength;
    isActive: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo;
    lastname: Attribute.String & Attribute.SetMinMaxLength;
    password: Attribute.Password & Attribute.Private & Attribute.SetMinMaxLength;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation & Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiBannerBanner extends Schema.CollectionType {
  collectionName: 'banners';
  info: {
    description: 'Carousel and campaign promotional banners';
    displayName: 'Marketing Banner';
    pluralName: 'banners';
    singularName: 'banner';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    activeFrom: Attribute.DateTime;
    activeTo: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    displayOrder: Attribute.Integer & Attribute.DefaultTo;
    image: Attribute.Media;
    isActive: Attribute.Boolean & Attribute.DefaultTo;
    publishedAt: Attribute.DateTime;
    targetAudience: Attribute.Enumeration & Attribute.DefaultTo;
    targetUrl: Attribute.String;
    title: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface ApiFaqItemFaqItem extends Schema.CollectionType {
  collectionName: 'faq_items';
  info: {
    description: 'Frequently asked questions and support guides';
    displayName: 'Help Center FAQ Item';
    pluralName: 'faq-items';
    singularName: 'faq-item';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    answer: Attribute.RichText & Attribute.Required;
    category: Attribute.Enumeration & Attribute.DefaultTo;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    displayOrder: Attribute.Integer & Attribute.DefaultTo;
    publishedAt: Attribute.DateTime;
    question: Attribute.String & Attribute.Required;
    targetApp: Attribute.Enumeration & Attribute.DefaultTo;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface ApiTranslationTranslation extends Schema.CollectionType {
  collectionName: 'translations';
  info: {
    description: 'Universal dynamic text labels and i18n dictionary for all apps';
    displayName: 'Dynamic Translation & Text Copy';
    pluralName: 'translations';
    singularName: 'translation';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    appTarget: Attribute.Enumeration & Attribute.Required & Attribute.DefaultTo;
    category: Attribute.String & Attribute.DefaultTo;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    en: Attribute.Text;
    key: Attribute.String & Attribute.Required & Attribute.Unique;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
    vi: Attribute.Text & Attribute.Required;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration & Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    entry: Attribute.Relation;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation;
    type: Attribute.Enumeration & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    name: Attribute.String & Attribute.SetMinMax;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation & Attribute.Private;
    folderPath: Attribute.String & Attribute.Required & Attribute.Private & Attribute.SetMinMax;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    files: Attribute.Relation;
    name: Attribute.String & Attribute.Required & Attribute.SetMinMax;
    parent: Attribute.Relation;
    path: Attribute.String & Attribute.Required & Attribute.SetMinMax;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    role: Attribute.Relation;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    description: Attribute.String;
    name: Attribute.String & Attribute.Required & Attribute.SetMinMaxLength;
    permissions: Attribute.Relation;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
    users: Attribute.Relation;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.DefaultTo;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation & Attribute.Private;
    email: Attribute.Email & Attribute.Required & Attribute.SetMinMaxLength;
    password: Attribute.Password & Attribute.Private & Attribute.SetMinMaxLength;
    provider: Attribute.String;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation & Attribute.Private;
    username: Attribute.String & Attribute.Required & Attribute.Unique & Attribute.SetMinMaxLength;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::banner.banner': ApiBannerBanner;
      'api::faq-item.faq-item': ApiFaqItemFaqItem;
      'api::translation.translation': ApiTranslationTranslation;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
