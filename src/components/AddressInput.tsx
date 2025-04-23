'use client'

import { useEffect, useRef, useState } from 'react'

interface AddressInputProps {
    value: string
    onChange: (address: string) => void
    onPlaceSelect?: (place: google.maps.places.PlaceResult) => void
    placeholder?: string
    required?: boolean
    id?: string
}

export default function AddressInput({
    value,
    onChange,
    onPlaceSelect,
    placeholder = 'Enter your address',
    required = false,
    id,
}: AddressInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
    const [isScriptLoaded, setIsScriptLoaded] = useState(false)

    useEffect(() => {
        // Load Google Maps script
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => setIsScriptLoaded(true)
        document.head.appendChild(script)

        return () => {
            document.head.removeChild(script)
        }
    }, [])

    useEffect(() => {
        if (!isScriptLoaded || !inputRef.current) return

        // Initialize autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'ca' }, // Restrict to Canada
        })

        // Add listener for place selection
        autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace()
            if (place && place.formatted_address) {
                onChange(place.formatted_address)
                if (onPlaceSelect) {
                    onPlaceSelect(place)
                }
            }
        })

        return () => {
            if (autocompleteRef.current) {
                google.maps.event.clearInstanceListeners(autocompleteRef.current)
            }
        }
    }, [isScriptLoaded, onChange, onPlaceSelect])

    return (
        <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            id={id}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
        />
    )
} 