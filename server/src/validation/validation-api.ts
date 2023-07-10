export type ValidationAPI = {
  getGraphStateLength: (graphLink: string) => Promise<number | undefined>;
  getTextModeLength: (graphLink: string) => Promise<number | undefined>;
  validateThatGraphPassesTestSuite: (opts: {
    graphLink: string;
    testSuite: string;
  }) => Promise<boolean | undefined>;
};

export function dummyValidationAPI(): ValidationAPI {
  return {
    getGraphStateLength: async () => Infinity,
    getTextModeLength: async () => Infinity,
    validateThatGraphPassesTestSuite: async () => true,
  };
}
