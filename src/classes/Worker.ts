import Person from './Person';
import PersonType from '../enums/PersonType';
import { getChatId } from '../helpers/functions';
import { getStockmans } from '../helpers/persons';

type ItemRequested = { type: PersonType; id: string; amount: number };

export default class Worker extends Person {
	// Private
	private static getGettingMessage(username: string, items: ItemRequested[]): string {
		let message = 'Пользователь @${username} хочет получить следующие инструменты:\n';
		items.forEach((item) => {
			const { id, amount } = item;
			message += `${id} -> ${amount} шт.\n`;
		});
		return message;
	}

	// Public
	/*
	 * Request getting
	 */
	public static async requestGetting(ctx: any, chatId: number, username: string, items: ItemRequested[]): Promise<void> {
		const stockmans = await getStockmans();
		const message = Worker.getGettingMessage(username, items);
		stockmans.forEach(async (stockman) => {
			const id = await getChatId(stockman.username);
			if (!id) {
				return;
			}
			await ctx.telegram.sendMessage(id, message);
		});
	}

	/*
	 * Confirm
	 */

	/**
	 * @param {string} gettingInfo - JSON с информацией
	 * о получении (тип получения, длительность, объекты
	 * для получения)
	 * @desc После подтверждения создаем новый Request в БД
	 * с его requestId. В зависимости от данных в gettingInfo
	 * заполняем информацию о Request в БД
	 */
	public static confirmReceipt(gettingInfo: string): void {
		//...
	}

	/**
	 * @desc После данного подтверждения возврата инструмента
	 * в БД отмечаем Request как завершенный (инструменты были
	 * возвращены)
	 */
	public static confirmReturnInstrument(requestId: number): void {
		//...
	}

	/**
	 * @desc После данного подтверждения возврата фурнитуры
	 * есть два варианта:
	 *	1.	Можем создать коллекцию Return, в которую будем писать
	 *		возвраты (как инструментов, так и фурнитуры)
	 *	2.	Можем создать новый Request с типом "Возврат", куда
	 *		напишем информацию про возврат именно фурнитуры (т.к.
	 *		про инструменты инфа хранится в первичных Request
	 *		на получение)
	 */
	public static confirmReturnFurniture(requestId: number): void {
		//...
	}

	/*
	 * Request return
	 */

	/**
	 * @desc Запрос на возврат инструмента. Аргументом передаем
	 * requestId для того, чтобы мы могли узнать, к какому запросу
	 * на получения относятся инструменты и отметить этот запрос
	 * как завершенный (инструменты были возвращены)
	 */
	public static requestReturnInstrument(requestId: number): void {
		//...
	}

	/**
	 * @desc Запрос на возврат фурнитуры. Поскольку фурнитура
	 * не обязательна для возврата, то и requestId не передается.
	 * Передаем лишь саму фурнитуру для возврата
	 */
	public static requestReturnFurniture(furniture: Map<number, number>): void {
		//...
	}

	/*
	 * Request removing
	 */

	/**
	 * @desc Запрос на списание инструмента. Первым аргументом передаем
	 * requestId для того, чтобы мы могли узнать, к какому запросу
	 * на получения относятся инструменты (чтобы не требовать их
	 * возвращения в будущем). Вторым аргументом передаем пары с
	 * инструментами и количеством
	 */
	public static requestRemovingInstrument(requestId: number, items: Map<number, number>): void {
		//...
	}
}
