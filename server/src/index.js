"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var server_1 = require("@apollo/server");
var express4_1 = require("@apollo/server/express4");
var http_1 = require("http");
var drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
var schema_1 = require("@graphql-tools/schema");
var ws_1 = require("ws");
var ws_2 = require("graphql-ws/lib/use/ws");
var graphql_subscriptions_1 = require("graphql-subscriptions");
var express_1 = require("express");
var body_parser_1 = require("body-parser");
var cors_1 = require("cors");
var systeminformation_1 = require("systeminformation");
var uuid_1 = require("uuid");
var typeDefs = "#graphql\n  type SystemData {\n    id: ID!\n    deviceID: String!\n    timestamp: Float!\n    cpuTotal: Float!\n    cpuSys: Float!\n    cpuUser: Float!\n    memUsed: Float!\n    memFree: Float!\n    battPercent: Int!\n    battRemaining: Int\n    battCharging: Boolean!\n    battCycles: Int!\n    processes: [ProcessData]!\n  }\n\n  type ProcessData {\n    name: String!\n    cpu: Float!\n    mem: Float!\n    started: String!\n  }\n\n  type Query {\n    systemData: SystemData\n  }\n\n  type Subscription {\n    systemData: SystemData\n  }\n";
var getUpdatedData = function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        systeminformation_1["default"].system(),
                        systeminformation_1["default"].currentLoad(),
                        systeminformation_1["default"].mem(),
                        systeminformation_1["default"].battery(),
                        systeminformation_1["default"].processes()
                    ]).then(function (results) {
                        return {
                            id: (0, uuid_1.v1)(),
                            deviceID: results[0].uuid,
                            timestamp: Date.now(),
                            cpuTotal: results[1].currentLoad,
                            cpuSys: results[1].currentLoadSystem,
                            cpuUser: results[1].currentLoadUser,
                            memUsed: results[2].used,
                            memFree: results[2].free,
                            battPercent: results[3].percent,
                            battRemaining: results[3].timeRemaining,
                            battCharging: results[3].isCharging,
                            battCycles: results[3].cycleCount,
                            processes: results[4].list.slice(0, 5).map(function (process) { return ({ name: process.name, cpu: process.cpu, mem: process.mem, started: process.started }); })
                        };
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
var pubsub = new graphql_subscriptions_1.PubSub();
var updateData = function () {
    var updatedData = getUpdatedData().then(function (data) { return data; });
    pubsub.publish('DATA_UPDATED', { systemData: updatedData });
    setTimeout(updateData, 5000);
};
var resolvers = {
    Query: {
        systemData: function () { return getUpdatedData().then(function (data) { return data; }); }
    },
    Subscription: {
        systemData: {
            subscribe: function () { return pubsub.asyncIterator(['DATA_UPDATED']); }
        }
    }
};
var schema = (0, schema_1.makeExecutableSchema)({ typeDefs: typeDefs, resolvers: resolvers });
var app = (0, express_1["default"])();
var httpServer = (0, http_1.createServer)(app);
// Creating the WebSocket server
var wsServer = new ws_1.WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: '/graphql'
});
// Hand in the schema we just created and have the
// WebSocketServer start listening.
var serverCleanup = (0, ws_2.useServer)({ schema: schema }, wsServer);
var server = new server_1.ApolloServer({
    schema: schema,
    plugins: [
        // Proper shutdown for the HTTP server.
        (0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer: httpServer }),
        // Proper shutdown for the WebSocket server.
        {
            serverWillStart: function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, {
                                drainServer: function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, serverCleanup.dispose()];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                }
                            }];
                    });
                });
            }
        },
    ]
});
await server.start();
app.use('/graphql', (0, cors_1["default"])(), body_parser_1["default"].json(), (0, express4_1.expressMiddleware)(server));
var PORT = process.env.PORT || 4000;
httpServer.listen(PORT, function () {
    console.log("Server now running on port: ".concat(PORT));
});
// updateData()
