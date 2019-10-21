import ItemType from '../enums/ItemType';
import Cell from '../models/cell';
import Instrument from '../models/instrument';
import Furniture from '../models/furniture';
import Consumable from '../models/consumable';

export async function getCell(type: ItemType, id: string): Promise<string> {
	const cells = await Cell.find({});
	for (const cell of cells) {
		switch (type) {
			case ItemType.INSTRUMENT: {
				if (!cell.instruments) { break; }
				if (cell.instruments.has(id)) {
					return cell.row + cell.col;
				}
			}
			case ItemType.FURNITURE: {
				if (!cell.furniture) { break; }
				if (cell.furniture.has(id)) {
					return cell.row + cell.col;
				}
			}
			case ItemType.CONSUMABLE: {
				if (!cell.consumables) { break; }
				if (cell.consumables.has(id)) {
					return cell.row + cell.col;
				}
			}
		}
	}
	return null;
}