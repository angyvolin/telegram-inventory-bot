import Role from './Role';

class Admin extends Role {
	// Public
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

	// ??????????????????????????????????????
	/**
	 * @param {number} chatId - chat id of a person to send the table
	 * @param {string} tableResource - path or link to the table
	 * @desc Send ...
	 */
	public sendList(chatId: number, tableResource: string): void {
		//...
	}
	// ??????????????????????????????????????

	/**
	 * @param {Map<number, number>} items - items to supply
	 * @desc Supply request, it's sent to supplier to purchase
	 */
	public requestSupply(items: Map<number, number>): void {
		//...
	}
}
