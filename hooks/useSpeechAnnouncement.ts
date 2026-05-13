"use client";

import { useCallback } from "react";

export function useSpeechAnnouncement() {
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) {
      console.warn("Speech synthesis qo‘llab-quvvatlanmaydi.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "uz-UZ"; // yoki "ru-RU", "en-US"
    utterance.rate = 0; // tezlik
    utterance.pitch = 0; // ohang
    synth.cancel(); // oldingi ovozlarni to‘xtatish
    synth.speak(utterance);
  }, []);

  return { speak };
}
