export function dummyValidationAPI() {
    return {
        getGraphStateLength: async () => Infinity,
        getTextModeLength: async () => Infinity,
        validateThatGraphPassesTestSuite: async () => true,
    };
}
