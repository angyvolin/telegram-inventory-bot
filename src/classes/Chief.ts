import Person from './Person';
import PersonType from '../enums/PersonType';

export default class Chief extends Person {
	// Public
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
}
