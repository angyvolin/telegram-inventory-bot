import Bot from './init/bot';
import DB from './init/db';
import Handlers from './init/handlers';
import Middlewares from './init/middlewares';
import Scenes from './init/scenes';

const main = async () => {
	await DB.connect(); // подключаемся к БД

	const bot = await Bot.configure(); // конфигурируем бот

	Middlewares.init(bot); // инициализируем прослойки
	Scenes.init(bot); // инициализируем сцены
	Handlers.init(bot); // инициализируем обработчики
};

main();
