import Person from './Person';
import PersonType from '../enums/PersonType';

export default class Supplier extends Person {
	/**
	 * @param {string} purchase - text with items to
	 * buy (with their prices and amount)
	 * @desc Request purchase, it's sent to admin
	 */
	public static requestPurchase(purchase: string): void {
		//...
	}

	/**
	 * @param {Map<number, number>} items - pairs (id - amount) to
	 * supply to the stock
	 * @desc Supply purchased items to stock, it's
	 * sent to Stockman
	 */
	public static requestSupply(items: Map<number, number>): void {}

	/**
	 * @desc Add new instrument to the database
	 */
	public static addInstrument(id: number, photo: string, name: string): void {
		//..
	}

	/**
	 * @desc Add new furniture to the database
	 */
	public static addFurniture(id: number, photo: string, name: string): void {
		//..
	}

	/**
	 * @desc Add new consumable to the database
	 */
	public static addConsumable(id: number, photo: string, name: string): void {
		//..
	}
}
