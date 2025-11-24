const { Kafka, Partitioners } = require('kafkajs');
const timeManager = require('../utils/timeManager');
const BrowserWindow = require('electron').BrowserWindow;

class KafkaService {
    constructor() {
        this.kafka = new Kafka({
            clientId: 'smarthub-electron',
            brokers: ['localhost:9092'],
            retry: {
                retries: 8,
                initialRetryTime: 300,
                maxRetryTime: 3000
            }
        });

        this.producer = null;
        this.consumer = null;
        this.isConsumerRunning = false;
        
        // Topics
        this.RAW_PACKET_TOPIC = 'raw-packets';
        this.PROCESSED_RESULTS_TOPIC = 'processed-results';
        this.RECORDING_EVENTS_TOPIC = 'recording-events';
    }

    async checkKafkaReachable() {
        // Quick TCP connectivity check
        try {
            const net = require('net');
            return new Promise((resolve) => {
                const socket = net.createConnection({ port: 9092, host: 'localhost', timeout: 2000 });
                socket.on('connect', () => {
                    socket.end();
                    resolve(true);
                });
                socket.on('error', () => {
                    resolve(false);
                });
                socket.on('timeout', () => {
                    socket.destroy();
                    resolve(false);
                });
            });
        } catch (error) {
            return false;
        }
    }

    async initialize() {
        try {
            console.log('⏳ Initializing Kafka connection...');
            
            // Quick connectivity check
            const isReachable = await this.checkKafkaReachable();
            if (!isReachable) {
                console.error('❌ Kafka broker not reachable at localhost:9092');
                console.error('   Make sure Redpanda is running: docker-compose up -d');
                return false;
            }
            
            // Initialize producer with legacy partitioner to maintain consistency
            this.producer = this.kafka.producer({
                createPartitioner: Partitioners.LegacyPartitioner,
                allowAutoTopicCreation: true,
                retry: {
                    initialRetryTime: 100,
                    retries: 3,
                    maxRetryTime: 1000
                }
            });
            
            console.log('⏳ Connecting Kafka producer...');
            await this.producer.connect();
            console.log('✓ Kafka producer connected');

            // Initialize consumer
            this.consumer = this.kafka.consumer({ 
                groupId: 'electron-consumer-group',
                sessionTimeout: 10000,
                heartbeatInterval: 2000,
                maxWaitTimeInMs: 500,
                rebalanceTimeout: 10000,
                retry: {
                    initialRetryTime: 100,
                    retries: 3,
                    maxRetryTime: 1000
                }
            });
            
            console.log('⏳ Connecting Kafka consumer...');
            await this.consumer.connect();
            console.log('✓ Kafka consumer connected');

            // Subscribe to processed results topic
            console.log('⏳ Subscribing to topics...');
            await this.consumer.subscribe({ 
                topic: this.PROCESSED_RESULTS_TOPIC,
                fromBeginning: false 
            });
            console.log('✓ Subscribed to topics');
            // Start consuming in background
            this.startConsuming();
            
            console.log('✅ Kafka fully initialized and ready!');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Kafka:', error.message);
            return false;
        }
    }

    async sendRawPacket(packetData, side, deviceId) {
        if (timeManager.isPaused()) {
            return false;
        }
        
        if (!this.producer) {
            console.error('Kafka producer not initialized');
            return false;
        }

        try {
            // Convert Buffer to Array for JSON serialization
            const packetArray = Array.from(packetData);
            
            const message = {
                packet: packetArray,
                side: side,
                device_id: deviceId,
                ts: Date.now()
            };

            await this.producer.send({
                topic: this.RAW_PACKET_TOPIC,
                messages: [
                    {
                        key: deviceId,
                        value: JSON.stringify(message),
                        timestamp: Date.now().toString()
                    }
                ]
            });

            return true;
        } catch (error) {
            console.error('Failed to send raw packet to Kafka:', error);
            return false;
        }
    }

    // Send recording events to backend (restart-recording, pause-recording, end-test)
    async sendEvent(eventData) {
        if (!this.producer) {
            console.error('Kafka producer not initialized');
            return false;
        }

        try {
            const message = {
                type: "recording_event",
                event: eventData,
                ts: Date.now()
            };

            await this.producer.send({
                topic: this.RECORDING_EVENTS_TOPIC,
                messages: [
                    {
                        value: JSON.stringify(message),
                        timestamp: Date.now().toString()
                    }
                ]
            });

            return true;
        } catch (error) {
            console.error('Failed to send recording event to Kafka:', error);
            return false;
        }
    }

    startConsuming() {
        if (this.isConsumerRunning) {
            console.log('Consumer already running');
            return;
        }

        this.isConsumerRunning = true;

        this.consumer.run({
            eachMessage: async ({ message }) => {
                try {
                    const value = message.value.toString();
                    const processedData = JSON.parse(value);

                    // Check if this is a calibration completion event
                    if (processedData.type === 'calibration_complete') {
                        console.log('Calibration completed automatically by backend');
                        // Stop reading data from BLE devices
                        const calibrationService = require('./calibrationService');
                        await calibrationService.endStaticCalibration();
                        // Notify frontend
                        if (BrowserWindow) {
                            BrowserWindow.getAllWindows().forEach((win) => {
                                if (win && !win.isDestroyed()) {
                                    win.webContents.send('calibration-complete', processedData.results);
                                }
                            });
                        }
                        return;
                    }

                    // Send processed data to frontend via Electron IPC
                    this.sendToFrontend(processedData);

                } catch (error) {
                    console.error('Error processing Kafka message:', error);
                }
            }
        }).catch(error => {
            console.error('Consumer error:', error);
            this.isConsumerRunning = false;
        });
    }

    sendToFrontend(processedData) {
        // Check if this is calibration data (shouldn't be sent to graphs)
        if (processedData.type === 'calibration_complete') {
            return; // Don't send calibration events to graph
        }

        // Format data for frontend graphs (matching original dataService format)
        const formattedData = this.formatForFrontend(processedData);

        if (BrowserWindow) {
            BrowserWindow.getAllWindows().forEach((win) => {
                if (win && !win.isDestroyed()) {
                    win.webContents.send('new-ble-data', { data: formattedData });
                }
            });
        }
    }

    formatForFrontend(processedData) {
        // Convert backend format to frontend graph format
        const timeStamps = processedData.time_from_start || [];
        const formattedData = {
            distance: [],
            heading: [],
            velocity: [],
            trajectory: [],
        };

        // Convert arrays to time-series objects for graphs
        for (let i = 0; i < timeStamps.length; i++) {
            formattedData.distance.push({
                time: timeStamps[i],
                distance: processedData.dist_m?.[i] || 0
            });
            formattedData.heading.push({
                time: timeStamps[i],
                heading: processedData.heading_deg?.[i] || 0
            });
            formattedData.velocity.push({
                time: timeStamps[i],
                velocity: processedData.velocity?.[i] || 0
            });
            formattedData.trajectory.push({
                trajectory_x: processedData.trajectory.x[i],
                trajectory_y: processedData.trajectory.y[i]
            })

        }

        return formattedData;
    }

    async shutdown() {
        try {
            this.isConsumerRunning = false;
            
            if (this.consumer) {
                await this.consumer.disconnect();
                console.log('Kafka consumer disconnected');
            }
            
            if (this.producer) {
                await this.producer.disconnect();
                console.log('Kafka producer disconnected');
            }
        } catch (error) {
            console.error('Error shutting down Kafka:', error);
        }
    }
}

module.exports = new KafkaService();
