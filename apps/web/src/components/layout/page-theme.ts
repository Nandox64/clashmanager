export const PAGE_THEMES: Record<string, { background: string; surface: string; surfaceSolid: string; border: string; overlay: string; accent: string; accentShimmer: string }> = {
  "/dashboard": {
    background: "/bg_piso_naranja.webp",
    surface: "#a85808e7",
    surfaceSolid: "#a85808",
    border: "#e28204cc",
    overlay: "linear-gradient(180deg, rgba(29, 16, 2, 0.65) 0%, rgba(176, 94, 14, 0.4) 15%, transparent 35%, transparent 65%, rgba(176, 94, 14, 0.4) 85%, rgba(29, 16, 23, 0.75) 100%)",
    accent: "#ad7f00",
    accentShimmer: "linear-gradient(135deg, #CC6600 0%, #FF8C00 25%, #FFA500 50%, #FF8C00 75%, #CC6600 100%)",
  },
  "/achievements": {
    background: "/bg_piso_azul.webp",
    surface: "#003E77D9",
    surfaceSolid: "#003E77",
    border: "#003E77CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(0, 62, 119, 0.4) 15%, transparent 35%, transparent 65%, rgba(0, 62, 119, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
    accent: "#0088FF",
    accentShimmer: "linear-gradient(135deg, #0055CC 0%, #0088FF 25%, #33AAFF 50%, #0088FF 75%, #0055CC 100%)",
  },
  "/war-decks": {
    background: "/bg_piso_verde.webp",
    surface: "#285E60D9",
    surfaceSolid: "#285E60",
    border: "#285E60CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(40, 94, 96, 0.4) 15%, transparent 35%, transparent 65%, rgba(40, 94, 96, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
    accent: "#00CCAA",
    accentShimmer: "linear-gradient(135deg, #009988 0%, #00CCAA 25%, #33DDCC 50%, #00CCAA 75%, #009988 100%)",
  },
  "/gifts": {
    background: "/bg_piso_morado.webp",
    surface: "#391666D9",
    surfaceSolid: "#391666",
    border: "#391666CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(57, 22, 102, 0.4) 15%, transparent 35%, transparent 65%, rgba(57, 22, 102, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
    accent: "#A855F7",
    accentShimmer: "linear-gradient(135deg, #8B30CC 0%, #A855F7 25%, #C084FC 50%, #A855F7 75%, #8B30CC 100%)",
  },
  "/ruleta": {
    background: "/bg_piso_naranja.webp",
    surface: "#a85808e7",
    surfaceSolid: "#a85808",
    border: "#e28204cc",
    overlay: "linear-gradient(180deg, rgba(29, 16, 2, 0.65) 0%, rgba(176, 94, 14, 0.4) 15%, transparent 35%, transparent 65%, rgba(176, 94, 14, 0.4) 85%, rgba(29, 16, 23, 0.75) 100%)",
    accent: "#ad7f00",
    accentShimmer: "linear-gradient(135deg, #CC6600 0%, #FF8C00 25%, #FFA500 50%, #FF8C00 75%, #CC6600 100%)",
  },
  "/members": {
    background: "/bg_piso_azul.webp",
    surface: "#003E77D9",
    surfaceSolid: "#003E77",
    border: "#003E77CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(0, 62, 119, 0.4) 15%, transparent 35%, transparent 65%, rgba(0, 62, 119, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
    accent: "#0088FF",
    accentShimmer: "linear-gradient(135deg, #0055CC 0%, #0088FF 25%, #33AAFF 50%, #0088FF 75%, #0055CC 100%)",
  },
  "/analytics": {
    background: "/bg_piso_verde.webp",
    surface: "#285E60D9",
    surfaceSolid: "#285E60",
    border: "#285E60CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(40, 94, 96, 0.4) 15%, transparent 35%, transparent 65%, rgba(40, 94, 96, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
    accent: "#00CCAA",
    accentShimmer: "linear-gradient(135deg, #009988 0%, #00CCAA 25%, #33DDCC 50%, #00CCAA 75%, #009988 100%)",
  },
  "/profile": {
    background: "/bg_piso_morado.webp",
    surface: "#391666D9",
    surfaceSolid: "#391666",
    border: "#391666CC",
    overlay: "linear-gradient(180deg, rgba(13, 17, 23, 0.65) 0%, rgba(57, 22, 102, 0.4) 15%, transparent 35%, transparent 65%, rgba(57, 22, 102, 0.4) 85%, rgba(13, 17, 23, 0.75) 100%)",
    accent: "#A855F7",
    accentShimmer: "linear-gradient(135deg, #8B30CC 0%, #A855F7 25%, #C084FC 50%, #A855F7 75%, #8B30CC 100%)",
  },
  "/settings": {
    background: "/bg_piso_naranja.webp",
    surface: "#a85808e7",
    surfaceSolid: "#a85808",
    border: "#e28204cc",
    overlay: "linear-gradient(180deg, rgba(29, 16, 2, 0.65) 0%, rgba(176, 94, 14, 0.4) 15%, transparent 35%, transparent 65%, rgba(176, 94, 14, 0.4) 85%, rgba(29, 16, 23, 0.75) 100%)",
    accent: "#ad7f00",
    accentShimmer: "linear-gradient(135deg, #CC6600 0%, #FF8C00 25%, #FFA500 50%, #FF8C00 75%, #CC6600 100%)",
  },
};

export const DEFAULT_PAGE_THEME = PAGE_THEMES["/dashboard"];

export type PageTheme = typeof PAGE_THEMES[keyof typeof PAGE_THEMES];

export function getPageTheme(pathname: string) {
  const route = Object.keys(PAGE_THEMES).find((href) => pathname.startsWith(href));
  return route ? PAGE_THEMES[route] : DEFAULT_PAGE_THEME;
}
