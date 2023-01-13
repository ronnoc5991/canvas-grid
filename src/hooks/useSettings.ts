import Settings from "../classes/Settings";

let settings: Settings | undefined = undefined;

export default function useSettings() {
  if (settings === undefined) {
    settings = new Settings();
  }

  return settings;
}
