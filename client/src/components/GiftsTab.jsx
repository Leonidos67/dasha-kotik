import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import HugOverlay from './HugOverlay';
import RedeemCelebration from './RedeemCelebration';
import './GiftsTab.css';

function GiftModal({ gift, onClose, onHug }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal gift-modal ${gift.justUnlocked ? 'gift-modal--fresh' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>🎁 Подарок за день {gift.dayNumber}</h2>
        {gift.unlockedViaCoins && <p className="gift-modal__badge">Получено за монетки</p>}
        <h3 className="gift-modal__title">{gift.gift.title}</h3>
        <p className="gift-modal__desc">{gift.gift.description}</p>
        {gift.isFinale && (
          <p className="gift-modal__finale">Зай, ты прошла весь месяц. Я тебя люблю. 💋</p>
        )}
        <button type="button" className="btn-primary gift-modal__hug-btn" onClick={onHug}>
          Обнять Лёню мысленно
        </button>
      </div>
    </div>
  );
}

export default function GiftsTab({ onUpdate }) {
  const [gifts, setGifts] = useState([]);
  const [coinShop, setCoinShop] = useState(null);
  const [coinsBalance, setCoinsBalance] = useState(0);
  const [open, setOpen] = useState(null);
  const [hugActive, setHugActive] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [shopError, setShopError] = useState('');
  const [pendingGift, setPendingGift] = useState(null);

  const load = useCallback(() => {
    api.gifts().then((r) => {
      setGifts(r.gifts);
      setCoinShop(r.coinShop);
      setCoinsBalance(r.coinsBalance ?? 0);
      onUpdate?.();
    });
  }, [onUpdate]);

  useEffect(() => {
    load();
  }, [load]);

  const openGift = async (gift, extra = {}) => {
    setOpen({ ...gift, ...extra });
    if (!gift.seen) {
      await api.markGiftSeen(gift.dayNumber);
      load();
    }
  };

  const onCelebrationDone = () => {
    setCelebrating(false);
    load();
    if (pendingGift) {
      openGift(pendingGift, { justUnlocked: true });
      setPendingGift(null);
    }
  };

  const redeemDay5 = async () => {
    setShopError('');
    setRedeeming(true);
    try {
      await api.redeemDay5CoinGift();
      setCelebrating(true);
      setPendingGift({
        dayNumber: 5,
        gift: coinShop?.gift,
        unlockedViaCoins: true,
        seen: false,
        isFinale: false,
        isBonus: false,
      });
    } catch (e) {
      setShopError(e.message);
    } finally {
      setRedeeming(false);
    }
  };

  const startHug = () => setHugActive(true);

  const finishHug = () => {
    setHugActive(false);
    setOpen(null);
  };

  const showDay5Shop = coinShop && !coinShop.redeemed;

  return (
    <>
      {celebrating && <RedeemCelebration onDone={onCelebrationDone} />}
      {hugActive && <HugOverlay onComplete={finishHug} />}

      {showDay5Shop && (
        <div
          className={`gift-card coin-shop-card ${coinShop.canRedeem ? 'coin-shop-card--active' : 'coin-shop-card--locked'}`}
        >
          <h3>🪙 {coinShop.title}</h3>
          <p className="coin-shop-card__meta">
            У тебя {coinsBalance} из {coinShop.cost} монет
          </p>
          {coinShop.gift && <p className="coin-shop-card__gift-title">{coinShop.gift.title}</p>}
          {shopError && <p className="error coin-shop-card__error">{shopError}</p>}
          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: '1rem', width: '100%' }}
            disabled={!coinShop.canRedeem || redeeming}
            onClick={redeemDay5}
          >
            {redeeming
              ? 'Забираю…'
              : coinShop.canRedeem
                ? `Получить за ${coinShop.cost} монет`
                : `Нужно ещё ${coinShop.cost - coinsBalance} монет`}
          </button>
        </div>
      )}

      {gifts.length === 0 && !showDay5Shop ? (
        <div className="waiting-day">
          <div className="big">🎁</div>
          <p>Пока нет открытых подарков.</p>
          <p className="waiting-day__hint">
            Собери 10 монеток за одобренные задания (дни 1–5) и обменяй их на подарок.
          </p>
        </div>
      ) : (
        gifts.map((g) => (
          <div
            key={g.dayNumber}
            className={`gift-card ${!g.seen ? 'new' : ''}`}
            onClick={() => openGift(g)}
            onKeyDown={(e) => e.key === 'Enter' && openGift(g)}
            role="button"
            tabIndex={0}
          >
            <h3>
              День {g.dayNumber}
              {g.unlockedViaCoins && ' · за монетки'}
              {!g.seen && ' · НОВЫЙ'}
            </h3>
            <p>{g.gift.title}</p>
          </div>
        ))
      )}

      {open && !hugActive && <GiftModal gift={open} onClose={() => setOpen(null)} onHug={startHug} />}
    </>
  );
}
