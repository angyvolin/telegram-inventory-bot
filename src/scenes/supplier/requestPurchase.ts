import Supplier from '../../classes/Supplier';
import KeyboardMessage from '../../controllers/keyboards';
import PersonType from '../../enums/PersonType';
import ItemType from '../../enums/ItemType';

const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

/**
 * Сцена запроса получения
 */
const requestPurchase = new Scene('worker/requestPurchase');

export default requestPurchase;