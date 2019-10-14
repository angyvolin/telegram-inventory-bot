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
	private chatId: string; // Telegram chat id
	private type: PersonType; // Person type

	// Public
	constructor(fullName: string, name: string, chatId: string, type: PersonType) {
		this.fullName = fullName;
		this.name = name;
		this.chatId = chatId;
		this.type = type;
	}

	// Getters
	public getFullName(): string {
		return this.fullName;
	}

	public getName(): string {
		return this.name;
	}

	public getChatId(): string {
		return this.chatId;
	}

	public getType(): PersonType {
		return this.type;
	}
}
