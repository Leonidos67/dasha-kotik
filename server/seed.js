import mongoose from 'mongoose';
import { config } from './config.js';
import { Day } from './models/Day.js';
import { Submission } from './models/Submission.js';

function addDays(base, days) {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d;
}

const START = config.startDate;

/** @type {Array<{dayNumber:number,isBonus?:boolean,isFinale?:boolean,title?:string,gift:{title:string,description:string},tasks:Array<{title:string,description?:string,submissionType:string}>}>} */
const DAYS_DATA = [
  {
    dayNumber: 1,
    title: 'День 1 — старт',
    gift: { title: 'секрет', description: 'Лёня запишет тебе голосовое, как только увидит твоё небо.' },
    tasks: [
      { title: 'Сфоткать утреннее небо в Москве', description: 'Прямо сейчас, не из галереи.', submissionType: 'photo' },
      { title: 'Одно слово про сегодня', description: 'Как ты себя чувствуешь — одним словом.', submissionType: 'text' },
      {
        title: 'Начать учить песню «Скучаешь» (NEWLIGHTCHILD)',
        description: 'Послушай трек и начни разбирать слова. Напиши сюда, с чего начала.',
        submissionType: 'text',
      },
    ],
  },
  {
    dayNumber: 2,
    gift: { title: 'Мем дня от Лёни', description: 'Смешная картинка специально для тебя.' },
    tasks: [
      {
        title: 'Выучить песню «Скучаешь» (NEWLIGHTCHILD)',
        description: 'Запиши голосовое, где ты её поёшь, и отправь Лёне в Telegram. Сюда прикрепи то же голосовое.',
        submissionType: 'voice',
      },
      { title: 'Голосовое 15 секунд', description: '«Лёня, скучаю, потому что…»', submissionType: 'voice' },
    ],
  },
  {
    dayNumber: 3,
    gift: { title: 'Плейлист на вечер', description: '5 песен, под которые думать о нас.' },
    tasks: [
      { title: 'Селфи: я на улице, Москва', description: 'Можно смешное.', submissionType: 'photo' },
      { title: 'Сфоткать 11 этаж подъезда', description: 'Со всех ракурсов)', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 4,
    gift: { title: 'Комплимент-расписка', description: 'Цифровая открытка «ты молодец».' },
    tasks: [
      { title: 'Два предмета', description: 'Один напоминает обо мне, другой — о тебе. Фото обоих.', submissionType: 'photo' },
      {
        title: 'Прослушать 3+ песни NEWLIGHTCHILD',
        description: 'Альбом NIGHT FOR EVER — минимум 3 трека. Напиши, какие понравились.',
        submissionType: 'text',
      },
    ],
  },
  {
    dayNumber: 5,
    gift: { title: 'Заказ кофе/чая', description: 'Лёня оплатит доставку в любимое место.' },
    tasks: [
      { title: '10 000 шагов', description: 'Скрин с часов.', submissionType: 'workout' },
    ],
  },
  {
    dayNumber: 6,
    gift: { title: 'Секретное слово дня', description: 'Скажешь — получишь сюрприз в переписке.' },
    tasks: [
      { title: 'Комплимент маме вслух', description: 'Тайно запиши её реакцию на диктофон (5–10 сек).', submissionType: 'voice' },
      { title: 'Сделать маме чай без напоминания', description: 'Фото кружки.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 7,
    gift: { title: 'Фото «мы» в облако', description: 'Лёня пришлёт любимое совместное фото в высоком качестве.' },
    tasks: [
      { title: '3 вещи в Москве', description: 'Которые хотела бы сделать со мной.', submissionType: 'text' },
      { title: 'Купить маме любимую шоколадку', description: 'Фото шоколадки.', submissionType: 'photo' },
      { title: 'Сфоткать свой завтрак', description: 'Подпись: «а ты что ел?»', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 8,
    gift: { title: 'Купон на звонок', description: 'Без лимита по времени — когда захочешь.' },
    tasks: [
      { title: 'Уличная Москва', description: 'Двор, вывеска, угол — что угодно.', submissionType: 'photo' },
      { title: 'Смешная надпись на стене', description: 'Если найдёшь.', submissionType: 'photo' },
      { title: 'Сфоткать фонарь', description: 'Который светит красиво.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 9,
    gift: { title: 'Стикер-пак', description: 'Новые стикеры с котиками и Лёней.' },
    tasks: [
      { title: '10 раз «Я тебя люблю»', description: 'Позвони Лёне. Потом голосовое: «дошла до 10».', submissionType: 'voice' },
      { title: 'Прошептать в телефон', description: '«Ты мой котик» — аудио.', submissionType: 'voice' },
    ],
  },
  {
    dayNumber: 10,
    isBonus: true,
    title: '✨ Бонусный день 10',
    gift: { title: 'Бонус: сертификат', description: 'На массаж, кино или доставку — выберешь сама.' },
    tasks: [
      { title: 'Коллаж из 4 фото', description: 'За первые 9 дней или 4 кадра сегодня: утро / улица / еда / небо.', submissionType: 'photo' },
      { title: '9 дней без Лёни', description: '3 предложения: что ты поняла о себе.', submissionType: 'text' },
      { title: 'Сфоткать тень в полный рост', description: 'Эстетика.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 11,
    gift: { title: 'Видео-подмигивание', description: 'Короткое видео от Лёни.' },
    tasks: [
      { title: 'Папина одежда', description: 'Надеть и прислать фото с подписью: «Зай, у тебя есть конкурент».', submissionType: 'photo' },
      { title: 'Обнять папу', description: 'Сказать «ты классный». Селфи в обнимку.', submissionType: 'photo' },
      { title: 'Погладить папу по голове', description: 'Фото момента (можно сзади).', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 12,
    gift: { title: 'Любимый десерт', description: 'Закажем то, что ты напишешь.' },
    tasks: [
      { title: 'Лёгкий бег 6 минут', description: 'Скрин Apple Watch.', submissionType: 'workout' },
      { title: 'Селфи после', description: '', submissionType: 'photo' },
      { title: 'Голосовое', description: '«Я не хочу, но делаю ради зайки».', submissionType: 'voice' },
    ],
  },
  {
    dayNumber: 13,
    gift: { title: 'Рецепт от Лёни', description: 'Блюдо, которое приготовим вместе в Сочи.' },
    tasks: [
      { title: 'Завтрак или кофе', description: 'Фото + текст: чего не хватает, чтобы было «как в Сочи».', submissionType: 'photo' },
      { title: 'Кружка с надписью', description: 'Сфоткать.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 14,
    gift: { title: 'Аудиокнига/подкаст', description: 'Одна серия на твой вкус.' },
    tasks: [
      { title: 'Смешной момент дня', description: 'Голосовое 30 секунд.', submissionType: 'voice' },
      { title: 'Записать мамин смех', description: 'На диктофон.', submissionType: 'voice' },
      { title: 'Смешное лицо', description: 'Селфи без стеснения.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 15,
    gift: { title: 'Обещание свидания', description: 'Один пункт из списка «сделаем в Сочи» — на выбор.' },
    tasks: [
      { title: 'Место, где хочется обнять Лёню', description: 'Сфоткать.', submissionType: 'photo' },
      { title: 'Сердечко на запотевшем окне', description: 'Фото.', submissionType: 'photo' },
      { title: 'Написать «Лёня» на зеркале', description: 'Помадой или пальцем — фото.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 16,
    gift: { title: 'Песня дня', description: 'Трек, который ассоциируется с тобой.' },
    tasks: [
      { title: '25 раз «Я тебя люблю»', description: 'Позвони. Голосовое после: «сделала, устала».', submissionType: 'voice' },
      { title: 'Рука с именем Лёня', description: 'Написать ручкой на ладони — фото.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 17,
    gift: { title: 'Фото в рамке', description: 'Распечатаем наше фото для твоей комнаты.' },
    tasks: [
      { title: 'Бег 8 минут', description: 'Скрин Watch.', submissionType: 'workout' },
      { title: 'Зарядка 10 минут', description: 'Скрин из Fitness.', submissionType: 'workout' },
      { title: 'Селфи «я выжила»', description: '', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 18,
    gift: { title: 'Утреннее SMS-стихотворение', description: 'Лёня напишет 4 строки.' },
    tasks: [
      { title: '3 комплимента себе', description: 'Текстом.', submissionType: 'text' },
      { title: 'Глаза крупным планом', description: 'Фото.', submissionType: 'photo' },
      { title: 'Улыбка — только зубы', description: 'Фото.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 19,
    gift: { title: 'Магнит/открытка', description: 'Привезём в Сочи или отправим.' },
    tasks: [
      { title: 'Московское и домашнее', description: 'Два фото: улица и что-то дома (кухня, плед, кот).', submissionType: 'photo' },
      { title: 'Родители у телевизора', description: 'Сфоткать момент (если ок).', submissionType: 'photo' },
      { title: 'Кот во дворе', description: 'Или собака — кто попадётся.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 20,
    isBonus: true,
    title: '✨ Бонусный день 20 — квест',
    gift: { title: 'Бонус-сюрприз', description: 'Посылка или цифровой подарок — Лёня решит по твоим ответам.' },
    tasks: [
      { title: 'Квест: 5 пунктов', description: '1) Предмет с запахом дома 2) Смешной предмет папы 3) Чай/вода — ритуал 4) 20 приседаний 5) Листок «Лёня + Даша». Пришли 1–3 фото + текст что сделала.', submissionType: 'photo' },
      { title: 'Граффити или красивый балкон', description: 'Сфоткаться рядом или просто кадр.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 21,
    gift: { title: 'Голосовое «скучаю по…»', description: 'Лёня ответит тем же.' },
    tasks: [
      { title: 'Что скучаешь конкретно', description: 'Голосовое 45 сек: запах, голос, привычка.', submissionType: 'voice' },
      { title: 'Футболка Лёни под подушкой', description: 'Фото на ночь.', submissionType: 'photo' },
      { title: 'Погладить мою вещь', description: 'Аудио «скучаю».', submissionType: 'voice' },
    ],
  },
  {
    dayNumber: 22,
    gift: { title: 'Новые кроссовки/носочки', description: 'Маленький спорт-подарок.' },
    tasks: [
      { title: 'Пробежать 1 км', description: 'Скрин с пульсом.', submissionType: 'workout' },
      { title: 'Фото кроссовок', description: 'После пробежки.', submissionType: 'photo' },
      { title: 'Грязные кроссовки честно', description: 'Смешное фото.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 23,
    gift: { title: 'Закат вместе (позже)', description: 'Встретим закат в Сочи — обещание.' },
    tasks: [
      { title: 'Закат в Москве', description: 'Фото неба.', submissionType: 'photo' },
      { title: 'Первая звезда', description: 'Если видно — фото.', submissionType: 'photo' },
      { title: 'Луна через окно', description: '', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 24,
    gift: { title: 'Совместный фильм', description: 'Смотрим в одно время в разных городах.' },
    tasks: [
      { title: 'Помочь маме', description: 'Чай, дом, стол — фото результата.', submissionType: 'photo' },
      { title: 'Убраться в комнате без просьбы', description: 'Фото до/после или «после».', submissionType: 'photo' },
      { title: 'Накрыть на стол для родителей', description: 'Фото.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 25,
    gift: { title: 'Большой комплимент-письмо', description: 'Текст от Лёни на страницу.' },
    tasks: [
      { title: '67 раз «Я тебя люблю»', description: 'Позвони Лёне (можно частями). Голосовое: «сделала».', submissionType: 'voice' },
      { title: 'Маме: «ты красивая сегодня»', description: 'Запись реакции.', submissionType: 'voice' },
      { title: 'Обнять маму 10 секунд', description: 'Селфи в обнимку.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 26,
    gift: { title: 'Купон «день королевы»', description: 'В Сочи — всё по твоему списку.' },
    tasks: [
      { title: '3 вещи в Москве со мной', description: 'Сделала там — хотела бы со мной.', submissionType: 'text' },
      { title: 'Магнит с Москвой', description: 'Купить и сфоткать.', submissionType: 'photo' },
      { title: 'Книга, которую читаешь', description: 'Фото.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 27,
    gift: { title: 'Массаж ног', description: 'В Сочи — обещание Лёни.' },
    tasks: [
      { title: 'Бег 12+ минут', description: 'Скрин тренировки.', submissionType: 'workout' },
      { title: '«Я злюсь, но бегу ради тебя»', description: 'Голосовое.', submissionType: 'voice' },
      { title: 'Селфи мокрых волос + фото тренировки', description: 'Два кадра — можно два раза нажать кнопку или одно фото коллажем.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 28,
    gift: { title: 'Сюрприз-фотоотчёт', description: 'Лёня соберёт альбом из твоих лучших отчётов.' },
    tasks: [
      { title: 'Видео прогулки 15 сек', description: 'Без монтажа.', submissionType: 'video' },
      { title: 'Пробежать 2 км', description: 'Скрин тренировки (если готова — иначе 15 мин быстрый шаг).', submissionType: 'workout' },
      { title: 'Надеть что-то зелёное', description: 'Любимый цвет Лёни — фото.', submissionType: 'photo' },
    ],
  },
  {
    dayNumber: 29,
    gift: { title: 'Письмо в конверте', description: 'Настоящее письмо при встрече.' },
    tasks: [
      { title: 'Письмо Лёне', description: 'Минимум 5 предложений — только сюда, не в мессенджер.', submissionType: 'text' },
      { title: 'Строчка нашей песни', description: 'Спой и запиши голосом.', submissionType: 'voice' },
      { title: 'Сказать фразу Лёни', description: '«Ну что там у нас» — короткое видео.', submissionType: 'video' },
    ],
  },
  {
    dayNumber: 30,
    isBonus: true,
    title: '✨ Бонусный день 30 — итоги',
    gift: { title: 'Главный бонус-подарок', description: 'То, о чём мечтала — обсудите вместе.' },
    tasks: [
      { title: 'Топ-5 моментов месяца', description: 'Списком в тексте.', submissionType: 'text' },
      { title: 'Топ-5 «хочу с Лёней»', description: 'Списком.', submissionType: 'text' },
      { title: 'Фото «я через месяц»', description: 'Селфи — живая, настоящая.', submissionType: 'photo' },
      { title: 'Честное голосовое', description: '«Я устала и злюсь» — если есть. Или «я горжусь собой».', submissionType: 'voice' },
    ],
  },
  {
    dayNumber: 31,
    isFinale: true,
    title: '💋 Финал — ты в Сочи!',
    gift: { title: 'Главный подарок + встреча', description: 'Сам Лёня. И ещё сюрприз, который он приготовил.' },
    tasks: [
      { title: 'Поцеловать Лёню', description: 'Главное задание дня. В Сочи, по-настоящему. Потом отметь здесь — можно селфи вдвоём.', submissionType: 'photo' },
      { title: '«Спасибо, зай, я прошла месяц»', description: 'Голосовое.', submissionType: 'voice' },
      { title: 'Селфи: последний день заданий', description: '', submissionType: 'photo' },
    ],
  },
];

async function seed() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB');

  await Submission.deleteMany({});
  await Day.deleteMany({});

  for (const d of DAYS_DATA) {
    const tasks = d.tasks.map((t, i) => ({ ...t, order: i }));
    await Day.create({
      dayNumber: d.dayNumber,
      date: addDays(START, d.dayNumber - 1),
      isBonus: !!d.isBonus,
      isFinale: !!d.isFinale,
      title: d.title || `День ${d.dayNumber}`,
      tasks,
      gift: d.gift,
    });
  }

  console.log(`Seeded ${DAYS_DATA.length} days`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
