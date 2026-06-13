export const PAGE_THEMES: Record<string, { background: string; surface: string; border: string; overlay: string }> = {
  "/dashboard": {
    background: "/bg_piso_verde.webp",
    surface: "#285E60D9",
    border: "#285E60CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(40, 94, 96, 0.4) 15%, transparent 35%, transparent 65%, rgba(40, 94, 96, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
  },
  "/achievements": {
    background: "/bg_piso_azul.webp",
    surface: "#003E77D9",
    border: "#003E77CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(0, 62, 119, 0.4) 15%, transparent 35%, transparent 65%, rgba(0, 62, 119, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
  },
  "/war-decks": {
    background: "/bg_piso_morado.webp",
    surface: "#391666D9",
    border: "#391666CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(57, 22, 102, 0.4) 15%, transparent 35%, transparent 65%, rgba(57, 22, 102, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
  },
  "/gifts": {
    background: "/bg_piso_verde.webp",
    surface: "#285E60D9",
    border: "#285E60CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(40, 94, 96, 0.4) 15%, transparent 35%, transparent 65%, rgba(40, 94, 96, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
  },
  "/members": {
    background: "/bg_piso_azul.webp",
    surface: "#003E77D9",
    border: "#003E77CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(0, 62, 119, 0.4) 15%, transparent 35%, transparent 65%, rgba(0, 62, 119, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
  },
  "/analytics": {
    background: "/bg_piso_morado.webp",
    surface: "#391666D9",
    border: "#391666CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(57, 22, 102, 0.4) 15%, transparent 35%, transparent 65%, rgba(57, 22, 102, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
  },
  "/recruitment": {
    background: "/bg_piso_verde.webp",
    surface: "#285E60D9",
    border: "#285E60CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(40, 94, 96, 0.4) 15%, transparent 35%, transparent 65%, rgba(40, 94, 96, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
  },
  "/profile": {
    background: "/bg_piso_azul.webp",
    surface: "#003E77D9",
    border: "#003E77CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(0, 62, 119, 0.4) 15%, transparent 35%, transparent 65%, rgba(0, 62, 119, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
  },
  "/settings": {
    background: "/bg_piso_morado.webp",
    surface: "#391666D9",
    border: "#391666CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(57, 22, 102, 0.4) 15%, transparent 35%, transparent 65%, rgba(57, 22, 102, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
  },
};

export const DEFAULT_PAGE_THEME = PAGE_THEMES["/dashboard"];

export function getPageTheme(pathname: string) {
  const route = Object.keys(PAGE_THEMES).find((href) => pathname.startsWith(href));
  return route ? PAGE_THEMES[route] : DEFAULT_PAGE_THEME;
}
