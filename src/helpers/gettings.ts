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