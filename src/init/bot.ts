import Telegraf from 'telegraf'
import config from '../config'
import Logger from './logger'

export default class Bot {
  private static token: string
  
  public static async configure() {
    // Проверка окружения и смена токена
    this.token = config.token
    
    const bot = new Telegraf(this.token)    // Создание обьекта
    await bot.launch()                      // Запуск
    
    Logger.trace('>>> Бот сконфигурирован')
    return bot
  }
}
