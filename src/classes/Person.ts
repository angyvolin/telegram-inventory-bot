export enum PersonType {
	WORKER, // 0
	STOCKMAN, // 1
	SUPPLIER, // 2
	CHIEF, // 3
	ADMIN // 4
}

export default abstract class Person {
	// Private
	private fullName: string; // Real full name
	private name: string; // Telegram name
	private username: string; // Telegram username
	private type: PersonType; // Person type

	// Public
	constructor(fullName: string, name: string, username: string, type: PersonType) {
		this.fullName = fullName;
		this.name = name;
		this.username = username;
		this.type = type;
	}

	// Getters
	public getFullName(): string {
		return this.fullName;
	}

	public getName(): string {
		return this.name;
	}

	public getUsername(): string {
		return this.username;
	}

	public getType(): PersonType {
		return this.type;
	}
}
