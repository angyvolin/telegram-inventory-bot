import ItemType from '../enums/ItemType';
import Getting, { IGetting } from '../models/getting';

export function getDateFormat(date: Date): string {
	let dd: number | string = date.getDate();
	let mm: number | string = date.getMonth() + 1; //January is 0!

	let yyyy = date.getFullYear();
	if (dd < 10) {
		dd = '0' + dd;
	}
	if (mm < 10) {
		mm = '0' + mm;
	}
	return dd + '-' + mm + '-' + yyyy;
}

export async function getGettings(chatId: number) {
	return Getting.find({ chatId });
}

export async function getActiveGettings(chatId: number) {
	return Getting.find({
		chatId,
		active: true
	});
}

export async function getActiveGettingsByItems(chatId: number, items: { type: ItemType; id: string; amount: number }[]) {
	const gettings = await Getting.find({
		chatId,
		active: true
	});
	const arr = [];
	for (const getting of gettings) {
		let isAbsent = false;
		for (const item of items) {
			const { type, id, amount } = item;
			switch (type) {
				case ItemType.INSTRUMENT: {
					if (!getting.instruments) { break; }
					isAbsent = !getting.instruments.has(id) || getting.instruments.get(id) < amount;
					break;
				}
				case ItemType.FURNITURE: {
					if (!getting.furniture) { break; }
					isAbsent = !getting.furniture.has(id) || getting.furniture.get(id) < amount;
					break;
				}
				case ItemType.CONSUMABLE: {
					if (!getting.instruments) { break; }
					isAbsent = !getting.consumables.has(id) || getting.consumables.get(id) < amount;
					break;
				}
			}
		}
		if (isAbsent) {
			continue;
		}
		arr.push(getting);
	}
	return arr;
}

/**
 * @desc Возвращает активное получение указанного
 * юзера с указанными позициями, которое имеет
 * наименьший срок для возврата
 */
export async function getEarliestActiveGetting(chatId: number, items: { type: ItemType; id: string; amount: number }[]) {
	const gettings = await Getting.find({
		chatId,
		active: true
	});
	let earliestGetting; // Получение с ближайшим истечением срока
	let minDate; // Наименьший срок
	for (const getting of gettings) {
		const expires = +getting.expires;
		
		if (minDate && expires >= minDate) {
			continue;
		}

		let isAbsent = false;
		for (const item of items) {
			const { type, id, amount } = item;
			switch (type) {
				case ItemType.INSTRUMENT: {
					if (!getting.instruments) {
						isAbsent = true;
					} else {
						isAbsent = !getting.instruments.has(id) || getting.instruments.get(id) < amount;
					}
					break;
				}
				case ItemType.FURNITURE: {
					if (!getting.furniture) {
						isAbsent = true;
					} else {
						isAbsent = !getting.furniture.has(id) || getting.furniture.get(id) < amount;
					}
					break;
				}
				case ItemType.CONSUMABLE: {
					if (!getting.consumables) {
						isAbsent = true;
					} else {
						isAbsent = !getting.consumables.has(id) || getting.consumables.get(id) < amount;
					}
					break;
				}
			}
		}
		if (isAbsent) {
			continue;
		}

		minDate = expires; // Переприсваиваем наименьший срок
		earliestGetting = getting; // Запоминаем текущее получение
	}
	return earliestGetting ? earliestGetting._id : null;
}
