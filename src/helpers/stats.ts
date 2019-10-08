import User from '../models/user'

/**
 * Возвращает количество пользователей
 * @async
 * @function getAllUsersCount
 * @returns { Promise<number> }
 */
export async function getAllUsersCount(): Promise<number> {
  let users = await User.find({})
  return users.length
}