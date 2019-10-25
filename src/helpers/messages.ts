import ItemType from '../enums/ItemType';
import { getItem } from './items';
import { getCell } from './cells';

/**
 * @desc Составляет сообщение со списком позиций
 * и ихним размещением на складе (номерами ячеек)
 */
export async function getCellsMessage(items: { name: string, cellName: string }[]) {
	let message = '';
	for (const item of items) {
		if (!item.cellName) {
			message += `🔸 ${item.name} -> вне ячейки\n`;
		} else {
			message += `🔸 ${item.name} -> ${item.cellName}\n`;
		}
	}
	return message;
}

/**
 * @desc Составляет сообщение со списком позиций
 * и ихним количеством в наличии
 */
export async function getItemsMessage(items: { type: ItemType; id: string; amount: number }[]): Promise<string> {
	let message = '';
	for (let item of items) {
		const { id, type, amount } = item;
		const { name } = await getItem(type, id);

		message += `🔹 ${name} -> ${amount} шт.\n`;
	}
	return message;
}

/**
 * @desc Составляет сообщение кладовщику для
 * запроса на получение позиций работником
 */
export async function getGettingMessage(username: string,
										items: { type: ItemType, id: string, amount: number }[],
										days?: number): Promise<string> {
	let message = `*Работник* @${username} хочет получить следующие позиции:\n`;
	for (let item of items) {
		const { id, type, amount } = item; // Берем поля текущей позиции
		const { name } = await getItem(type, id); // Получаем имя позиции из БД
		const cell = await getCell(type, id); // Получаем номер ячейки
		// Составляем размещение позиции на складе (номер ячейки)
		const cellName = cell ? "ячейка" + cell.row + cell.col : "вне ячейки"; 
		// Добавляем позицию как строку к сообщению
		message += `🔹 ${name} -> ${amount} шт. (${cellName})\n`;
	}
	if (days) { // Есть срок получения
		message += `*Срок аренды:* ${days} дней`; // Добавляем срок к сообщению
	}
	return message;
}

/**
 * @desc Составляет сообщение кладовщику для
 * запроса на возврат позиций работником
 */
export async function getReturnMessage(username: string,
									   items: { type: ItemType, id: string, amount: number }[],
									  ): Promise<string> {
	let message = `*Работник* @${username} желает вернуть инструменты на склад:\n`;
	for (let item of items) {
		const { id, type, amount } = item; // Берем поля текущей позиции
		const { name } = await getItem(type, id); // Получаем имя позиции из БД
		const cell = await getCell(type, id); // Получаем номер ячейки
		// Составляем размещение позиции на складе (номер ячейки)
		const cellName = cell ? "ячейка" + cell.row + cell.col : "вне ячейки"; 
		// Добавляем позицию как строку к сообщению
		message += `🔹 ${name} -> ${amount} шт. (${cellName})\n`;
	}
	message += `\n❗️После возврата подтвердите нажатием кнопки ниже\n`;
	return message;
}