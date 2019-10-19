import ItemType from '../enums/ItemType';
import Instrument from '../classes/Instrument';
import Furniture from '../classes/Furniture';
import Consumable from '../classes/Consumable';
import { IInstrument } from '../models/instrument';
import { IFurniture } from '../models/furniture';
import { IConsumable } from '../models/consumable';

export async function getItem(type: ItemType, id: string): Promise<IInstrument | IFurniture | IConsumable> {
	switch (type) {
		case ItemType.INSTRUMENT:
		case 0:
			return Instrument.getItem(id);
		case ItemType.FURNITURE:
		case 1:
			return Furniture.getItem(id);
		case ItemType.CONSUMABLE:
		case 2:
			return Consumable.getItem(id);
	}
}
