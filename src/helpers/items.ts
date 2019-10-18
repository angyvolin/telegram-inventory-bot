import * as api from 'telegraf';
import ItemType from '../enums/ItemType';
import Instrument from '../classes/Instrument';
import Furniture from '../classes/Furniture';
import Consumable from '../classes/Consumable';
import { IInstrument } from '../models/instrument';
import { IFurniture } from '../models/furniture';
import { IConsumable } from '../models/consumable';

export async function getItem(type: ItemType, id: string): Promise<IInstrument | IFurniture | IConsumable> {
	switch (type) {
		case ItemType.INSTRUMENT: {
			return Instrument.getItem(id);
		}
		case ItemType.FURNITURE: {
			return Furniture.getItem(id);
		}
		case ItemType.CONSUMABLE: {
			return Consumable.getItem(id);
		}
	}
}
