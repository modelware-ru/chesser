# Шахматные партии в формате .chessgame

Файлы созданы по партиям, перечисленным в таблицах `ai/games/chess_games.xlsx` (лист «Партии») и `ai/games/chess_tactics_openings.xlsx` (листы «Тактика», «Дебюты», «Без эталонной партии»). Формат файлов описан в [`ai/todo.md`](../../ai/todo.md#структура-хранения-партии); файлы открываются в программе (`main/server/www/index.html` → «Открыть»).

## Откуда взяты данные

- **Таблицы** дают название партии, место, год и учебное описание («Чему учит» / «Что смотреть», этап, приём или дебют). Ходов в таблицах нет (кроме ловушки в Каро-Канн).
- **Ходы, цвет фигур, дата, турнир и результат** взяты из PGN на страницах [chessgames.com](https://www.chessgames.com) — сайта, на который ссылаются сами таблицы («Ходы сверяйте на chessgames.com или lichess.org»). Ссылка на страницу каждой партии — в таблице ниже.
- Каждый ход проверен движком программы (`main/client/src/chess`): в файл попадает только допустимый ход, и каждый файл повторно читается программой без ошибок.

## Объяснения к ходам

К **каждому** ходу приложен комментарий. Он собирается из следующих частей (в таком порядке):

1. **Описание из таблиц** — если в «Чему учит» / «Что смотреть» назван этот ход (например «Лxd7»).
2. **Википедия** — комментарии к ходам из статей о партии. Из русской Википедии — дословные цитаты; из английской — перевод на русский. Перед каждым таким комментарием указана статья; ссылки на статьи — в таблице ниже. Комментарий из статьи прикрепляется к ходу, только если все ходы, которые статья комментирует, совпали с ходами партии (по фигуре и полю); варианты, которых не было в партии, отбрасываются.
3. **Описание хода по позиции** — вычисляется движком программы: какая фигура куда пошла и что взяла, рокировка, превращение, взятие на проходе; шах, вскрытый и двойной шах, мат и пат; развитие фигуры и занятие центра в дебюте; нападение на более ценную или незащищённую фигуру, двойной удар; может ли соперник по правилам взять пошедшую фигуру; изменение материала (пешка = 1, конь и слон = 3, ладья = 5, ферзь = 9).
4. **Анализ Stockfish 19** (npm-пакет `stockfish`, глубина 18, три лучших варианта в каждой позиции):
   - оценка хода по потере относительно лучшего хода: «Лучший ход» (≤ 0,1 пешки), «Хороший ход» (≤ 0,3), «Неточность» (≤ 0,8), «Ошибка» (≤ 2), «Грубая ошибка» (> 2); «Единственный сильный ход» — если следующий по силе вариант хуже на 2 пешки и более; в выигранной позиции не сильнейший ход отмечается как «позиция остаётся выигранной»;
   - для неточностей и ошибок — сильнейшее продолжение с вариантом;
   - «Это жертва…» — если отданная фигура стоит дороже полученного, а движок одобряет ход;
   - «Угроза: …» — что сыграла бы сторона, сделавшая ход, если бы ход снова был за ней (анализ «нулевого хода», глубина 12), если это взятие, шах или мат и оценка улучшается не менее чем на 1,5 пешки;
   - «Соперник угрожал …» — такая же угроза соперника перед ходом, если сделанный ход её нейтрализует;
   - оценка позиции после хода: «+» — в пользу белых, «−» — в пользу чёрных, в пешках; либо «мат в N ходов».

Описание по позиции и анализ движка — вычисленные данные, а не авторские комментарии; авторские — только из Википедии и таблиц.

## Что записано в файле

| Поле | Содержимое |
|---|---|
| `White`, `Black` | фамилии из таблицы (цвет — по PGN) |
| `Place` | «Место» из таблицы |
| `Date` | дата из PGN (`ДД.ММ.ГГГГ`, если известна, иначе год) |
| `Note` | прозвище партии и описания из всех строк таблиц, где она упоминается |
| комментарий к начальной позиции | название, турнир/место/дата/тур/результат из PGN, строки таблиц целиком, пояснение к комментариям |
| комментарий к каждому ходу | объяснение хода — см. раздел «Объяснения к ходам» |
| комментарий к последнему ходу | объяснение хода и результат партии из PGN |

Из PGN берётся только основная линия ходов (комментариев в PGN chessgames.com нет).

## Партии (27 файлов)

| Файл | Партия | Место, дата | Турнир (PGN) | Результат | Полуходов | Строки таблиц | Источник ходов | Комментарии Википедии |
|---|---|---|---|---|---|---|---|---|
| [`1750-legal-saint-brie.chessgame`](1750-legal-saint-brie.chessgame) | Легаль — Сен-Бри | Париж, 1750 | Odds game | 1-0 | 13 | Партии №1, Тактика №2 | [gid 1251892](https://www.chessgames.com/perl/chessgame?gid=1251892) | 3: [Мат Легаля](https://ru.wikipedia.org/wiki/%D0%9C%D0%B0%D1%82_%D0%9B%D0%B5%D0%B3%D0%B0%D0%BB%D1%8F) |
| [`1851-anderssen-kieseritzky.chessgame`](1851-anderssen-kieseritzky.chessgame) | Андерсен — Кизерицкий («Бессмертная партия») | Лондон, 21.06.1851 | Casual game | 1-0 | 45 | Партии №5, Тактика №15, Дебюты №4 | [gid 1018910](https://www.chessgames.com/perl/chessgame?gid=1018910) | 26: [Бессмертная партия](https://ru.wikipedia.org/wiki/%D0%91%D0%B5%D1%81%D1%81%D0%BC%D0%B5%D1%80%D1%82%D0%BD%D0%B0%D1%8F_%D0%BF%D0%B0%D1%80%D1%82%D0%B8%D1%8F); [Immortal Game](https://en.wikipedia.org/wiki/Immortal_Game) |
| [`1852-anderssen-dufresne.chessgame`](1852-anderssen-dufresne.chessgame) | Андерсен — Дюфрен («Вечнозелёная партия») | Берлин, 1852 | Casual Game | 1-0 | 47 | Партии №6, Тактика №16 | [gid 1018961](https://www.chessgames.com/perl/chessgame?gid=1018961) | 22: [Неувядаемая партия](https://ru.wikipedia.org/wiki/%D0%9D%D0%B5%D1%83%D0%B2%D1%8F%D0%B4%D0%B0%D0%B5%D0%BC%D0%B0%D1%8F_%D0%BF%D0%B0%D1%80%D1%82%D0%B8%D1%8F); [Evergreen Game](https://en.wikipedia.org/wiki/Evergreen_Game) |
| [`1853-schulder-boden.chessgame`](1853-schulder-boden.chessgame) | Шульдер — Боден | Лондон, 1853 | London | 0-1 | 30 | Тактика №14 | [gid 1262425](https://www.chessgames.com/perl/chessgame?gid=1262425) | 4: [Boden's Mate](https://en.wikipedia.org/wiki/Boden%27s_Mate) |
| [`1858-morphy-duke-karl-isouard.chessgame`](1858-morphy-duke-karl-isouard.chessgame) | Морфи — герцог Брауншвейгский и граф Изуар («Оперная партия») | Париж, 1858 | Paris | 1-0 | 33 | Партии №2, Тактика №1 | [gid 1233404](https://www.chessgames.com/perl/chessgame?gid=1233404) | 22: [Оперная партия Морфи](https://ru.wikipedia.org/wiki/%D0%9E%D0%BF%D0%B5%D1%80%D0%BD%D0%B0%D1%8F_%D0%BF%D0%B0%D1%80%D1%82%D0%B8%D1%8F_%D0%9C%D0%BE%D1%80%D1%84%D0%B8); [Opera Game](https://en.wikipedia.org/wiki/Opera_Game) |
| [`1889-lasker-bauer.chessgame`](1889-lasker-bauer.chessgame) | Ласкер — Баурер | Амстердам, 26.08.1889 | Amsterdam, тур 1 | 1-0 | 75 | Тактика №11 | [gid 1026352](https://www.chessgames.com/perl/chessgame?gid=1026352) | 5: [Lasker versus Bauer, Amsterdam, 1889](https://en.wikipedia.org/wiki/Lasker_versus_Bauer%2C_Amsterdam%2C_1889) |
| [`1895-steinitz-bardeleben.chessgame`](1895-steinitz-bardeleben.chessgame) | Стейниц — Барделебен | Гастингс, 17.08.1895 | Hastings, тур 10 | 1-0 | 49 | Партии №7, Тактика №10, Дебюты №1 | [gid 1132699](https://www.chessgames.com/perl/chessgame?gid=1132699) | 2: [Hastings 1895 chess tournament](https://en.wikipedia.org/wiki/Hastings_1895_chess_tournament) |
| [`1907-rotlewi-rubinstein.chessgame`](1907-rotlewi-rubinstein.chessgame) | Ротлеви — Рубинштейн | Лодзь, 26.12.1907 | Lodz, тур 6 | 0-1 | 50 | Партии №8, Тактика №9 | [gid 1119679](https://www.chessgames.com/perl/chessgame?gid=1119679) | 8: [Rotlewi versus Rubinstein](https://en.wikipedia.org/wiki/Rotlewi_versus_Rubinstein) |
| [`1910-reti-tartakower.chessgame`](1910-reti-tartakower.chessgame) | Рети — Тартаковер | Вена, 1910 | Vienna | 1-0 | 21 | Партии №3, Тактика №3 | [gid 1250654](https://www.chessgames.com/perl/chessgame?gid=1250654) | 2: [Double check](https://en.wikipedia.org/wiki/Double_check) |
| [`1912-ed-lasker-thomas.chessgame`](1912-ed-lasker-thomas.chessgame) | Эд. Ласкер — Томас | Лондон, 29.10.1912 | Casual game | 1-0 | 35 | Партии №4, Тактика №4 | [gid 1259009](https://www.chessgames.com/perl/chessgame?gid=1259009) | 1: [King hunt](https://en.wikipedia.org/wiki/King_hunt) |
| [`1912-levitsky-marshall.chessgame`](1912-levitsky-marshall.chessgame) | Левитский — Маршалл | Бреслау, 20.07.1912 | 18th DSB Kongress, тур 6 | 0-1 | 46 | Тактика №8 | [gid 1094915](https://www.chessgames.com/perl/chessgame?gid=1094915) | 12: [Levitsky versus Marshall](https://en.wikipedia.org/wiki/Levitsky_versus_Marshall) |
| [`1914-bernstein-capablanca.chessgame`](1914-bernstein-capablanca.chessgame) | Бернштейн — Капабланка | Москва, 04.02.1914 | Capablanca-Bernstein Match, тур 1 | 0-1 | 58 | Тактика №5 | [gid 1261680](https://www.chessgames.com/perl/chessgame?gid=1261680) | 1: [Back-rank checkmate](https://en.wikipedia.org/wiki/Back-rank_checkmate) |
| [`1914-nimzowitsch-tarrasch.chessgame`](1914-nimzowitsch-tarrasch.chessgame) | Нимцович — Тарраш | Санкт-Петербург, 28.04.1914 | St. Petersburg, тур 5 | 0-1 | 64 | Тактика №12 | [gid 1102384](https://www.chessgames.com/perl/chessgame?gid=1102384) | — |
| [`1918-capablanca-marshall.chessgame`](1918-capablanca-marshall.chessgame) | Капабланка — Маршалл | Нью-Йорк, 23.10.1918 | New York, тур 1 | 1-0 | 71 | Дебюты №3 | [gid 1095025](https://www.chessgames.com/perl/chessgame?gid=1095025) | 5: [Marshall Attack](https://en.wikipedia.org/wiki/Marshall_Attack) |
| [`1920-adams-torre.chessgame`](1920-adams-torre.chessgame) | Адамс — Торре | Новый Орлеан, 1920 | New Orleans | 1-0 | 45 | Тактика №6 | [gid 1143989](https://www.chessgames.com/perl/chessgame?gid=1143989) | 7: [Back-rank checkmate](https://en.wikipedia.org/wiki/Back-rank_checkmate) |
| [`1923-saemisch-nimzowitsch.chessgame`](1923-saemisch-nimzowitsch.chessgame) | Земиш — Нимцович («Бессмертная партия цугцванга») | Копенгаген, 09.03.1923 | Copenhagen, тур 6 | 0-1 | 50 | Партии №10 | [gid 1102400](https://www.chessgames.com/perl/chessgame?gid=1102400) | 8: [Бессмертная партия цугцванга](https://ru.wikipedia.org/wiki/%D0%91%D0%B5%D1%81%D1%81%D0%BC%D0%B5%D1%80%D1%82%D0%BD%D0%B0%D1%8F_%D0%BF%D0%B0%D1%80%D1%82%D0%B8%D1%8F_%D1%86%D1%83%D0%B3%D1%86%D0%B2%D0%B0%D0%BD%D0%B3%D0%B0) |
| [`1924-capablanca-tartakower.chessgame`](1924-capablanca-tartakower.chessgame) | Капабланка — Тартаковер | Нью-Йорк, 23.03.1924 | New York, тур 6 | 1-0 | 103 | Партии №13 | [gid 1102104](https://www.chessgames.com/perl/chessgame?gid=1102104) | — |
| [`1925-torre-em-lasker.chessgame`](1925-torre-em-lasker.chessgame) | Торре — Эм. Ласкер | Москва, 25.11.1925 | Moscow, тур 12 | 1-0 | 85 | Тактика №7 | [gid 1100063](https://www.chessgames.com/perl/chessgame?gid=1100063) | 4: [Windmill (chess)](https://en.wikipedia.org/wiki/Windmill_%28chess%29) |
| [`1938-botvinnik-capablanca.chessgame`](1938-botvinnik-capablanca.chessgame) | Ботвинник — Капабланка | АВРО, Нидерланды, 22.11.1938 | AVRO, тур 11 | 1-0 | 81 | Партии №14, Дебюты №9 | [gid 1031957](https://www.chessgames.com/perl/chessgame?gid=1031957) | 8: [Botvinnik versus Capablanca, AVRO 1938](https://en.wikipedia.org/wiki/Botvinnik_versus_Capablanca%2C_AVRO_1938) |
| [`1956-d-byrne-fischer.chessgame`](1956-d-byrne-fischer.chessgame) | Д. Бирн — Фишер («Партия века») | Нью-Йорк, 17.10.1956 | Third Rosenwald Trophy, тур 8 | 0-1 | 82 | Партии №9, Тактика №13, Дебюты №10 | [gid 1008361](https://www.chessgames.com/perl/chessgame?gid=1008361) | 33: [Партия века](https://ru.wikipedia.org/wiki/%D0%9F%D0%B0%D1%80%D1%82%D0%B8%D1%8F_%D0%B2%D0%B5%D0%BA%D0%B0); [Game of the Century (chess)](https://en.wikipedia.org/wiki/Game_of_the_Century_%28chess%29) |
| [`1963-evans-reshevsky.chessgame`](1963-evans-reshevsky.chessgame) | Эванс — Решевский | —, 29.12.1963 | United States Championship 1963/64, тур 9 | 1/2-1/2 | 99 | Тактика №17 | [gid 1252040](https://www.chessgames.com/perl/chessgame?gid=1252040) | 3: [Swindle (chess)](https://en.wikipedia.org/wiki/Swindle_%28chess%29) |
| [`1972-fischer-spassky-g6.chessgame`](1972-fischer-spassky-g6.chessgame) | Фишер — Спасский | Рейкьявик, 23.07.1972 | Spassky - Fischer World Championship Match, тур 6 | 1-0 | 81 | Партии №11, Дебюты №8 | [gid 1044366](https://www.chessgames.com/perl/chessgame?gid=1044366) | 8: [World Chess Championship 1972](https://en.wikipedia.org/wiki/World_Chess_Championship_1972) |
| [`1974-karpov-unzicker.chessgame`](1974-karpov-unzicker.chessgame) | Карпов — Унцикер | Ницца (олимпиада), 18.06.1974 | Nice Olympiad Final-A, тур 4 | 1-0 | 87 | Партии №12, Дебюты №2 | [gid 1067846](https://www.chessgames.com/perl/chessgame?gid=1067846) | — |
| [`1985-karpov-kasparov-g16.chessgame`](1985-karpov-kasparov-g16.chessgame) | Карпов — Каспаров | Москва, 15.10.1985 | Karpov - Kasparov World Championship Match, тур 16 | 0-1 | 80 | Дебюты №6 | [gid 1067175](https://www.chessgames.com/perl/chessgame?gid=1067175) | 9: [World Chess Championship 1985](https://en.wikipedia.org/wiki/World_Chess_Championship_1985) |
| [`1991-short-timman.chessgame`](1991-short-timman.chessgame) | Шорт — Тимман | Тилбург, 21.10.1991 | Tilburg Interpolis, тур 4 | 1-0 | 67 | Партии №16 | [gid 1124533](https://www.chessgames.com/perl/chessgame?gid=1124533) | 1: [King walk](https://en.wikipedia.org/wiki/King_walk) |
| [`1999-kasparov-topalov.chessgame`](1999-kasparov-topalov.chessgame) | Каспаров — Топалов | Вейк-ан-Зее, 20.01.1999 | Hoogovens Group A, тур 4 | 1-0 | 87 | Партии №15, Дебюты №7 | [gid 1011478](https://www.chessgames.com/perl/chessgame?gid=1011478) | 18: [Бессмертная партия (Каспаров — Топалов)](https://ru.wikipedia.org/wiki/%D0%91%D0%B5%D1%81%D1%81%D0%BC%D0%B5%D1%80%D1%82%D0%BD%D0%B0%D1%8F_%D0%BF%D0%B0%D1%80%D1%82%D0%B8%D1%8F_%28%D0%9A%D0%B0%D1%81%D0%BF%D0%B0%D1%80%D0%BE%D0%B2_%E2%80%94_%D0%A2%D0%BE%D0%BF%D0%B0%D0%BB%D0%BE%D0%B2%29) |
| [`trap-caro-kann-smothered-mate.chessgame`](trap-caro-kann-smothered-mate.chessgame) | Спёртый мат: ловушка в Каро-Канн | — | — | мат | 11 | Без эталонной партии | ходы из таблицы | — |

## Замечания

- **Земиш — Нимцович, 1923.** В таблице партия записана как «Нимцович — Земиш», но по PGN белыми играл Friedrich Saemisch, черными Aron Nimzowitsch (0-1). В файле `White: Земиш`, `Black: Нимцович`.
- **Ласкер — Баурер, 1889.** Фамилия оставлена как в таблице; в PGN черные — Johann Hermann Bauer.
- **Легаль — Сен-Бри, ~1750.** По PGN это партия с форой (`Event: Odds game`): у белых нет ладьи a1 (`FEN rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1NBQKBNR w Kkq - 0 1`). Начальное состояние в файле записано без этой ладьи. Источник в PGN: George Walker, «A Selection of Games at Chess», London 1835, p91.
- **Эд. Ласкер — Томас, 1912.** Последний ход по PGN — `Kd2#`.
- **Андерсен — Дюфрен, 1852.** В PGN chessgames.com запись обрывается после 20...Nxe7 (с пометкой источника «ending given in Schachzeitung, v7 n10, October 1852, p383»). Окончание 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24.Bxe7# добавлено по статьям Википедии «Неувядаемая партия» и «Evergreen Game» и проверено движком программы; в файле об этом сказано в комментарии к ходу 20...Nxe7.
- **Лицензия цитат.** Тексты Википедии распространяются по лицензии CC BY-SA; у каждого комментария указана статья-источник.
- **Адамс — Торре, 1920.** В таблице: «Подлинность партии оспаривается, но как учебный пример она классическая».
- **Ловушка в Каро-Канн** записана по строке таблицы `1.e4 c6 2.d4 d5 3.Кc3 dxe4 4.Кxe4 Кd7 5.Фe2 Кgf6?? 6.Кd6×` (русские буквы фигур переведены в латинские: К→N, Ф→Q). Игроки не указаны.
- Партии, которые встречаются в нескольких листах, сохранены одним файлом; описания из всех листов собраны в `Note` и в комментарий к начальной позиции.

## Что не преобразовано

- «Дебюты» №5 — **«Партии матча Каспаров — Карпов на первенство мира», 1990** (шотландская партия): в таблице не указана конкретная партия, поэтому файл не создан.
- Лист «Без эталонной партии», строки «Тактика по задачам» и «Дебюты по базе» — это списки тем без ходов.
- Лист «Как изучать» (`chess_games.xlsx`) — советы, а не партии.
