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
    getGraphStateLength: async () => 999999999,
    getTextModeLength: async () => 999999999,
    validateThatGraphPassesTestSuite: async () => true,
  };
}
