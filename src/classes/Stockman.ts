import Role from 'Role';

class Stockman {
	// Public
	public confirmRequestInstrument(chatId: number, instruments: Map): void {
		/*
		 * If confirmed, create request id and 
		 * write this request to database
		 */
	}

	public confirmRequestFurniture(chatId: number, furniture: Map): void {
		/*
		 * If confirmed, create request id and 
		 * write this request to database
		 */
	}

	public confirmRequestConsumable(chatId: number, consumables: Map): void {
		/*
		 * If confirmed, create request id and 
		 * write this request to database
		 */
	}

	public confirmReturnInstrument(requestId: number): void {
		//...
	}

	public confirmReturnFurniture(chatId: number, furniture: Map): void {
		//...
	}

	public confirmRemoveInstrument(chatId: number, instruments: Map): void {
		//...
	}

	public confirmReceipt(items: Map): void {
		//...
	}
}
