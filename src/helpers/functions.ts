import * as api from 'telegraf';
import Logger from '../init/logger';
import User, { IUser } from '../models/user';

/**
 * Получает список пользователей
 * @async
 * @function getUsers
 * @returns { Promise<IUser[]> }
 */
export async function getUsers(): Promise<IUser[]> {
	return User.find({});
}

/**
 * Получает список админов
 * @async
 * @function getAdmins
 * @returns { Promise<IUser[]> }
 */
export async function getAdmins(): Promise<IUser[]> {
	return User.find({ isAdmin: true });
}

export async function getChatId(username: string): Promise<number> {
	const user = await User.findOne({ username });
	return user ? user.chatId : null;
}

/**
 * Проверяет является ли пользователь админом
 * @async
 * @function isAdmin
 * @param chatId
 * @returns { Promise<Boolean> }
 */
export async function isAdmin(chatId: number): Promise<Boolean> {
	let res = await User.find({ chatId: chatId, isAdmin: true });
	return res.length > 0;
}

/**
 * Проводит глобальную рассылку
 * @async
 * @function sendGlobal
 * @param ctx
 * @returns { Promise<void> }
 */
export async function sendGlobal(ctx: api.ContextMessageUpdate): Promise<void> {
	let users = await User.find({});

	for (const user of users) {
		if (user.chatId != ctx.from.id) {
			try {
				await ctx.telegram.sendCopy(user.chatId, ctx.message);
			} catch (err) {
				Logger.error(`Не удалось выполнить рассылку пользователю: ${err.message}`);
			}
		}
	}
}

/**
 * Добавляет нового админа
 * @async
 * @function addAdmin
 * @param chatId
 * @returns { Promise<void> }
 */
export async function addAdmin(chatId: number, username: string, name: string): Promise<void> {
	try {
		const insertDoc: any = {
			chatId,
			name,
			isAdmin: true
		};
		if (username) insertDoc.username = username;

		await User.findOneAndUpdate({ chatId }, insertDoc, {
			upsert: true,
			new: true
		});
	} catch (err) {
		throw new Error(`Ошибка при добавлении админа: ${err.message}`);
	}
}

/**
 * Отстраняет админа
 * @async
 * @function dismissAdmin
 * @param chatId
 * @returns { Promise<void> }
 */
export async function dismissAdmin(chatId: number): Promise<void> {
	try {
		await User.updateOne({ chatId: chatId }, { isAdmin: false });
		Logger.notify('Админ успешно отстранён!');
	} catch (err) {
		throw new Error(`Ошибка при отстранении админа: ${err.message}`);
	}
}

export async function getUsernameByChatId(chatId: number): Promise<string> {
	return (await User.findOne({ chatId })).username;
}
