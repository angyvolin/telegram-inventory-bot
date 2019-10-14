import Role from './Role';

export default class Stockman extends Role {
	// Public
	/**
	 * Confirm getting
	 * @desc (Для каждой из трех функций ниже)
	 * После подтверждения отправляем уведомление Worker о
	 * возможности получения с кнопкой, с помощью которой он
	 * сможет подтвердить получение. По нажатию на эту кнопку
	 * боту будет отправляться JSON с информацией о получении
	 */
	public confirmGettingInstrument(chatId: number, instruments: Map<number, number>): void {
		//...
	}

	public confirmGettingFurniture(chatId: number, furniture: Map<number, number>): void {
		//...
	}

	public confirmGettingConsumable(chatId: number, consumables: Map<number, number>): void {
		//...
	}

	/**
	 * Confirm return
	 * @desc 
	 * Смс Worker с подтверждением о возможности вернуть
	 * инструменты, а также кнопкой для подтверждения
	 * возврата
	 */
	public confirmReturnInstrument(requestId: number): void {
		//...
	}

	public confirmReturnFurniture(chatId: number, furniture: Map<number, number>): void {
		//...
	}

	/**
	 * Confirm removing
	 * @desc Запрос на списание инструмента.
	 * Пересылается Admin на согласование
	 */
	public confirmRemovingInstrument(chatId: number, instruments: Map<number, number>): void {
		//...
	}

	/*
	 * Confirm receipt
	 */
	public confirmReceipt(items: Map<number, number>): void {
		//...
	}
}
