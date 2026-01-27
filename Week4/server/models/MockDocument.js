// server/models/MockDocument.js
// In-memory mock for Mongoose Document Model

let mockStorage = [];

class MockDocument {
    constructor(data) {
        this.data = { ...data, _id: Date.now().toString(), uploadedAt: new Date() };
    }

    async save() {
        mockStorage.push(this.data);
        return this.data;
    }

    static async find(query, projection) {
        // Very simple mock find - returns everything or filters by simple key match
        // Ignoring projection for simplicity
        return mockStorage;
    }
}

module.exports = MockDocument;
