"use client"

import { QRCodeCanvas } from "qrcode.react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function QRCode({ response }: { response: any }) {
    return (
        <QRCodeCanvas
            size={200}
            value={`${process.env.NEXT_PUBLIC_APP_URL}/api/add/${response?.slug}`}
            className="w-full"
        />
    )

}