export function getDisplayName(entity, lang) {
  if (lang === 'hi' && entity.nameHi) return entity.nameHi;
  if (lang === 'mr' && entity.nameMr) return entity.nameMr;
  return entity.name;
}
