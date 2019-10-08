import * as api from 'telegraf'
import Logger from '../init/logger'

/**
 * Прослойка для логирования переписки
 * @async
 */

export default async (ctx: api.ContextMessageUpdate, next: Function) => {
  // Получаем данные о пользователе из контекста
  let username = ctx.from.username
  let name = ctx.from.first_name
  
  // Составляем имя в зависимости от наличия фамилии
  if (ctx.from.last_name !== undefined) {
    name = `${ctx.from.first_name} ${ctx.from.last_name}`
  }
  
  // Логируем сообщение
  if (ctx.updateType === 'callback_query') {
    if (username !== undefined) {
      Logger.notify(`${name} (@${username}) выбрал(а): "${ctx.callbackQuery.data}"`)
    }
    else {
      Logger.notify(`${name} выбрал(а): "${ctx.callbackQuery.data}"`)
    }
  }
  else if (ctx.updateType === 'message') {
    if (username !== undefined) {
      Logger.notify(`Сообщение от ${name} (@${username}): "${ctx.message.text}"`)
    }
    else {
      Logger.notify(`Сообщение от ${name}: "${ctx.message.text}"`)
    }
  }
  
  next()
}