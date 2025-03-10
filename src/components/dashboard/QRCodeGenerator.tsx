import { useState } from 'react';

const QRCodeGenerator = () => {
    const [deviceId, setDeviceId] = useState('IOT1234');
    const [showQR, setShowQR] = useState(false);

    const generateQRCode = () => {
        // Generate QR code URL using Google Charts API
        const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(deviceId)}&chs=250x250&choe=UTF-8`;
        return qrCodeUrl;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">QR Code Generator (For Testing)</h2>
            <div className="flex flex-col gap-4">
                <div>
                    <label className="label">Device ID</label>
                    <input
                        type="text"
                        className="input input-bordered w-full max-w-xs"
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                        placeholder="Enter device ID"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowQR(true)}
                    >
                        Generate QR Code
                    </button>
                    {showQR && (
                        <button
                            className="btn btn-ghost"
                            onClick={() => setShowQR(false)}
                        >
                            Hide QR Code
                        </button>
                    )}
                </div>
                {showQR && (
                    <div className="mt-4 flex flex-col items-center">
                        <img
                            src={generateQRCode()}
                            alt="QR Code"
                            className="border-2 border-gray-200 rounded-md"
                        />
                        <p className="mt-2 text-sm text-gray-600">Scan this QR code with the device registration scanner</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCodeGenerator; 