// Whatajong — In-Game Assists & Telegram Stars Toolbar
// Created by Snuff (https://snuffdied.xyz)

import { createSignal, onMount } from "solid-js";
import { api, type StoredProfile } from "@/lib/api";
import { tma } from "@/lib/tma";
import { play } from "@/components/audio";
import { getAvailablePairs, selectTile, type TileDb } from "@/lib/game";
import { animate } from "@/state/animationState";
import { type Game } from "@/state/gameState";
import { ShopButton } from "@/components/button";
import { pillClass } from "@/routes/run/runGame.css";
import { StarsShopModal } from "@/components/telegram/StarsShopModal";
import Rand from "rand-seed";
import { shuffle } from "@/lib/rand";

export function AssistsBar(props: { tileDb: TileDb; game: Game }) {
  const [profile, setProfile] = createSignal<StoredProfile | null>(null);
  const [openShop, setOpenShop] = createSignal(false);

  const refreshProfile = async () => {
    const p = await api.auth();
    setProfile(p);
  };

  onMount(() => {
    refreshProfile();
  });

  // 💡 HINT ASSIST
  const handleHint = async () => {
    const prof = profile();
    const hintsCount = prof?.hints ?? 0;

    if (hintsCount <= 0) {
      play("click2");
      setOpenShop(true);
      return;
    }

    const pairs = getAvailablePairs(props.tileDb, props.game);
    if (!pairs || pairs.length === 0) {
      play("shake");
      tma.notification("warning");
      return;
    }

    // Sort by layer Z so higher tiles are prioritized
    pairs.sort((a, b) => b[0]!.z + b[1]!.z - (a[0]!.z + a[1]!.z));
    const targetPair = pairs[0];

    if (targetPair) {
      // Clear any unrelated tile selection first
      const currentSelected = props.tileDb.findBy({ selected: true });
      if (
        currentSelected &&
        currentSelected.id !== targetPair[0].id &&
        currentSelected.id !== targetPair[1].id
      ) {
        props.tileDb.set(currentSelected.id, { ...currentSelected, selected: false });
      }

      // Animate and highlight the matching pair
      animate({ id: targetPair[0].id, name: "jump" });
      animate({ id: targetPair[1].id, name: "jump" });

      // Automatically select first tile
      if (!props.tileDb.get(targetPair[0].id)?.selected) {
        selectTile({ tileDb: props.tileDb, game: props.game, tileId: targetPair[0].id });
      }

      play("gemstone");
      tma.impact("medium");

      // Decrement hint
      if (prof) {
        setProfile({ ...prof, hints: Math.max(0, prof.hints - 1) });
      }
      await api.useHint();
    }
  };

  // 🔀 SHUFFLE ASSIST
  const handleShuffle = async () => {
    const prof = profile();
    const shufflesCount = prof?.shuffles ?? 0;

    if (shufflesCount <= 0) {
      play("click2");
      setOpenShop(true);
      return;
    }

    const alive = props.tileDb.filterBy({ deleted: false });
    if (alive.length < 2) return;

    play("tiles");
    tma.impact("heavy");

    const rng = new Rand();
    const cardIds = alive.map((t) => t.cardId);
    const shuffledCards = shuffle(cardIds, rng);

    alive.forEach((t, i) => {
      props.tileDb.set(t.id, {
        ...t,
        cardId: shuffledCards[i]!,
        selected: false,
      });
      animate({ id: t.id, name: "fall" });
    });

    if (prof) {
      setProfile({ ...prof, shuffles: Math.max(0, prof.shuffles - 1) });
    }
    await api.useShuffle();
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          "align-items": "center",
          gap: "6px",
          background: "rgba(255, 253, 249, 0.88)",
          "backdrop-filter": "blur(8px)",
          padding: "4px 8px",
          "border-radius": "20px",
          border: "1px solid rgba(0, 0, 0, 0.12)",
          "box-shadow": "0 4px 16px rgba(0, 0, 0, 0.15)",
          "z-index": 10,
        }}
      >
        {/* 💡 Hint Button */}
        <ShopButton
          type="button"
          hue="bone"
          style={{
            "font-size": "13px",
            padding: "4px 8px",
            gap: "5px",
          }}
          onPointerDown={handleHint}
          title="Highlight matching pair (Consumes 1 Hint)"
        >
          <span>💡 Hint</span>
          <span
            class={pillClass({ hue: "crack" })}
            style={{
              "font-size": "11px",
              padding: "0 6px",
              "border-radius": "10px",
              "line-height": "1.3",
              display: "inline-block",
            }}
          >
            {profile()?.hints ?? 5}
          </span>
        </ShopButton>

        {/* 🔀 Shuffle Button */}
        <ShopButton
          type="button"
          hue="dot"
          style={{
            "font-size": "13px",
            padding: "4px 8px",
            gap: "5px",
          }}
          onPointerDown={handleShuffle}
          title="Shuffle remaining tiles (Consumes 1 Shuffle)"
        >
          <span>🔀 Shuffle</span>
          <span
            class={pillClass({ hue: "black" })}
            style={{
              "font-size": "11px",
              padding: "0 6px",
              "border-radius": "10px",
              "line-height": "1.3",
              display: "inline-block",
            }}
          >
            {profile()?.shuffles ?? 3}
          </span>
        </ShopButton>

        {/* ⭐ Stars Shop Button */}
        <ShopButton
          type="button"
          hue="bam"
          style={{
            "font-size": "13px",
            padding: "4px 10px",
            gap: "4px",
          }}
          onPointerDown={() => {
            play("click2");
            setOpenShop(true);
          }}
          title="Buy Hints & Shuffles with Telegram Stars"
        >
          <span>⭐ Shop</span>
        </ShopButton>
      </div>

      <StarsShopModal
        open={openShop()}
        onClose={() => setOpenShop(false)}
        onItemPurchased={refreshProfile}
      />
    </>
  );
}
