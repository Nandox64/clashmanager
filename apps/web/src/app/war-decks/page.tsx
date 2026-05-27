import { WarDecksClient } from "./war-decks-client";

export const metadata = {
  title: "Mazos de Guerra | Clash Manager",
  description: "Genera mazos óptimos para guerra de clanes con IA",
};

export default function WarDecksPage() {
  return <WarDecksClient />;
}
