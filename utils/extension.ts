export const getExtensionToken = async (): Promise<string | undefined> => {
  if (typeof window === "undefined" || !("chrome" in window)) return undefined;

  return new Promise((resolve) => {
    if (window.chrome?.storage?.local?.get) {
      window.chrome.storage.local.get(
        "authToken",
        (result: { authToken?: string }) => {
          resolve(result?.authToken);
        }
      );
    } else {
      resolve(undefined);
    }
  });
};
