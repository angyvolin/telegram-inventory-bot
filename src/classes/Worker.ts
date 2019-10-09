import Role from './Role';

export default class Worker extends Role {
	// Public
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
}
