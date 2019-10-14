export default abstract class Item {
	// Private
	private id: number;
	private photo: string;
	private name: string;
	private amount: number;

	// Public
	constructor(photo: string, name: string, amount: number) {
		this.photo = photo;
		this.name = name;
		this.amount = amount;
	}

	// Getters
	public getId(): number {
		return this.id;
	}

	public getPhoto(): string {
		return this.photo;
	}

	public getName(): string {
		return this.name;
	}

	public getAmount(): number {
		return this.amount;
	}
}
