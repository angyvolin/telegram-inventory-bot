import schedule from 'node-schedule';
import Getting from '../models/getting';
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import Instrument from '../classes/Instrument';
import Furniture from '../classes/Furniture';
import Consumable from '../classes/Consumable';

export default class Daemon {
	public static init(bot: Telegraf<ContextMessageUpdate>) {
		schedule.scheduleJob({ second: 0 }, async () => {
			this.sendNotifies(bot);
		});
	}

	public static async sendNotifies(bot: Telegraf<ContextMessageUpdate>) {
		const gettings = await Getting.find({ active: true });

		for (let getting of gettings) {
			const now = new Date();
			const minsLeft = Math.floor((getting.expires.valueOf() - now.valueOf()) / (60 * 1000));

			if (minsLeft === 30) {
				let message = `*Внимание ❗️*\nСрок возврата следующих позиций истекает *через полчаса*\n\n`;

				if (getting.instruments) {
					for (let item of getting.instruments) {
						const { name, measure } = await Instrument.getItem(item[0]);
						message += `🔹 ${name} – ${item[1]} ${measure}\n`;
					}
				}

				if (getting.furniture) {
					for (let item of getting.furniture.entries()) {
						const { name, measure } = await Furniture.getItem(item[0]);
						message += `🔹 ${name} – ${item[1]} ${measure}\n`;
					}
				}

				if (getting.consumables) {
					for (let item of getting.consumables.entries()) {
						const { name, measure } = await Consumable.getItem(item[0]);
						message += `🔹 ${name} – ${item[1]} ${measure}\n`;
					}
				}

				await bot.telegram.sendMessage(getting.chatId, message, {
					parse_mode: 'Markdown'
				});
			}
		}
	}
}
