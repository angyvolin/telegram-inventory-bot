import AdminMessage from '../controllers/admin'
import { addAdmin } from '../helpers/functions'
import Logger from '../init/logger'

const Scene = require('telegraf/scenes/base')
const Markup = require('telegraf/markup')

/**
 * Сцена добавления админа
 */
const addAdmins = new Scene('addAdmins')

addAdmins.command('start', async (ctx: any) => {
  await ctx.scene.leave()
  await AdminMessage.send(ctx)
  ctx.session = {}
})

// Точка входа в сцену
addAdmins.enter(async (ctx: any) => {
  let keyboard = Markup.inlineKeyboard([
    Markup.callbackButton('Назад', 'back')
  ]).extra()
  
  await ctx.replyWithMarkdown('Перешлите мне сообщение от будущего админа ⏩\n*Он должен быть пользователем бота!*', keyboard)
})

addAdmins.on('message', async (ctx: any) => {
  try {
    let adminId = ctx.message.forward_from.id
    await addAdmin(adminId)    // добавляем админов
    
    await ctx.reply('Операция прошла успешно! 🎉', AdminMessage.keyboard)
    Logger.notify(`Новый админ(${adminId}) добавлен! 🎉 Админ: @${ctx.from.username}`)
  }
  catch (err) {
    await ctx.reply('Не удалось добавить новых админов, приносим извинения.\nВозможно, Вы ввели некорректные данные', AdminMessage.keyboard)
    Logger.error(err.message)
  }
  return ctx.scene.leave()
})

addAdmins.on('callback_query', async (ctx: any) => {
  switch (ctx.callbackQuery.data) {
    case 'back':
      await ctx.scene.leave()
      await AdminMessage.send(ctx)
      break
  }
})
export default addAdmins
