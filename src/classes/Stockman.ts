import Role from './Role';

class Stockman extends Role {
	// Public
	public confirmGettingInstrument(chatId: number, instruments: Map<number, number>): void {
		/*
		 * If confirmed, create request id and
		 * write this request to database
		 */
	}

	public confirmGettingFurniture(chatId: number, furniture: Map<number, number>): void {
		/*
		 * If confirmed, create request id and
		 * write this request to database
		 */
	}

	public confirmGettingConsumable(chatId: number, consumables: Map<number, number>): void {
		/*
		 * If confirmed, create request id and
		 * write this request to database
		 */
	}

	public confirmReturnInstrument(requestId: number): void {
		//...
	}

	public confirmReturnFurniture(chatId: number, furniture: Map<number, number>): void {
		//...
	}

	public confirmRemovingInstrument(chatId: number, instruments: Map<number, number>): void {
		//...
	}

	public confirmReceipt(items: Map<number, number>): void {
		//...
	}
}
