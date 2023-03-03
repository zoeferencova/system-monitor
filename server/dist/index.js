import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import si from 'systeminformation';
import { v1 as uuidv1 } from 'uuid';
const typeDefs = `#graphql
  type SystemData {
    id: ID!
    deviceID: String!
    timestamp: Float!
    cpuTotal: Float!
    cpuSys: Float!
    cpuUser: Float!
    memUsed: Float!
    memFree: Float!
    battPercent: Int!
    battRemaining: Int
    battCharging: Boolean!
    battCycles: Int!
    processes: [ProcessData]!
  }

  type ProcessData {
    name: String!
    cpu: Float!
    mem: Float!
    started: String!
  }

  type Query {
    systemData: SystemData
  }

  type Subscription {
    systemData: SystemData
  }
`;
const getUpdatedData = async function () {
    const data = await Promise.all([
        si.system(),
        si.currentLoad(),
        si.mem(),
        si.battery(),
        si.processes()
    ]).then(results => {
        return {
            id: uuidv1(),
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
            processes: results[4].list.slice(0, 5).map(process => ({ name: process.name, cpu: process.cpu, mem: process.mem, started: process.started }))
        };
    });
    console.log(data);
    return data;
};
const pubsub = new PubSub();
const updateData = () => {
    const updatedData = getUpdatedData().then(data => data);
    pubsub.publish('DATA_UPDATED', { systemData: updatedData });
    // Write data to DB
    setTimeout(updateData, 5000);
};
const resolvers = {
    Query: {
        systemData: () => getUpdatedData().then(data => data)
    },
    Subscription: {
        systemData: {
            subscribe: () => pubsub.asyncIterator(['DATA_UPDATED'])
        },
    },
};
const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
const httpServer = createServer(app);
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);
const server = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ],
});
await server.start();
app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Server now running on port: ${PORT}`);
});
// updateData()
