import ItemType from '../enums/ItemType';
import Cell, { ICell } from '../models/cell';
import Instrument from '../models/instrument';
import Furniture from '../models/furniture';
import Consumable from '../models/consumable';

export async function addToCell(cellId: string, type: ItemType, id: string, amount: number): Promise<void> {
	const cell = await Cell.findById(cellId);
	if (!cell) { return; }
	switch (type) {
		case ItemType.INSTRUMENT: {
			if (!cell.instruments) { cell.instruments = new Map(); }
			if (cell.instruments.has(id)) {
				const currAmount = cell.instruments.get(id);
				cell.instruments.set(id, currAmount + amount)
			} else {
				cell.instruments.set(id, amount);
			}
			break;
		}
		case ItemType.FURNITURE: {
			if (!cell.furniture) { cell.furniture = new Map(); }
			if (cell.furniture.has(id)) {
				const currAmount = cell.furniture.get(id);
				cell.furniture.set(id, currAmount + amount)
			} else {
				cell.furniture.set(id, amount);
			}
			break;
		}
		case ItemType.CONSUMABLE: {
			if (!cell.consumables) { cell.consumables = new Map(); }
			if (cell.consumables.has(id)) {
				const currAmount = cell.consumables.get(id);
				cell.consumables.set(id, currAmount + amount)
			} else {
				cell.consumables.set(id, amount);
			}
			break;
		}
	}
}

export async function getCell(type: ItemType, id: string): Promise<ICell> {
	const cells = await Cell.find({});
	for (const cell of cells) {
		switch (type) {
			case ItemType.INSTRUMENT: {
				if (!cell.instruments) {
					break;
				}
				if (cell.instruments.has(id)) {
					return cell;
				}
			}
			case ItemType.FURNITURE: {
				if (!cell.furniture) {
					break;
				}
				if (cell.furniture.has(id)) {
					return cell;
				}
			}
			case ItemType.CONSUMABLE: {
				if (!cell.consumables) {
					break;
				}
				if (cell.consumables.has(id)) {
					return cell;
				}
			}
		}
	}
	return null;
}

export async function getCellName(type: ItemType, id: string): Promise<string> {
	const cells = await Cell.find({});
	for (const cell of cells) {
		switch (type) {
			case ItemType.INSTRUMENT: {
				if (!cell.instruments) {
					break;
				}
				if (cell.instruments.has(id)) {
					return cell.row + cell.col;
				}
			}
			case ItemType.FURNITURE: {
				if (!cell.furniture) {
					break;
				}
				if (cell.furniture.has(id)) {
					return cell.row + cell.col;
				}
			}
			case ItemType.CONSUMABLE: {
				if (!cell.consumables) {
					break;
				}
				if (cell.consumables.has(id)) {
					return cell.row + cell.col;
				}
			}
		}
	}
	return null;
}
