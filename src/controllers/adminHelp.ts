import * as api from 'telegraf';
import * as texts from '../texts.json';
import AdminMessage from './admin';

export default class AdminsHelpMessage {
	public static async send(ctx: api.ContextMessageUpdate): Promise<void> {
		await ctx.replyWithMarkdown(texts.adminHelp, AdminMessage.keyboard);
	}
}
