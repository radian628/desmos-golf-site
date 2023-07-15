export function dummyValidationAPI() {
    return {
        getGraphStateLength: async () => 999999999,
        getTextModeLength: async () => 999999999,
        validateThatGraphPassesTestSuite: async () => true,
    };
}
