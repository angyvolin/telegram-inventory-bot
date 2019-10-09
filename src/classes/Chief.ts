import Role from './Role';

export default class Chief extends Role {
	// Public

	/**
	 * @desc Get all items in the stock
	 */
	public getAllItems(): void {
		//...
	}

	/**
	 * @param {number} chatId - chat id of a person to send the table
	 * @desc Send request to Stockman for getting some items to
	 * a specified Worker
	 */
	public requestGetting(chatId: number, items: Map<number, number>): void {
		//...
	}

	/**
	 * @param {string} supply - text with items to supply
	 * @desc Supply request, it's sent to admin for confirmation
	 */
	public requestSupply(supply: string): void {
		//...
	}
}
