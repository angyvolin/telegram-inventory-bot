import Person from './Person';
import { PersonType } from './Person';

export default class Admin extends Person {
	// Public
	constructor(fullName: string, name: string, chatId: number) {
		super(fullName, name, chatId, PersonType.ADMIN);
	}

	public confirmRemovingInstrument(chatId: number, instruments: Map<number, number>): void {
		//...
	}

	public confirmSupply(supply: string): void {
		//...
	}

	public confirmPurchase(purchase: string): void {
		//...
	}

	public getAbsentInstruments(): void {
		//...
	}

	public getDebtors(): void {
		//...
	}

	public getCellContent(cell: string): void {
		//...
	}

	// Worker methods
	public requestGettingInstrument(instruments: Map<number, number>): void {
		//...
	}

	public requestGettingFurniture(furniture: Map<number, number>): void {
		//...
	}

	public requestGettingConsumable(consumables: Map<number, number>): void {
		//...
	}

	public requestReceipt(requestId: number): void {
		//...
	}

	public requestReturnInstrument(requestId: number): void {
		//...
	}

	public requestReturnFurniture(furniture: Map<number, number>): void {
		//...
	}

	public requestRemovingInstrument(items: Map<number, number>): void {
		//...
	}

	// Chief methods
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
