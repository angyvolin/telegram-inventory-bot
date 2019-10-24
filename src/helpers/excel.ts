import Instrument from '../classes/Instrument';
import Furniture from '../classes/Furniture';
import Consumable from '../classes/Consumable';
import ItemType from '../enums/ItemType';
import csv = require('fast-csv');

export async function generateTable() {
	const instruments = await Instrument.getAllItems();
	const furniture = await Furniture.getAllItems();
	const consumables = await Consumable.getAllItems();

	let records = [['Название', 'Количество', 'ID', 'TYPE']];

	for (let item of instruments) {
		records.push([item.name, item.amount, item._id, ItemType.INSTRUMENT]);
	}

	for (let item of furniture) {
		records.push([item.name, item.amount, item._id, ItemType.INSTRUMENT]);
	}

	for (let item of consumables) {
		records.push([item.name, item.amount, item._id, ItemType.INSTRUMENT]);
	}
	return csv.writeToBuffer(records);
}
