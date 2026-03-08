// Middle East / Lebanon conflict glossary
export const GLOSSARY: Record<string, string> = {
  'UNIFIL': 'United Nations Interim Force in Lebanon — a peacekeeping mission established in 1978 to confirm Israeli withdrawal from Lebanon and restore international peace.',
  'Blue Line': 'The border demarcation between Lebanon and Israel, drawn by the UN in 2000 after Israel\'s withdrawal from southern Lebanon.',
  '1701': 'UN Security Council Resolution 1701 (2006) — ended the July War between Israel and Hezbollah, called for a ceasefire and deployment of Lebanese Army and UNIFIL in southern Lebanon.',
  'Hezbollah': 'Lebanese Shia Islamist political party and militant group, founded in 1982 during the Lebanese Civil War with Iranian support.',
  'UNHCR': 'United Nations High Commissioner for Refugees — the UN agency mandated to aid and protect refugees, forcibly displaced communities, and stateless people.',
  'UNRWA': 'United Nations Relief and Works Agency — provides assistance and protection to Palestine refugees in the Near East.',
  'IRGC': 'Islamic Revolutionary Guard Corps — a branch of Iran\'s armed forces responsible for internal and external security.',
  'IDF': 'Israel Defense Forces — the military forces of the State of Israel.',
  'Hamas': 'Islamic Resistance Movement — a Palestinian militant organization and political party governing the Gaza Strip since 2007.',
  'Houthi': 'Ansar Allah (Houthi movement) — a Zaidi Shia political and armed movement based in Yemen, fighting against the Saudi-led coalition.',
  'ceasefire': 'A temporary or permanent suspension of fighting, typically arranged between opposing sides in a conflict.',
  'ICRC': 'International Committee of the Red Cross — a humanitarian organization that provides protection and assistance to victims of armed conflict.',
  'MSF': 'Médecins Sans Frontières (Doctors Without Borders) — an international humanitarian medical organization providing aid in conflict zones.',
  'IDPs': 'Internally Displaced Persons — people forced to leave their homes but who remain within their country\'s borders.',
  'Dahiyeh': 'The southern suburbs of Beirut, a densely populated area known as a Hezbollah stronghold.',
  'Bekaa': 'The Bekaa Valley in eastern Lebanon, an agricultural region and strategic corridor between Beirut and Damascus.',
  'Golan': 'The Golan Heights — a rocky plateau on the border of Israel, Lebanon, Jordan, and Syria, occupied by Israel since 1967.',
  'Shebaa Farms': 'A disputed territory at the intersection of the Lebanese-Syrian border and the Israeli-occupied Golan Heights.',
  'Taif Agreement': 'The 1989 accord that ended the Lebanese Civil War, restructured the political system to balance power among religious communities.',
  'confessionalism': 'Lebanon\'s political system in which governmental power is distributed among religious communities (Maronite, Sunni, Shia, etc.).',
  'sanctions': 'Economic or diplomatic penalties imposed by countries or international bodies to pressure a nation to change its behavior.',
  'humanitarian corridor': 'A temporary demilitarized zone established to allow the safe passage of civilians and aid during armed conflict.',
  'airstrike': 'An attack carried out by military aircraft, drones, or missiles against ground targets.',
  'ICC': 'International Criminal Court — a permanent international court established to prosecute individuals for genocide, war crimes, and crimes against humanity.',
  'ICJ': 'International Court of Justice — the principal judicial organ of the United Nations, settling disputes between states.',
  'NATO': 'North Atlantic Treaty Organization — a military alliance of 31 countries from North America and Europe.',
  'OPCW': 'Organisation for the Prohibition of Chemical Weapons — the international body overseeing the Chemical Weapons Convention.',
  'WFP': 'World Food Programme — the UN agency fighting hunger and providing food assistance in emergencies.',
};

// Match glossary terms in text (case-insensitive, whole word for short terms)
export function findGlossaryTerms(text: string): Array<{ term: string; definition: string; index: number }> {
  const results: Array<{ term: string; definition: string; index: number }> = [];
  const lower = text.toLowerCase();

  for (const [term, definition] of Object.entries(GLOSSARY)) {
    const termLower = term.toLowerCase();
    // For short terms (<=4 chars like IDF, ICC), match whole word only
    const pattern = term.length <= 4
      ? new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      : new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    let match;
    while ((match = pattern.exec(text)) !== null) {
      results.push({ term, definition, index: match.index });
      break; // Only first occurrence
    }
  }

  return results.sort((a, b) => a.index - b.index);
}
