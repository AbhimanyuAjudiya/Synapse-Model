"use client"
import { Slider } from "@/components/ui/slider"

interface SliderHoursProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function SliderHours({ value, onChange, min = 0.25, max = 24, step = 0.25 }: SliderHoursProps) {
  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`
    }
    return `${hours}h`
  }

  return (
    <div className="space-y-3">
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatHours(min)}</span>
        <span className="font-medium text-foreground">{formatHours(value)}</span>
        <span>{formatHours(max)}</span>
      </div>
    </div>
  )
}
