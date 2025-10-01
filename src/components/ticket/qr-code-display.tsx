import Image from 'next/image';

interface QrCodeDisplayProps {
  value: string; // The actual data to be encoded in a real QR code
  size?: number;
}

export default function QrCodeDisplay({ value, size = 120 }: QrCodeDisplayProps) {
  // Use a public QR code generation API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div className="p-2 bg-white rounded-md shadow-sm inline-block" title={`QR Code for: ${value}`}>
      <Image
        src={qrCodeUrl}
        alt={`QR Code for ticket: ${value}`}
        width={size}
        height={size}
        data-ai-hint="qr code"
      />
    </div>
  );
}
