# Шахматные партии в формате .chessgame

Файлы созданы по партиям, перечисленным в таблицах `ai/games/chess_games.xlsx` (лист «Партии») и `ai/games/chess_tactics_openings.xlsx` (листы «Тактика», «Дебюты», «Без эталонной партии»). Формат файлов описан в [`ai/todo.md`](../../ai/todo.md#структура-хранения-партии); файлы открываются в программе (`main/server/index.html` → «Открыть»).

## Откуда взяты данные

- **Таблицы** дают название партии, место, год и учебное описание («Чему учит» / «Что смотреть», этап, приём или дебют). Ходов в таблицах нет (кроме ловушки в Каро-Канн).
- **Ходы, цвет фигур, дата, турнир и результат** взяты из PGN на страницах [chessgames.com](https://www.chessgames.com) — сайта, на который ссылаются сами таблицы («Ходы сверяйте на chessgames.com или lichess.org»). Ссылка на страницу каждой партии — в таблице ниже.
- Каждый ход проверен движком программы (`main/client/src/chess`): в файл попадает только допустимый ход, и каждый файл повторно читается программой без ошибок.

## Что записано в файле

| Поле | Содержимое |
|---|---|
| `White`, `Black` | фамилии из таблицы (цвет — по PGN) |
| `Place` | «Место» из таблицы |
| `Date` | дата из PGN (`ДД.ММ.ГГГГ`, если известна, иначе год) |
| `Note` | прозвище партии и описания из всех строк таблиц, где она упоминается |
| комментарий к начальной позиции | название, турнир/место/дата/тур/результат из PGN, строки таблиц целиком |
| комментарий к ходу | описание из таблицы, если в нём назван конкретный ход (например «Лxd7»), — прикреплено к этому ходу |
| комментарий к последнему ходу | «Мат.»/«Пат.», если позиция такова, и результат партии из PGN |

Комментарии и варианты из PGN не переносились — только основная линия ходов.

## Партии (27 файлов)

| Файл | Партия | Место, дата | Турнир (PGN) | Результат | Полуходов | Строки таблиц | Источник ходов |
|---|---|---|---|---|---|---|---|
| [`1750-legal-saint-brie.chessgame`](1750-legal-saint-brie.chessgame) | Легаль — Сен-Бри | Париж, 1750 | Odds game | 1-0 | 13 | Партии №1, Тактика №2 | [gid 1251892](https://www.chessgames.com/perl/chessgame?gid=1251892) |
| [`1851-anderssen-kieseritzky.chessgame`](1851-anderssen-kieseritzky.chessgame) | Андерсен — Кизерицкий («Бессмертная партия») | Лондон, 21.06.1851 | Casual game | 1-0 | 45 | Партии №5, Тактика №15, Дебюты №4 | [gid 1018910](https://www.chessgames.com/perl/chessgame?gid=1018910) |
| [`1852-anderssen-dufresne.chessgame`](1852-anderssen-dufresne.chessgame) | Андерсен — Дюфрен («Вечнозелёная партия») | Берлин, 1852 | Casual Game | 1-0 | 40 | Партии №6, Тактика №16 | [gid 1018961](https://www.chessgames.com/perl/chessgame?gid=1018961) |
| [`1853-schulder-boden.chessgame`](1853-schulder-boden.chessgame) | Шульдер — Боден | Лондон, 1853 | London | 0-1 | 30 | Тактика №14 | [gid 1262425](https://www.chessgames.com/perl/chessgame?gid=1262425) |
| [`1858-morphy-duke-karl-isouard.chessgame`](1858-morphy-duke-karl-isouard.chessgame) | Морфи — герцог Брауншвейгский и граф Изуар («Оперная партия») | Париж, 1858 | Paris | 1-0 | 33 | Партии №2, Тактика №1 | [gid 1233404](https://www.chessgames.com/perl/chessgame?gid=1233404) |
| [`1889-lasker-bauer.chessgame`](1889-lasker-bauer.chessgame) | Ласкер — Баурер | Амстердам, 26.08.1889 | Amsterdam, тур 1 | 1-0 | 75 | Тактика №11 | [gid 1026352](https://www.chessgames.com/perl/chessgame?gid=1026352) |
| [`1895-steinitz-bardeleben.chessgame`](1895-steinitz-bardeleben.chessgame) | Стейниц — Барделебен | Гастингс, 17.08.1895 | Hastings, тур 10 | 1-0 | 49 | Партии №7, Тактика №10, Дебюты №1 | [gid 1132699](https://www.chessgames.com/perl/chessgame?gid=1132699) |
| [`1907-rotlewi-rubinstein.chessgame`](1907-rotlewi-rubinstein.chessgame) | Ротлеви — Рубинштейн | Лодзь, 26.12.1907 | Lodz, тур 6 | 0-1 | 50 | Партии №8, Тактика №9 | [gid 1119679](https://www.chessgames.com/perl/chessgame?gid=1119679) |
| [`1910-reti-tartakower.chessgame`](1910-reti-tartakower.chessgame) | Рети — Тартаковер | Вена, 1910 | Vienna | 1-0 | 21 | Партии №3, Тактика №3 | [gid 1250654](https://www.chessgames.com/perl/chessgame?gid=1250654) |
| [`1912-ed-lasker-thomas.chessgame`](1912-ed-lasker-thomas.chessgame) | Эд. Ласкер — Томас | Лондон, 29.10.1912 | Casual game | 1-0 | 35 | Партии №4, Тактика №4 | [gid 1259009](https://www.chessgames.com/perl/chessgame?gid=1259009) |
| [`1912-levitsky-marshall.chessgame`](1912-levitsky-marshall.chessgame) | Левитский — Маршалл | Бреслау, 20.07.1912 | 18th DSB Kongress, тур 6 | 0-1 | 46 | Тактика №8 | [gid 1094915](https://www.chessgames.com/perl/chessgame?gid=1094915) |
| [`1914-bernstein-capablanca.chessgame`](1914-bernstein-capablanca.chessgame) | Бернштейн — Капабланка | Москва, 04.02.1914 | Capablanca-Bernstein Match, тур 1 | 0-1 | 58 | Тактика №5 | [gid 1261680](https://www.chessgames.com/perl/chessgame?gid=1261680) |
| [`1914-nimzowitsch-tarrasch.chessgame`](1914-nimzowitsch-tarrasch.chessgame) | Нимцович — Тарраш | Санкт-Петербург, 28.04.1914 | St. Petersburg, тур 5 | 0-1 | 64 | Тактика №12 | [gid 1102384](https://www.chessgames.com/perl/chessgame?gid=1102384) |
| [`1918-capablanca-marshall.chessgame`](1918-capablanca-marshall.chessgame) | Капабланка — Маршалл | Нью-Йорк, 23.10.1918 | New York, тур 1 | 1-0 | 71 | Дебюты №3 | [gid 1095025](https://www.chessgames.com/perl/chessgame?gid=1095025) |
| [`1920-adams-torre.chessgame`](1920-adams-torre.chessgame) | Адамс — Торре | Новый Орлеан, 1920 | New Orleans | 1-0 | 45 | Тактика №6 | [gid 1143989](https://www.chessgames.com/perl/chessgame?gid=1143989) |
| [`1923-saemisch-nimzowitsch.chessgame`](1923-saemisch-nimzowitsch.chessgame) | Земиш — Нимцович («Бессмертная партия цугцванга») | Копенгаген, 09.03.1923 | Copenhagen, тур 6 | 0-1 | 50 | Партии №10 | [gid 1102400](https://www.chessgames.com/perl/chessgame?gid=1102400) |
| [`1924-capablanca-tartakower.chessgame`](1924-capablanca-tartakower.chessgame) | Капабланка — Тартаковер | Нью-Йорк, 23.03.1924 | New York, тур 6 | 1-0 | 103 | Партии №13 | [gid 1102104](https://www.chessgames.com/perl/chessgame?gid=1102104) |
| [`1925-torre-em-lasker.chessgame`](1925-torre-em-lasker.chessgame) | Торре — Эм. Ласкер | Москва, 25.11.1925 | Moscow, тур 12 | 1-0 | 85 | Тактика №7 | [gid 1100063](https://www.chessgames.com/perl/chessgame?gid=1100063) |
| [`1938-botvinnik-capablanca.chessgame`](1938-botvinnik-capablanca.chessgame) | Ботвинник — Капабланка | АВРО, Нидерланды, 22.11.1938 | AVRO, тур 11 | 1-0 | 81 | Партии №14, Дебюты №9 | [gid 1031957](https://www.chessgames.com/perl/chessgame?gid=1031957) |
| [`1956-d-byrne-fischer.chessgame`](1956-d-byrne-fischer.chessgame) | Д. Бирн — Фишер («Партия века») | Нью-Йорк, 17.10.1956 | Third Rosenwald Trophy, тур 8 | 0-1 | 82 | Партии №9, Тактика №13, Дебюты №10 | [gid 1008361](https://www.chessgames.com/perl/chessgame?gid=1008361) |
| [`1963-evans-reshevsky.chessgame`](1963-evans-reshevsky.chessgame) | Эванс — Решевский | —, 29.12.1963 | United States Championship 1963/64, тур 9 | 1/2-1/2 | 99 | Тактика №17 | [gid 1252040](https://www.chessgames.com/perl/chessgame?gid=1252040) |
| [`1972-fischer-spassky-g6.chessgame`](1972-fischer-spassky-g6.chessgame) | Фишер — Спасский | Рейкьявик, 23.07.1972 | Spassky - Fischer World Championship Match, тур 6 | 1-0 | 81 | Партии №11, Дебюты №8 | [gid 1044366](https://www.chessgames.com/perl/chessgame?gid=1044366) |
| [`1974-karpov-unzicker.chessgame`](1974-karpov-unzicker.chessgame) | Карпов — Унцикер | Ницца (олимпиада), 18.06.1974 | Nice Olympiad Final-A, тур 4 | 1-0 | 87 | Партии №12, Дебюты №2 | [gid 1067846](https://www.chessgames.com/perl/chessgame?gid=1067846) |
| [`1985-karpov-kasparov-g16.chessgame`](1985-karpov-kasparov-g16.chessgame) | Карпов — Каспаров | Москва, 15.10.1985 | Karpov - Kasparov World Championship Match, тур 16 | 0-1 | 80 | Дебюты №6 | [gid 1067175](https://www.chessgames.com/perl/chessgame?gid=1067175) |
| [`1991-short-timman.chessgame`](1991-short-timman.chessgame) | Шорт — Тимман | Тилбург, 21.10.1991 | Tilburg Interpolis, тур 4 | 1-0 | 67 | Партии №16 | [gid 1124533](https://www.chessgames.com/perl/chessgame?gid=1124533) |
| [`1999-kasparov-topalov.chessgame`](1999-kasparov-topalov.chessgame) | Каспаров — Топалов | Вейк-ан-Зее, 20.01.1999 | Hoogovens Group A, тур 4 | 1-0 | 87 | Партии №15, Дебюты №7 | [gid 1011478](https://www.chessgames.com/perl/chessgame?gid=1011478) |
| [`trap-caro-kann-smothered-mate.chessgame`](trap-caro-kann-smothered-mate.chessgame) | Спёртый мат: ловушка в Каро-Канн | — | — | мат | 11 | Без эталонной партии | ходы из таблицы |

## Замечания

- **Земиш — Нимцович, 1923.** В таблице партия записана как «Нимцович — Земиш», но по PGN белыми играл Friedrich Saemisch, черными Aron Nimzowitsch (0-1). В файле `White: Земиш`, `Black: Нимцович`.
- **Ласкер — Баурер, 1889.** Фамилия оставлена как в таблице; в PGN черные — Johann Hermann Bauer.
- **Легаль — Сен-Бри, ~1750.** По PGN это партия с форой (`Event: Odds game`): у белых нет ладьи a1 (`FEN rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1NBQKBNR w Kkq - 0 1`). Начальное состояние в файле записано без этой ладьи. Источник в PGN: George Walker, «A Selection of Games at Chess», London 1835, p91.
- **Эд. Ласкер — Томас, 1912.** Последний ход по PGN — `Kd2#`.
- **Адамс — Торре, 1920.** В таблице: «Подлинность партии оспаривается, но как учебный пример она классическая».
- **Ловушка в Каро-Канн** записана по строке таблицы `1.e4 c6 2.d4 d5 3.Кc3 dxe4 4.Кxe4 Кd7 5.Фe2 Кgf6?? 6.Кd6×` (русские буквы фигур переведены в латинские: К→N, Ф→Q). Игроки не указаны.
- Партии, которые встречаются в нескольких листах, сохранены одним файлом; описания из всех листов собраны в `Note` и в комментарий к начальной позиции.

## Что не преобразовано

- «Дебюты» №5 — **«Партии матча Каспаров — Карпов на первенство мира», 1990** (шотландская партия): в таблице не указана конкретная партия, поэтому файл не создан.
- Лист «Без эталонной партии», строки «Тактика по задачам» и «Дебюты по базе» — это списки тем без ходов.
- Лист «Как изучать» (`chess_games.xlsx`) — советы, а не партии.
