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

export async function getActiveGettingsByInstruments(chatId: number, instruments: { id: string; amount: number }[]) {
	const gettings = await Getting.find({
		chatId,
		active: true
	});
	const arr = [];
	for (const getting of gettings) {
		let flag = false;
		for (const instrument of instruments) {
			const { id, amount } = instrument;
			if (!getting.instruments.has(id) || getting.instruments.get(id) < amount) {
				flag = true;
			}
		}
		if (flag) {
			continue;
		}
		arr.push(getting);
	}
	return arr;
}
