import csv = require('fast-csv');
import axios from 'axios';
import Instrument from '../classes/Instrument';
import Furniture from '../classes/Furniture';
import Consumable from '../classes/Consumable';
import ItemType from '../enums/ItemType';

export async function generateTable() {
	const instruments = await Instrument.getAllItems();
	const furniture = await Furniture.getAllItems();
	const consumables = await Consumable.getAllItems();

	let records = [['Название', 'Тип', 'Количество', 'ID', 'TYPE']];

	for (let item of instruments) {
		records.push([item.name, 'Инструмент', 0, item._id, ItemType.INSTRUMENT]);
	}

	for (let item of furniture) {
		records.push([item.name, 'Фурнитура', 0, item._id, ItemType.INSTRUMENT]);
	}

	for (let item of consumables) {
		records.push([item.name, 'Расходник', 0, item._id, ItemType.INSTRUMENT]);
	}
	return csv.writeToBuffer(records);
}

export async function downloadTable(url: string) {
	const response = await axios({
		url,
		method: 'GET',
		responseType: 'arraybuffer'
	});

	return response.data;
}
