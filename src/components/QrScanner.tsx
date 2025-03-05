import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { FaCamera, FaTimes } from 'react-icons/fa'

interface QrScannerProps {
    onScanSuccess: (decodedText: string) => void
    onClose: () => void
}

export const QrScanner = ({ onScanSuccess, onClose }: QrScannerProps) => {
    const [error, setError] = useState<string | null>(null)
    const [scanning, setScanning] = useState(false)
    const [permissionRequested, setPermissionRequested] = useState(false)
    const scannerRef = useRef<Html5Qrcode | null>(null)

    useEffect(() => {
        const startScanner = async () => {
            try {
                setScanning(true)
                setError(null)

                // First check if camera permissions are available
                try {
                    await navigator.mediaDevices.getUserMedia({ video: true });
                    setPermissionRequested(true);
                } catch (err) {
                    console.error('Camera permission error:', err);
                    setError('Camera permission denied. Please allow camera access in your browser settings.');
                    setScanning(false);
                    return;
                }

                const qrCodeId = 'qr-reader'
                const qrCodeContainer = document.getElementById(qrCodeId)

                if (!qrCodeContainer) {
                    setError('QR scanner container not found')
                    setScanning(false)
                    return
                }

                // Create a new scanner instance
                scannerRef.current = new Html5Qrcode(qrCodeId)

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                }

                await scannerRef.current.start(
                    { facingMode: 'environment' },
                    config,
                    (decodedText) => {
                        console.log('QR Code scanned successfully:', decodedText);
                        onScanSuccess(decodedText)

                        // Safely stop the scanner
                        if (scannerRef.current && scannerRef.current.isScanning) {
                            scannerRef.current.stop().catch(err => console.error('Error stopping QR scanner:', err))
                        }

                        onClose()
                    },
                    (errorMessage) => {
                        // QR code scanning errors are expected during scanning, so we don't need to show them
                        console.log(errorMessage)
                    }
                )
            } catch (err) {
                console.error('Error starting QR scanner:', err)
                setError('Could not access the camera. Please check permissions and try again.')
                setScanning(false)
            }
        }

        startScanner()

        return () => {
            // Safely clean up the scanner on unmount
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.error('Error stopping QR scanner on unmount:', err))
            }
        }
    }, [onScanSuccess, onClose])

    const handleClose = () => {
        // Safely stop the scanner before closing
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(err => console.error('Error stopping QR scanner on close:', err))
        }
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <FaCamera className="mr-2" /> Scan Device QR Code
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes />
                    </button>
                </div>

                {error ? (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                                {!permissionRequested && (
                                    <div className="mt-2">
                                        <p className="text-sm text-red-700">
                                            Please ensure you've granted camera permissions in your browser settings.
                                        </p>
                                        <button
                                            className="mt-2 btn btn-sm btn-primary"
                                            onClick={() => {
                                                setError(null);
                                                setPermissionRequested(false);
                                                navigator.mediaDevices.getUserMedia({ video: true })
                                                    .then(() => {
                                                        setPermissionRequested(true);
                                                        window.location.reload();
                                                    })
                                                    .catch(err => {
                                                        console.error('Camera permission error:', err);
                                                        setError('Camera permission denied. Please allow camera access in your browser settings.');
                                                    });
                                            }}
                                        >
                                            Request Camera Permission
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div id="qr-reader" style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}></div>
                        {scanning && (
                            <p className="mt-4 text-sm text-gray-600">
                                Position the QR code within the frame to scan
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
} 