import ItemType from '../enums/ItemType';
import Cell, { ICell } from '../models/cell';

export async function getCells(filter = {}) {
	return Cell.find(filter);
}

export async function getCell(type: ItemType, id: string): Promise<ICell> {
	const cells = await getCells();

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
	const cells = await getCells();

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

export async function addToCell(cellId: string, type: ItemType, id: string, amount: number): Promise<void> {
	const cell = await Cell.findById(cellId);
	if (!cell) {
		return;
	}
	switch (type) {
		case ItemType.INSTRUMENT: {
			if (!cell.instruments) {
				cell.instruments = new Map();
			}
			if (cell.instruments.has(id)) {
				const currAmount = cell.instruments.get(id);
				cell.instruments.set(id, currAmount + amount);
			} else {
				cell.instruments.set(id, amount);
			}
			await cell.save();
			break;
		}
		case ItemType.FURNITURE: {
			if (!cell.furniture) {
				cell.furniture = new Map();
			}
			if (cell.furniture.has(id)) {
				const currAmount = cell.furniture.get(id);
				cell.furniture.set(id, currAmount + amount);
			} else {
				cell.furniture.set(id, amount);
			}
			await cell.save();
			break;
		}
		case ItemType.CONSUMABLE: {
			if (!cell.consumables) {
				cell.consumables = new Map();
			}
			if (cell.consumables.has(id)) {
				const currAmount = cell.consumables.get(id);
				cell.consumables.set(id, currAmount + amount);
			} else {
				cell.consumables.set(id, amount);
			}
			await cell.save();
			break;
		}
	}
}

export async function removeFromCell(cellId: string, type: ItemType, id: string): Promise<void> {
	const cell = await Cell.findById(cellId);

	if (cell.instruments) {
		cell.instruments.delete(id);
	} else if (cell.furniture) {
		cell.furniture.delete(id);
	} else if (cell.consumables) {
		cell.consumables.delete(id);
	}
	await cell.save();
}

export async function reduceFromCell(cellId: string, type: ItemType, id: string, amount: number): Promise<void> {
	const cell = await Cell.findById(cellId);
	if (!cell) {
		return;
	}
	switch (type) {
		case ItemType.INSTRUMENT: {
			if (!cell.instruments) {
				return;
			}
			if (cell.instruments.has(id)) {
				const currAmount = cell.instruments.get(id);
				const newAmount = currAmount - amount < 0 ? 0 : currAmount - amount;
				cell.instruments.set(id, newAmount);
				await cell.save();
			}
			break;
		}
		case ItemType.FURNITURE: {
			if (!cell.furniture) {
				return;
			}
			if (cell.furniture.has(id)) {
				const currAmount = cell.furniture.get(id);
				const newAmount = currAmount - amount < 0 ? 0 : currAmount - amount;
				cell.furniture.set(id, newAmount);
				await cell.save();
			}
			break;
		}
		case ItemType.CONSUMABLE: {
			if (!cell.consumables) {
				return;
			}
			if (cell.consumables.has(id)) {
				const currAmount = cell.consumables.get(id);
				const newAmount = currAmount - amount < 0 ? 0 : currAmount - amount;
				cell.consumables.set(id, newAmount);
				await cell.save();
			}
			break;
		}
	}
}
