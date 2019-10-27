import Instrument from '../classes/Instrument';
import Furniture from '../classes/Furniture';
import Consumable from '../classes/Consumable';
import InstrumentModel, { IInstrument } from '../models/instrument';
import FurnitureModel, { IFurniture } from '../models/furniture';
import ConsumableModel, { IConsumable } from '../models/consumable';
import ItemType from '../enums/ItemType';
import { getCell } from './cells';

export async function getItem(type: ItemType, id: string): Promise<IInstrument | IFurniture | IConsumable> {
	switch (type) {
		case ItemType.INSTRUMENT:
			return Instrument.getItem(id);
		case ItemType.FURNITURE:
			return Furniture.getItem(id);
		case ItemType.CONSUMABLE:
			return Consumable.getItem(id);
	}
}

export async function getOutsideItems(): Promise<Array<any>> {
	const instruments = await Instrument.getAllItems();
	const furniture = await Furniture.getAllItems();
	const consumables = await Consumable.getAllItems();

	let items = [];

	for (let item of instruments) {
		const inCell = await getCell(ItemType.INSTRUMENT, item._id.toString());
		if (!inCell && item.amount > 0) {
			items.push(item);
		}
	}

	for (let item of furniture) {
		const inCell = await getCell(ItemType.FURNITURE, item._id.toString());
		if (!inCell && item.amount > 0) {
			items.push(item);
		}
	}

	for (let item of consumables) {
		const inCell = await getCell(ItemType.CONSUMABLE, item._id.toString());
		if (!inCell && item.amount > 0) {
			items.push(item);
		}
	}

	return items;
}

export async function getOutsideConsumables(): Promise<Array<any>> {
	const consumables = await Consumable.getAllItems();

	let items = [];

	for (let item of consumables) {
		const inCell = await getCell(ItemType.CONSUMABLE, item._id.toString());
		if (!inCell && item.amount > 0) {
			items.push(item);
		}
	}
	return items;
}

export async function getOutsideFurniture(): Promise<Array<any>> {
	const furniture = await Furniture.getAllItems();

	let items = [];

	for (let item of furniture) {
		const inCell = await getCell(ItemType.FURNITURE, item._id.toString());
		if (!inCell && item.amount > 0) {
			items.push(item);
		}
	}

	return items;
}

export async function getOutsideInstruments(): Promise<Array<any>> {
	const instruments = await Instrument.getAllItems();

	let items = [];

	for (let item of instruments) {
		const inCell = await getCell(ItemType.INSTRUMENT, item._id.toString());
		if (!inCell && item.amount > 0) {
			items.push(item);
		}
	}
	return items;
}


export async function getAbsentItems(): Promise<Array<any>> {
	const instruments = await Instrument.getAllItems();
	const furniture = await Furniture.getAllItems();
	const consumables = await Consumable.getAllItems();

	let items = [];

	for (let item of instruments) {
		if (item.amount === 0) {
			items.push(item);
		}
	}

	for (let item of furniture) {
		if (item.amount === 0) {
			items.push(item);
		}
	}

	for (let item of consumables) {
		if (item.amount === 0) {
			items.push(item);
		}
	}

	return items;
}

export async function addItem(type: ItemType, id: string, amount: number): Promise<void> {
	switch (type) {
		case ItemType.INSTRUMENT: {
			const instrument = await InstrumentModel.findById(id);
			if (!instrument) {
				return;
			}
			instrument.amount += amount;
			await instrument.save();
			return;
		}
		case ItemType.FURNITURE: {
			const furniture = await FurnitureModel.findById(id);
			if (!furniture) {
				return;
			}
			furniture.amount += amount;
			await furniture.save();
			return;
		}
		case ItemType.CONSUMABLE: {
			const consumable = await ConsumableModel.findById(id);
			if (!consumable) {
				return;
			}
			consumable.amount += amount;
			await consumable.save();
			return;
		}
	}
}

export async function reduceItem(type: ItemType, id: string, amount: number): Promise<void> {
	switch (type) {
		case ItemType.INSTRUMENT: {
			const instrument = await InstrumentModel.findById(id);
			if (!instrument) {
				return;
			}
			instrument.amount -= amount;
			instrument.amount = instrument.amount < 0 ? 0 : instrument.amount;
			await instrument.save();
			return;
		}
		case ItemType.FURNITURE: {
			const furniture = await FurnitureModel.findById(id);
			if (!furniture) {
				return;
			}
			furniture.amount -= amount;
			furniture.amount = furniture.amount < 0 ? 0 : furniture.amount;
			await furniture.save();
			return;
		}
		case ItemType.CONSUMABLE: {
			const consumable = await ConsumableModel.findById(id);
			if (!consumable) {
				return;
			}
			consumable.amount -= amount;
			consumable.amount = consumable.amount < 0 ? 0 : consumable.amount;
			await consumable.save();
			return;
		}
	}
}
