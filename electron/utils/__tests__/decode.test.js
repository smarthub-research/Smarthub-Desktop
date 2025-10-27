const fs = require('fs');
const packets = require('../../../public/packets.json')
const calculationUtils = require("../calculationUtils")
const dataService = require("../../services/dataService")

function bufferFromString(str) {
  // Match everything that looks like hex bytes
  let matches = str.match(/[0-9a-fA-F]{2}/g);
  if (!matches) return Buffer.alloc(0); // empty buffer if nothing found
  matches = matches.slice(1)
  const bytes = matches.map(b => parseInt(b, 16));
  return Buffer.from(bytes);
}

describe("decodeSensorData", () => {
    test("check parsing", () => {
        const byteArrays = packets.byte_arrays
        const decoded = byteArrays.map(bufferFromString);

        let fullAccelData = []
        let fullGyroData = []
        for (let i = 0; i < 11; i++) {
            let accelData = []
            let gyroData = []
            calculationUtils.decodeSensorData(decoded[i], accelData, gyroData)
            fullAccelData.push(accelData)
            fullGyroData.push(gyroData)
        }

        const expectedGyroData = packets.gyro_data.slice(0, 11)
        const expectedAccelData = packets.accel_data.slice(0, 11)

        expect(fullAccelData.length).toStrictEqual(expectedAccelData.length)
        expect(fullGyroData.length).toStrictEqual(expectedGyroData.length)
        expect(fullAccelData).toStrictEqual(expectedAccelData)
        expect(fullGyroData).toStrictEqual(expectedGyroData)
    })

    test("full integeration", async () => {
        // Reset state before test
        calculationUtils.resetState();
        
        const byteArrays = packets.byte_arrays
        const decoded = byteArrays.map(bufferFromString);

        let fullAccelData = []
        let fullGyroData = []
        let allCalcData = []
        
        for (let i = 0; i < decoded.length; i++) {
            let accelData = []
            let gyroData = []
            calculationUtils.decodeSensorData(decoded[i], accelData, gyroData)
            dataService.setLeftData(accelData, gyroData)
            fullAccelData.push(accelData)
            fullGyroData.push(gyroData)

            i += 1

            accelData = []
            gyroData = []
            calculationUtils.decodeSensorData(decoded[i], accelData, gyroData)
            dataService.setRightData(accelData, gyroData)
            fullAccelData.push(accelData)
            fullGyroData.push(gyroData)

            // Only call processPackets once
            const calcData = await dataService.processPackets();
            if (calcData) {
                allCalcData.push(calcData);
            }
        }

        const expectedGyroData = packets.gyro_data
        const expectedAccelData = packets.accel_data

        expect(fullAccelData.length).toStrictEqual(expectedAccelData.length)
        expect(fullGyroData.length).toStrictEqual(expectedGyroData.length)
        expect(fullAccelData).toStrictEqual(expectedAccelData)
        expect(fullGyroData).toStrictEqual(expectedGyroData)
        expect(allCalcData.length).toBeGreaterThan(0)

        console.log(allCalcData.at(-1).distance)
    })
})