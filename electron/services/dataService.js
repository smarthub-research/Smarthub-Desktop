/**
 * BLE data coordination service.
 *
 * Responsible for: initializing Kafka from the renderer flow, managing BLE
 * subscriptions, and forwarding raw packets to the backend via Kafka.
 *
 * The class is intentionally a thin orchestration layer; processing occurs
 * in the Python backend which receives raw packets from Kafka.
 */

const noble = require("@abandonware/noble")
const BrowserWindow = require('electron').BrowserWindow;
const timeManager = require("../utils/timeManager")
const connectionStore = require('../utils/connectionStore')
const kafkaService = require('./kafkaService')
const recordingService = require('./recordingService')

class DataService {
    constructor() {
        this.kafkaInitialized = false;
        this.kafkaInitializing = false;
    }

    // Initialize Kafka producer/consumer if not already ready
    async initializeKafka() {
        if (this.kafkaInitialized) return true;

        if (this.kafkaInitializing) {
            // Wait until existing initialization attempt completes
            const startTime = Date.now();
            const timeout = 15000; // 15s
            while (this.kafkaInitializing && (Date.now() - startTime) < timeout) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.kafkaInitialized;
        }

        this.kafkaInitializing = true;
        console.log('Initializing Kafka connection...');
        try {
            this.kafkaInitialized = await kafkaService.initialize();
            if (this.kafkaInitialized) {
                console.log('✓ Kafka initialized successfully');
            } else {
                console.warn('✗ Kafka initialization failed - data will not be processed');
            }
        } catch (error) {
            console.error('✗ Kafka initialization error:', error);
            this.kafkaInitialized = false;
        } finally {
            this.kafkaInitializing = false;
        }

        return this.kafkaInitialized;
    }

    async ensureKafkaReady() {
        if (!this.kafkaInitialized) {
            console.log('Kafka not ready, initializing now...');
            await this.initializeKafka();
        }
        return this.kafkaInitialized;
    }

    // Begin BLE data reading and forward packets to backend
    async beginReadingData() {
        noble.stopScanning();

        const kafkaReady = await this.ensureKafkaReady();
        if (!kafkaReady) {
            console.error('Cannot begin reading - Kafka is not ready');
            // Continue reading locally but packets will be dropped
        }

        timeManager.beginRecording();
        recordingService.startRecording();

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        await this.findCharacteristics(true, conn1);
        await this.findCharacteristics(true, conn2);

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('begin-reading', { startTime: timeManager.getRecordingStartTime() });
        });
    }

    // Stop BLE subscriptions and pause recording
    async stopReadingData() {
        timeManager.stopRecording();

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        await this.findCharacteristics(false, conn1);
        await this.findCharacteristics(false, conn2);

        recordingService.pauseRecording();

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('stop-reading', { elapsedTime: timeManager.getPausedElapsedTime() });
        });
    }

    // Discover characteristics and subscribe/unsubscribe as requested
    async findCharacteristics(shouldRecord, peripheral) {
        if (!peripheral) return;
        peripheral.discoverServices([], (error, services) => {
            if (error) { console.error(error); return; }
            services.forEach(service => {
                service.discoverCharacteristics([], (error, characteristics) => {
                    if (error) { console.error(error); return; }

                    // Prefer the known notify characteristic '2a56', otherwise pick any notify-capable char
                    const targetCharacteristic = characteristics.find(c => c.uuid === "2a56") || characteristics.find(c => c.properties && c.properties.includes('notify'));

                    // Find a writable/control characteristic used to activate/deactivate streaming
                    const writableCharacteristic = characteristics.find(c => c.properties && (c.properties.includes('write') || c.properties.includes('writeWithoutResponse')));

                    if (targetCharacteristic) {
                        if (shouldRecord) {
                            this.subscribeToCharacteristics(targetCharacteristic, peripheral, writableCharacteristic).catch(err => {
                                console.error('Error during subscribe:', err);
                            });
                        } else {
                            this.unsubscribeToCharacteristics(targetCharacteristic, writableCharacteristic);
                        }
                    }
                });
            })
        })
    }

    unsubscribeToCharacteristics(characteristic, controlCharacteristic) {
        characteristic.unsubscribe((error) => {
            if (error) { console.error('Unsubscribe error:', error); }
        });

        if (characteristic._dataCallback) {
            characteristic.off('data', characteristic._dataCallback);
            delete characteristic._dataCallback;
        }

        // Try to send a deactivation write if supported
        try {
            if (controlCharacteristic) {
                const withoutResponse = controlCharacteristic.properties && controlCharacteristic.properties.includes('writeWithoutResponse');
                const buf = Buffer.from([0x00]);
                controlCharacteristic.write(buf, withoutResponse, (err) => {
                    if (err) console.error('Control write (deactivate) error:', err);
                });
            }
        } catch (e) {
            // Non-fatal
        }
    }

    async subscribeToCharacteristics(characteristic, peripheral, controlCharacteristic) {
        const conn1 = connectionStore.getConnectionOne();
        const side = (peripheral === conn1) ? 'left' : 'right';
        const deviceId = peripheral.id || peripheral.address || 'unknown';

        // Data callback must be set before subscribing to avoid race conditions
        characteristic._dataCallback = async (data) => {
            // Forward raw packet to backend only if Kafka is ready
            if (this.kafkaInitialized) {
                await kafkaService.sendRawPacket(data, side, deviceId);
            } else {
                console.warn('Kafka not initialized - packet dropped');
            }
        }

        characteristic.on('data', characteristic._dataCallback);

        // Subscribe to notifications
        characteristic.subscribe((error) => {
            if (error) { console.error('Subscribe error:', error); }
        });

        // If needed, write activation byte after subscription
        try {
            if (controlCharacteristic) {
                console.log(`Sending activation byte to ${side} device...`);
                const withoutResponse = controlCharacteristic.properties && controlCharacteristic.properties.includes('writeWithoutResponse');
                const buf = Buffer.from([0x01]);
                controlCharacteristic.write(buf, withoutResponse, (err) => {
                    if (err) { console.error(`Control write (activate) error for ${side}:`, err); }
                    else { console.log(`✓ Activation sent to ${side} device`); }
                });
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (e) {
            console.warn(`Activation write failed for ${side}, falling back to no activation:`, e);
        }
    }

    async shutdown() {
        // Clean shutdown of Kafka connections
        await kafkaService.shutdown();
    }
}

module.exports = new DataService();