import { Minus, Plus } from 'lucide-react'
import React from 'react'

export default function QTY({ quantity, setQuantity }: { quantity: number, setQuantity: (quantity: number) => void }) {
    return (
        <div>
            <div className="flex items-center gap-3">
                <div className="flex items-center overflow-hidden gap-2">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer bg-[#F9F9F9] rounded-full p-2"
                    >
                        <Minus color="#141B34" />
                    </button>
                    <span className="w-20 text-center font-semibold text-black bg-[#F9F9F9] py-1.5 px-8 rounded-4xl">
                        {quantity}
                    </span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer bg-[#F9F9F9] rounded-full p-2"
                    >
                        <Plus />
                    </button>
                </div>
            </div>
        </div>
    )
}
