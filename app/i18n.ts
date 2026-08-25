import i18next from "i18next";
import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import ln from "./locales/ln.json";
import pt from "./locales/pt.json";

if (!i18next.isInitialized) {
  void i18next.init({
    lng: "fr",
    fallbackLng: "fr",
    resources: { ar:{translation:ar}, de:{translation:de}, en:{translation:en}, es:{translation:es}, fr:{translation:fr}, ln:{translation:ln}, pt:{translation:pt} },
    interpolation: { escapeValue: false },
    keySeparator: false,
    nsSeparator: false,
  });
}

export default i18next;
