import Instrument from './Instrument';
import Furniture from './Furniture';
import Consumable from './Consumable';
import { isAdmin } from '../helpers/functions';

export default class Admin {
	// Public
	public static confirmRemovingInstrument(username: string, instruments: Map<number, number>): void {
		//...
	}

	public static confirmSupply(supply: string): void {
		//...
	}

	public static confirmPurchase(purchase: string): void {
		//...
	}

	public static getAbsentInstruments(): void {
		//...
	}

	public static getDebtors(): void {
		//...
	}

	public static getCellContent(cell: string): void {
		//...
	}

	// Worker methods
	public static requestGettingInstrument(instruments: Map<number, number>): void {
		//...
	}

	public static requestGettingFurniture(furniture: Map<number, number>): void {
		//...
	}

	public static requestGettingConsumable(consumables: Map<number, number>): void {
		//...
	}

	public static requestReceipt(requestId: number): void {
		//...
	}

	public static requestReturnInstrument(requestId: number): void {
		//...
	}

	public static requestReturnFurniture(furniture: Map<number, number>): void {
		//...
	}

	public static requestRemovingInstrument(items: Map<number, number>): void {
		//...
	}

	// Chief methods
	/**
	 * @desc Get all items in the stock
	 */
	public static getAllItems(): void {
		//...
	}

	/**
	 * @param {number} chatId - chat id of a person to send the table
	 * @desc Send request to Stockman for getting some items to
	 * a specified Worker
	 */
	public static requestGetting(username: string, items: Map<number, number>): void {
		//...
	}

	/**
	 * @param {string} supply - text with items to supply
	 * @desc Supply request, it's sent to admin for confirmation
	 */
	public static requestSupply(supply: string): void {
		//...
	}

	/**
	 * @desc Add new instrument to the database
	 */
	public static addInstrument(name: string, photoId?: string): void {
		Instrument.add(name, photoId);
	}

	/**
	 * @desc Add new furniture to the database
	 */
	public static addFurniture(name: string, photoId?: string): void {
		Furniture.add(name, photoId);
	}

	/**
	 * @desc Add new consumable to the database
	 */
	public static addConsumable(name: string, photoId?: string): void {
		Consumable.add(name, photoId);
	}
}
