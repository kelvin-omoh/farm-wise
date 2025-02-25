import { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

interface QrScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

export const QrScanner = ({ onScan, onClose }: QrScannerProps) => {
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        // Initialize camera
        const startCamera = async () => {
            try {
                const constraints = {
                    video: {
                        facingMode: 'environment', // Use the back camera if available
                    },
                };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(mediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    await videoRef.current.play();
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                setError('Could not access the camera. Please check permissions.');
            }
        };

        startCamera();

        // Clean up function
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Mock QR code detection for demo purposes
    const simulateQrDetection = () => {
        // Simulate finding a QR code after 1 second
        setTimeout(() => {
            const mockDeviceData = {
                id: 'IOT' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
                type: 'soil_sensor',
                name: 'Soil Sensor',
                location: 'Field A'
            };

            onScan(JSON.stringify(mockDeviceData));
        }, 1000);
    };

    // In a real app, you would implement QR code detection here
    // For now, we'll just use the simulation button

    return (
        <div className="relative">
            <button
                onClick={onClose}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md"
            >
                <FaTimes className="text-gray-700" />
            </button>

            {error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-md aspect-square border-2 border-dashed border-primary rounded-lg overflow-hidden">
                        <video
                            ref={videoRef}
                            className="absolute inset-0 w-full h-full object-cover"
                            playsInline
                            muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3/4 h-3/4 border-2 border-primary border-opacity-50 rounded-lg"></div>
                        </div>
                    </div>

                    <p className="mt-4 text-gray-600 text-center">
                        Position the QR code within the frame to scan
                    </p>

                    {/* For demo purposes, add a button to simulate scanning */}
                    <button
                        onClick={simulateQrDetection}
                        className="mt-4 btn btn-primary"
                    >
                        Simulate QR Detection
                    </button>

                    <p className="mt-2 text-sm text-gray-500">
                        (In a production app, QR codes would be detected automatically)
                    </p>
                </div>
            )}
        </div>
    );
}; 