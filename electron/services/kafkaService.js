/**
 * Kafka integration for Electron.
 *
 * Handles producing raw packets and recording events and consumes processed
 * results published by the backend. Consumed results are forwarded to the
 * renderer and accumulated in-memory for full-test retrieval.
 */

const { Kafka, Partitioners } = require('kafkajs');
const timeManager = require('../utils/timeManager');
const BrowserWindow = require('electron').BrowserWindow;

class KafkaService {
    constructor() {
        this.kafka = new Kafka({
            clientId: 'smarthub-electron',
            brokers: ['localhost:9092'],
            retry: { retries: 8, initialRetryTime: 300, maxRetryTime: 3000 }
        });

        this.producer = null;
        this.consumer = null;
        this.isConsumerRunning = false;

        this.RAW_PACKET_TOPIC = 'raw-packets';
        this.PROCESSED_RESULTS_TOPIC = 'processed-results';
        this.RECORDING_EVENTS_TOPIC = 'recording-events';

        // In-memory accumulator of the entire test session (used for full export)
        this.fullTestData = null;
    }

    // Quick TCP check to ensure broker reachable before attempting connect
    async checkKafkaReachable() {
        try {
            const net = require('net');
            return new Promise((resolve) => {
                const socket = net.createConnection({ port: 9092, host: 'localhost', timeout: 2000 });
                socket.on('connect', () => { socket.end(); resolve(true); });
                socket.on('error', () => { resolve(false); });
                socket.on('timeout', () => { socket.destroy(); resolve(false); });
            });
        } catch (error) {
            return false;
        }
    }

    // Initialize producer and consumer, subscribe to processed-results topic
    async initialize() {
        try {
            console.log('⏳ Initializing Kafka connection...');

            const isReachable = await this.checkKafkaReachable();
            if (!isReachable) {
                console.error('❌ Kafka broker not reachable at localhost:9092');
                console.error('   Make sure Redpanda is running: docker-compose up -d');
                return false;
            }

            this.producer = this.kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner, allowAutoTopicCreation: true, retry: { initialRetryTime: 100, retries: 3, maxRetryTime: 1000 } });
            await this.producer.connect();

            this.consumer = this.kafka.consumer({ groupId: 'electron-consumer-group', sessionTimeout: 10000, heartbeatInterval: 2000, maxWaitTimeInMs: 500, rebalanceTimeout: 10000, retry: { initialRetryTime: 100, retries: 3, maxRetryTime: 1000 } });
            await this.consumer.connect();

            await this.consumer.subscribe({ topic: this.PROCESSED_RESULTS_TOPIC, fromBeginning: false });
            this.startConsuming();

            console.log('✅ Kafka fully initialized and ready!');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Kafka:', error.message);
            return false;
        }
    }

    // Send a raw BLE packet (Buffer) to the backend as a JSON message
    async sendRawPacket(packetData, side, deviceId) {
        if (timeManager.isPaused()) return false;
        if (!this.producer) { console.error('Kafka producer not initialized'); return false; }

        try {
            const packetArray = Array.from(packetData);
            const message = { packet: packetArray, side, device_id: deviceId, ts: Date.now() };

            await this.producer.send({ topic: this.RAW_PACKET_TOPIC, messages: [{ key: deviceId, value: JSON.stringify(message), timestamp: Date.now().toString() }] });
            return true;
        } catch (error) {
            console.error('Failed to send raw packet to Kafka:', error);
            return false;
        }
    }

    // Send recording lifecycle events to backend
    async sendEvent(eventData) {
        if (!this.producer) { console.error('Kafka producer not initialized'); return false; }
        try {
            const message = { type: "recording_event", event: eventData, ts: Date.now() };
            await this.producer.send({ topic: this.RECORDING_EVENTS_TOPIC, messages: [{ value: JSON.stringify(message), timestamp: Date.now().toString() }] });
            return true;
        } catch (error) {
            console.error('Failed to send recording event to Kafka:', error);
            return false;
        }
    }

    // Start consuming processed results and forward them to renderer windows
    startConsuming() {
        if (this.isConsumerRunning) return;
        this.isConsumerRunning = true;

        this.consumer.run({ eachMessage: async ({ message }) => {
            try {
                const processedData = JSON.parse(message.value.toString());

                if (processedData.type === 'calibration_complete') {
                    const calibrationService = require('./calibrationService');
                    await calibrationService.endStaticCalibration();
                    if (BrowserWindow) {
                        BrowserWindow.getAllWindows().forEach((win) => { if (win && !win.isDestroyed()) win.webContents.send('calibration-complete', processedData.results); });
                    }
                    return;
                }

                this.sendToFrontend(processedData);
            } catch (error) {
                console.error('Error processing Kafka message:', error);
            }
        }}).catch(error => { console.error('Consumer error:', error); this.isConsumerRunning = false; });
    }

    // Accumulate processed data and relay to renderer windows
    sendToFrontend(processedData) {
        const formattedData = this.formatForFrontend(processedData);
        if (!this.fullTestData) { this.fullTestData = { distance: [], heading: [], velocity: [], trajectory: [] }; }
        this.fullTestData.distance.push(...formattedData.distance);
        this.fullTestData.heading.push(...formattedData.heading);
        this.fullTestData.velocity.push(...formattedData.velocity);
        this.fullTestData.trajectory.push(...formattedData.trajectory);

        if (BrowserWindow) {
            BrowserWindow.getAllWindows().forEach((win) => { if (win && !win.isDestroyed()) win.webContents.send('new-ble-data', { data: formattedData }); });
        }
    }

    // Convert backend processed format to frontend-friendly time-series arrays
    formatForFrontend(processedData) {
        const timeStamps = processedData.time_from_start || [];
        const formattedData = { distance: [], heading: [], velocity: [], trajectory: [] };
        for (let i = 0; i < timeStamps.length; i++) {
            formattedData.distance.push({ time: timeStamps[i], distance: processedData.dist_m?.[i] || 0 });
            formattedData.heading.push({ time: timeStamps[i], heading: processedData.heading_deg?.[i] || 0 });
            formattedData.velocity.push({ time: timeStamps[i], velocity: processedData.velocity?.[i] || 0 });
            formattedData.trajectory.push({ trajectory_x: processedData.trajectory.x[i], trajectory_y: processedData.trajectory.y[i] });
        }
        return formattedData;
    }

    // Return accumulated full test data for export or inspection
    async requestFullTestData() {
        return this.fullTestData || { distance: [], heading: [], velocity: [], trajectory: [] };
    }

    // Graceful shutdown of Kafka clients
    async shutdown() {
        try {
            this.isConsumerRunning = false;
            if (this.consumer) { await this.consumer.disconnect(); console.log('Kafka consumer disconnected'); }
            if (this.producer) { await this.producer.disconnect(); console.log('Kafka producer disconnected'); }
        } catch (error) {
            console.error('Error shutting down Kafka:', error);
        }
    }
}

module.exports = new KafkaService();
