import { UserRoleType } from "~/data/database/models/UserModel"
import { TDillerUserRole } from "~/data/entities/DillerEntity"

export type TPermission = 'update' | 'create' | 'add' | 'delete' | 'read'
export type TModerationPermissions = 'comments' | 'products'

export type TDillerNamespased = 'chat' | 'command' | 'analytics'
export type TDillerCommandPermission = 'add-manager' | 'add-admin' | 'delete-manager' | 'delete-admin'

export interface IRolePermissions {
  name: UserRoleType
  products: TPermission[]
  news: TPermission[]
  dillers: TPermission[]
  orders: TPermission[]
  user: TPermission[]
  moderation: TModerationPermissions[]
}

export const USER_PERMISSIONS: IRolePermissions[] = [
  {
    name: 'ROOT',
    products: ['create', 'update', 'delete', 'add', 'read'],
    news: ['create', 'update', 'delete', 'add', 'read'],
    dillers: ['create', 'update', 'delete', 'add', 'read'],
    orders: ['create', 'update', 'delete', 'add', 'read'],
    user: ['create', 'update', 'delete', 'add', 'read'],
    moderation: ['comments', 'products'],
  },
  {
    name: 'ADMIN',
    products: ['create', 'update', 'delete', 'add', 'read'],
    news: ['create', 'update', 'delete', 'add', 'read'],
    dillers: ['create', 'update', 'delete', 'add', 'read'],
    orders: ['create', 'update', 'delete', 'add', 'read'],
    user: ['create', 'update', 'delete', 'add', 'read'],
    moderation: ['comments', 'products'],
  },
  {
    name: 'MODERATOR',
    products: ['update', 'delete', 'read'],
    news: ['update', 'delete', 'read'],
    dillers: ['update', 'delete', 'read'],
    orders: ['update', 'delete', 'read'],
    user: ['update', 'delete', 'read'],
    moderation: ['comments', 'products'],
  },
  {
    name: 'DILLER',
    products: ['read'],
    news: ['read'],
    dillers: ['read'],
    orders: ['read'],
    user: ['read'],
    moderation: [],
  },
  {
    name: 'USER',
    products: [],
    news: [],
    dillers: [],
    orders: [],
    user: [],
    moderation: [],
  },
]

export interface IDillerRolePermission {
  name: TDillerUserRole
  products: TPermission[]
  command: TDillerCommandPermission[]
  namespaced: TDillerNamespased[]
}

export const DILLER_PERMISSIONS: IDillerRolePermission[] = [
  {
    name: 'DIRECTOR',
    products: ['create', 'update', 'delete', 'add', 'read'],
    command: ['add-admin', 'add-manager', 'delete-admin', 'delete-manager'],
    namespaced: ['chat', 'command', 'analytics'],
  },
  {
    name: 'ADMIN',
    products: ['create', 'update', 'delete', 'add', 'read'],
    command: ['add-manager', 'delete-manager'],
    namespaced: ['chat', 'command', 'analytics'],
  },
  {
    name: 'MANAGER',
    products: ['create', 'update', 'delete', 'add', 'read'],
    command: [],
    namespaced: ['chat', 'analytics'],
  },
]


export class Permissions {
  public static get rolePermissions () {
    return USER_PERMISSIONS
  }

  public static get dillerPermissions () {
    return DILLER_PERMISSIONS
  }

  public static getRolePermissions (role: UserRoleType) {
    return Permissions.rolePermissions.find((permission) => permission.name == role)
  }

  public static getDillerPermissions (dillerRole: TDillerUserRole) {
    return Permissions.dillerPermissions.find((permission) => permission.name == dillerRole)
  }
}
