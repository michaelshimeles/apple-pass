"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PassSelector({ defaultPassId, userPasses }: { defaultPassId: number | undefined, userPasses: { id: number, name: string }[] }) {
    const [selectedPassId, setSelectedPassId] = useState<string | undefined>(defaultPassId?.toString())
    const path = usePathname()
    const router = useRouter()

    const handlePassChange = (value: string) => {
        setSelectedPassId(value)
    }

    useEffect(() => {
        if (selectedPassId) {
            router.push(path + `?passId=${selectedPassId}`)
        } 

    }, [selectedPassId, path])


    return (
        <Select defaultValue={defaultPassId?.toString()} onValueChange={(value) => {
            handlePassChange(value)
        }}>
            <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a pass" />
            </SelectTrigger>
            <SelectContent >
                {userPasses.map((pass) => (
                    <SelectItem key={pass.id} value={pass.id.toString()}>
                        {pass.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}