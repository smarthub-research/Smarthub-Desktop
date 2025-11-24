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

    async initializeKafka() {
        // If already initialized, return immediately
        if (this.kafkaInitialized) {
            return true;
        }
        
        // If currently initializing, wait for it to complete
        if (this.kafkaInitializing) {
            console.log('Kafka initialization already in progress, waiting...');
            // Poll until initialization completes (with timeout)
            const startTime = Date.now();
            const timeout = 15000; // 15 second timeout
            while (this.kafkaInitializing && (Date.now() - startTime) < timeout) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.kafkaInitialized;
        }
        
        // Start initialization
        this.kafkaInitializing = true;
        console.log('Initializing Kafka connection...');
        try {
            // Now initialize Electron's Kafka producer/consumer
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
    
    async beginReadingData() {
        noble.stopScanning();

        // Ensure Kafka is ready before starting to read data
        const kafkaReady = await this.ensureKafkaReady();
        if (!kafkaReady) {
            console.error('Cannot begin reading - Kafka is not ready');
            // Still proceed but warn that data won't be processed
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

    async stopReadingData() {
        timeManager.stopRecording();

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        await this.findCharacteristics(false, conn1);
        await this.findCharacteristics(false, conn2);

        // sends stop recording message to kafka
        recordingService.pauseRecording();

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('stop-reading', { elapsedTime: timeManager.getPausedElapsedTime() });
        });
    }

    async findCharacteristics(shouldRecord, peripheral) {
        if (!peripheral) return;
        peripheral.discoverServices([], (error, services) => {
            if (error) {
                console.error(error);
                return;
            }
            services.forEach(service => {
                service.discoverCharacteristics([], (error, characteristics) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    // Prefer the explicit 2a56 notify characteristic, otherwise pick a notify-capable char
                    const targetCharacteristic = characteristics.find(c => c.uuid === "2a56") || characteristics.find(c => c.properties && c.properties.includes('notify'));

                    // Find a writable/control characteristic (used to send activation flag)
                    const writableCharacteristic = characteristics.find(c => c.properties && (c.properties.includes('write') || c.properties.includes('writeWithoutResponse')));

                    if (targetCharacteristic) {
                        if (shouldRecord) {
                            // Await the async subscription (includes activation write)
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
            if (error) {
                console.error('Unsubscribe error:', error);
            }
        });

        if (characteristic._dataCallback) {
            characteristic.off('data', characteristic._dataCallback);
            delete characteristic._dataCallback;
        }

        // If the device expects an explicit deactivation flag, try to write it
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
        // Determine which side this device is (left or right)
        const conn1 = connectionStore.getConnectionOne();
        const side = (peripheral === conn1) ? 'left' : 'right';
        const deviceId = peripheral.id || peripheral.address || 'unknown';

        // Set up data callback FIRST (before subscribing or activating)
        characteristic._dataCallback = async (data) => {
            // Send raw packet to Kafka for backend processing
            if (this.kafkaInitialized) {
                await kafkaService.sendRawPacket(data, side, deviceId);
            } else {
                console.warn('Kafka not initialized - packet dropped');
            }

            // Note: The processed result will come back via Kafka consumer
            // and be sent to frontend automatically by kafkaService.sendToFrontend()
        }

        characteristic.on('data', characteristic._dataCallback);

        // Subscribe to notifications
        characteristic.subscribe((error) => {
            if (error) {
                console.error('Subscribe error:', error);
            }
        });

        // If the device requires an activation write, send it AFTER we're ready to receive
        try {
            if (controlCharacteristic) {
                console.log(`Sending activation byte to ${side} device...`);
                const withoutResponse = controlCharacteristic.properties && controlCharacteristic.properties.includes('writeWithoutResponse');
                const buf = Buffer.from([0x01]);
                controlCharacteristic.write(buf, withoutResponse, (err) => {
                    if (err) {
                        console.error(`Control write (activate) error for ${side}:`, err);
                    } else {
                        console.log(`✓ Activation sent to ${side} device`);
                    }
                });
                // small delay to allow device to process activation
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