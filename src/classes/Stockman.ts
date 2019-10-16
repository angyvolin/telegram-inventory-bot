import Person from './Person';
import PersonType from '../enums/PersonType';

export default class Stockman extends Person {
	/**
	 * Confirm getting
	 * @desc (Для каждой из трех функций ниже)
	 * После подтверждения отправляем уведомление Worker о
	 * возможности получения с кнопкой, с помощью которой он
	 * сможет подтвердить получение. По нажатию на эту кнопку
	 * боту будет отправляться JSON с информацией о получении
	 */
	public static confirmGettingInstrument(username: string, instruments: Map<number, number>): void {
		//...
	}

	public static confirmGettingFurniture(username: string, furniture: Map<number, number>): void {
		//...
	}

	public static confirmGettingConsumable(username: string, consumables: Map<number, number>): void {
		//...
	}

	/**
	 * Confirm return
	 * @desc
	 * Смс Worker с подтверждением о возможности вернуть
	 * инструменты, а также кнопкой для подтверждения
	 * возврата
	 */
	public static confirmReturnInstrument(requestId: number): void {
		//...
	}

	public static confirmReturnFurniture(username: string, furniture: Map<number, number>): void {
		//...
	}

	/**
	 * Confirm removing
	 * @desc Запрос на списание инструмента.
	 * Пересылается Admin на согласование
	 */
	public static confirmRemovingInstrument(username: string, instruments: Map<number, number>): void {
		//...
	}

	/*
	 * Confirm receipt
	 */
	public static confirmReceipt(items: Map<number, number>): void {
		//...
	}
}
