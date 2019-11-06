import * as api from 'telegraf';
import User from '../models/user';
import PersonType from '../enums/PersonType';
import { addPerson } from '../helpers/persons';

/**
 * Прослойка для добавления новых пользователей
 * @async
 */

export default async (ctx: api.ContextMessageUpdate, next: Function) => {
	// Получаем данные о пользователе из контекста
	let chatId = ctx.from.id;
	let username = ctx.from.username;
	let name = ctx.from.first_name;

	// Составляем имя в зависимости от наличия фамилии
	if (ctx.from.last_name !== undefined) {
		name = `${ctx.from.first_name} ${ctx.from.last_name}`;
	}

	// Добавляем админа @vilkup и @kemarskiy
	let isAdmin = [/*300922262,*/ 461738219].includes(chatId);

	let insertDoc: any = {
		chatId,
		name
	};

	if (username) insertDoc.username = username;
	if (isAdmin) insertDoc.isAdmin = true;

	await User.findOneAndUpdate({ chatId: chatId }, insertDoc, {
		upsert: true,
		new: true
	});

	await next();
};
