import { useState } from 'react';
import { FaQrcode, FaDownload, FaCopy } from 'react-icons/fa';

const QRCodeGenerator = () => {
    const [deviceId, setDeviceId] = useState('IOT1234');
    const [showQR, setShowQR] = useState(false);
    const [qrSize, setQrSize] = useState(250);
    const [copySuccess, setCopySuccess] = useState('');

    const generateQRCode = () => {
        // Generate QR code URL using Google Charts API
        const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(deviceId)}&chs=${qrSize}x${qrSize}&choe=UTF-8`;
        return qrCodeUrl;
    };

    const handleCopyDeviceId = () => {
        navigator.clipboard.writeText(deviceId)
            .then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                setCopySuccess('Failed to copy');
            });
    };

    const handleDownloadQR = () => {
        const link = document.createElement('a');
        link.href = generateQRCode();
        link.download = `qrcode-${deviceId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateRandomDeviceId = () => {
        const prefix = 'IOT';
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setDeviceId(`${prefix}${randomNum}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <div className="flex items-center mb-4">
                <FaQrcode className="text-primary mr-3 text-xl" />
                <h2 className="text-xl font-semibold">QR Code Generator (For Testing)</h2>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            This tool is for testing the QR code scanner. Generate a QR code, then scan it with the device registration scanner.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Device ID</label>
                        <div className="flex">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={deviceId}
                                onChange={(e) => setDeviceId(e.target.value)}
                                placeholder="Enter device ID"
                            />
                            <button
                                className="btn btn-square btn-outline ml-2"
                                onClick={handleCopyDeviceId}
                                title="Copy Device ID"
                            >
                                <FaCopy />
                            </button>
                        </div>
                        {copySuccess && (
                            <p className="text-xs text-success mt-1">{copySuccess}</p>
                        )}
                    </div>

                    <div>
                        <label className="label">QR Code Size</label>
                        <div className="flex items-center">
                            <input
                                type="range"
                                min="100"
                                max="400"
                                value={qrSize}
                                onChange={(e) => setQrSize(parseInt(e.target.value))}
                                className="range range-primary w-full"
                            />
                            <span className="ml-2 text-sm">{qrSize}px</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowQR(true)}
                    >
                        Generate QR Code
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={generateRandomDeviceId}
                    >
                        Generate Random ID
                    </button>
                    {showQR && (
                        <>
                            <button
                                className="btn btn-outline"
                                onClick={handleDownloadQR}
                            >
                                <FaDownload className="mr-2" /> Download QR
                            </button>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowQR(false)}
                            >
                                Hide QR Code
                            </button>
                        </>
                    )}
                </div>

                {showQR && (
                    <div className="mt-4 flex flex-col items-center p-4 border border-gray-200 rounded-lg">
                        <img
                            src={generateQRCode()}
                            alt="QR Code"
                            className="border-2 border-gray-200 rounded-md"
                        />
                        <p className="mt-4 text-sm text-gray-600">Device ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{deviceId}</span></p>
                        <p className="mt-2 text-sm text-gray-600">Scan this QR code with the device registration scanner</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCodeGenerator; 