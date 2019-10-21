import ItemType from '../enums/ItemType';
import Instrument from '../classes/Instrument';
import Furniture from '../classes/Furniture';
import Consumable from '../classes/Consumable';
import InstrumentModel from '../models/instrument';
import FurnitureModel from '../models/furniture';
import ConsumableModel from '../models/consumable';
import { IInstrument } from '../models/instrument';
import { IFurniture } from '../models/furniture';
import { IConsumable } from '../models/consumable';

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
