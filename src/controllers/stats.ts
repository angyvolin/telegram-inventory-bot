import * as api from 'telegraf';
import AdminMessage from '../controllers/admin';
import { getAllUsersCount } from '../helpers/stats';

export default class StatsMessage {
	public static async send(ctx: api.ContextMessageUpdate): Promise<void> {
		let allUsersCount = await getAllUsersCount();
		await ctx.replyWithMarkdown(
			`*Статистика 📊*\n\nКол-во пользователей: *${allUsersCount}*`,
			AdminMessage.keyboard1
		);
	}
}
