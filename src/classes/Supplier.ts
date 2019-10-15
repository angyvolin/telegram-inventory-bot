import Person from './Person';
import { PersonType } from './Person';

export default class Supplier extends Person {
	// Public
	constructor(fullName: string, name: string, username: string) {
		super(fullName, name, username, PersonType.SUPPLIER);
	}

	/**
	 * @param {string} purchase - text with items to
	 * buy (with their prices and amount)
	 * @desc Request purchase, it's sent to admin
	 */
	public requestPurchase(purchase: string): void {
		//...
	}

	/**
	 * @param {Map<number, number>} items - pairs (id - amount) to
	 * supply to the stock
	 * @desc Supply purchased items to stock, it's
	 * sent to Stockman
	 */
	public requestSupply(items: Map<number, number>): void {}
}
