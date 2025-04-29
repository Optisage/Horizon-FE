interface Window {
  chrome?: {
    runtime?: {
      id: string;
    };
    storage?: {
      local?: {
        get: (
          keys: string | string[] | object | null,
          callback?: (items: {
            [key: string]: string | number | boolean | object;
          }) => void
        ) => void;
        set: (items: object, callback?: () => void) => void;
        remove: (keys: string | string[], callback?: () => void) => void;
      };
    };
  };
}

