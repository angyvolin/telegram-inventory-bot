import * as api from 'telegraf';
import KeyboardMessage from '../controllers/keyboards';
import PersonType from '../enums/PersonType';
import { isChief } from '../helpers/persons';

export default class ChiefHandlers {
	public static init(bot: api.Telegraf<api.ContextMessageUpdate>) {
		//...
	}
}
