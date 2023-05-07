# Функциональность

Показывает цену и объем торгов (OHLCV) криптовалюты. Пользователь может выбрать:

* биржу
* символ (например, BTC/USDT или BTC/USDT:USDT)
* интервал
* дату и время (в GMT)

Запросы к биржам кэшируются, кэш хранится в базе данных SQLite.

# Запуск

Если необходимо - поменять настройки в src/config.ts.

После этого выполнить:

```
npm install
npm run build
npm start
```

Приложение будет доступно по адресу http://localhost:3010

После изменения EXTRA_INTERVALS необходимо удалить кэш-файл (путь кэш-файла хранится в CACHE_FILE).

# Демо

Рабочее демо запущено на http://pypyrev.com/demo/ForwardToThePast/

Ссылка для людей, не знающих, что вводить в поле "BASE/QUOTE" (символ):
http://pypyrev.com/demo/ForwardToThePast/?exchange=binance&symbol=BTC%2FUSDT&interval=1m&date=2021-11-10&time=14%3A16&show=1

# Возможные улучшения

* показывать цену графически (как в TradingView)
* сделать SPA, серверная часть будет предоставлять только API
* написать тесты
* поддержка интервала 1 неделя
* показ на маленьких экранах
