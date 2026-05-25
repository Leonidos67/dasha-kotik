const COIN_DAY5 = 5;

export function giftForDisplay(giftItem) {
  if (giftItem?.dayNumber === COIN_DAY5 && giftItem?.unlockedViaCoins) {
    return {
      title: 'Сюрприз от Лёни 🎁',
      description:
        'Зай, ты заслужила! Лёня свяжется с тобой и всё устроит — это твой секретный подарок за монетки.',
    };
  }
  return giftItem?.gift;
}
