export default abstract class Role {
	// Private
	private fullName: String; // Real full name
	private name: String; // Telegram name
	private chatId: String; // Telegram chat id

	// Public
	constructor(fullName: String, name: String, chatId: String) {
		this.fullName = fullName;
		this.name = name;
		this.chatId = chatId;
	}

	// Getters
	public getFullName(): String {
		return fullName;
	}

	public getName(): String {
		return name;
	}

	public getChatId(): String {
		return chatId;
	}
}
